const User = require('../models/User');
const Testimonial = require('../models/Testimonial');
const Gallery = require('../models/Gallery');

// --- Helper: Calculate Date Range based on Filter ---
const getDateRange = (filter) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    if (filter === 'today') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    } else if (filter === 'yesterday') {
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
    } else if (filter === 'month') {
        // Start of current month
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        // End of today
        end.setHours(23, 59, 59, 999);
    } else {
        // Default: Last 12 months
        start.setMonth(start.getMonth() - 11);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
    }

    return { start, end };
};

// @desc    Get Admin Dashboard Stats with Time Filter
// @route   GET /api/dashboard/stats?filter=today|yesterday|month
const getDashboardStats = async (req, res) => {
    try {
        const { filter } = req.query; // 'today', 'yesterday', 'month'
        const { start, end } = getDateRange(filter);

        // 1. Fetch Total Counts (Filtered by Date Range)
        const dateQuery = { createdAt: { $gte: start, $lte: end } };
        
        const [totalUsers, totalTestimonials, totalGallery] = await Promise.all([
            User.countDocuments({ ...dateQuery, role: 'user' }), 
            Testimonial.countDocuments(dateQuery),
            Gallery.countDocuments(dateQuery)
        ]);

        // 2. Aggregate User Status (Show ALL users regardless of filter, as status is current state)
        const userStatusStats = await User.aggregate([
            { $match: { role: 'user' } },
            {
                $group: {
                    _id: "$subscription.planStatus", 
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStatusStats = userStatusStats.map(stat => ({
            name: stat._id ? stat._id.charAt(0).toUpperCase() + stat._id.slice(1) : 'No Plan',
            value: stat.count
        }));

        // 3. Aggregate Graph Data (Dynamic Grouping based on filter)
        let graphGrouping;
        let sortStage = { "_id": 1 };

        if (filter === 'today' || filter === 'yesterday') {
            // Group by Hour (0-23)
            graphGrouping = { 
                $group: { 
                    _id: { $hour: "$createdAt" }, 
                    count: { $sum: 1 } 
                } 
            };
        } else if (filter === 'month') {
            // Group by Day of Month (1-31)
            graphGrouping = { 
                $group: { 
                    _id: { $dayOfMonth: "$createdAt" }, 
                    count: { $sum: 1 } 
                } 
            };
        } else {
            // Group by Month (1-12)
            graphGrouping = {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    count: { $sum: 1 }
                }
            };
            sortStage = { "_id.year": 1, "_id.month": 1 };
        }

        const userGrowthStats = await User.aggregate([
            { $match: { role: 'user', ...dateQuery } },
            graphGrouping,
            { $sort: sortStage }
        ]);

        // Format Graph Data for Recharts
        const formattedGrowthStats = userGrowthStats.map(item => {
            let name;
            if (filter === 'today' || filter === 'yesterday') {
                name = `${item._id}:00`; // e.g., "14:00"
            } else if (filter === 'month') {
                name = `Day ${item._id}`; // e.g., "Day 5"
            } else {
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                name = `${monthNames[item._id.month - 1]} ${item._id.year}`;
            }
            return { name, users: item.count };
        });

        res.json({
            counts: {
                users: totalUsers,
                testimonials: totalTestimonials,
                gallery: totalGallery
            },
            charts: {
                userStatus: formattedStatusStats,
                userGrowth: formattedGrowthStats
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };