// const User = require("../models/User");
// const SubscriptionHistory = require("../models/SubscriptionHistory");
// const bcrypt = require("bcryptjs");
// const axios = require("axios");

// // --- Helper: Format Date ---
// const formatDate = (date) => {
//   if (!date) return "N/A";
//   return new Date(date).toLocaleDateString("en-IN", {
//     day: "2-digit", month: "short", year: "numeric",
//   });
// };

// // --- Helper: Format Currency ---
// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat("en-IN").format(amount || 0);
// };

// // --- Helper: Calculate Days Difference (Pure Date) ---
// const getDaysDifference = (date1, date2) => {
//   const d1 = new Date(date1);
//   const d2 = new Date(date2);
//   d1.setHours(0, 0, 0, 0);
//   d2.setHours(0, 0, 0, 0);
//   const diffTime = d2 - d1;
//   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
// };

// // --- Helper: Send WhatsApp Message ---
// const sendWhatsAppMessage = async (user, subscription, type = "activation") => {
//   try {
//     if (!user.phoneNumber) {
//       console.log(`WhatsApp Failed: No phone number for ${user.name}`);
//       return false;
//     }

//     // 1. Clean Phone Number
//     let phone = user.phoneNumber.replace(/\D/g, ""); 
//     if (phone.length === 10) phone = "91" + phone;
//     else if (phone.length === 11 && phone.startsWith("0")) phone = "91" + phone.substring(1); 

//     const total = parseFloat(subscription.totalAmount) || 0;
//     const paid = parseFloat(subscription.paidAmount) || 0;
//     const remaining = total - paid;
//     const pkgFee = parseFloat(subscription.packageFee) || 0;

//     const url = `https://icpaas.in/v23.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
//     let templateName = "";
//     let parameters = [];

//     // 2. Configure Templates
//     if (type === "activation") {
//       templateName = "purchaseplan";

//       // Fetch the latest Invoice ID (History) for the link
//       let invoiceLink = "N/A";
//       try {
//         const latestHistory = await SubscriptionHistory.findOne({ user: user._id }).sort({ createdAt: -1 });
//         if (latestHistory && process.env.CLIENT_URL) {
//             invoiceLink = `${process.env.CLIENT_URL}/invoice/${latestHistory._id}`;
//         }
//       } catch (err) {
//         console.error("Error fetching invoice link:", err.message);
//       }

//       // Use billingDate if available, otherwise fallback to startDate or current date
//       const billingDateStr = formatDate(subscription.billingDate || subscription.startDate || new Date());

//       parameters = [
//         { type: "text", text: String(user.name || "Member") },           // {{1}} Name
//         { type: "text", text: String(user.customerId || "N/A") },        // {{2}} Customer ID
//         { type: "text", text: String(subscription.planName || "N/A") },  // {{3}} Plan Name
//         { type: "text", text: String(billingDateStr) },                     // {{5}} Billing Date (UPDATED)
//         { type: "text", text: String(formatDate(subscription.startDate)) }, // {{4}} Start Date
//         { type: "text", text: String(formatDate(subscription.endDate)) },   // {{6}} End Date
//         { type: "text", text: String(subscription.billedBy || "Admin") },   // {{7}} Billed By
//         { type: "text", text: String(formatCurrency(pkgFee)) },             // {{8}} Package Fee
//         { type: "text", text: String(formatCurrency(total)) },              // {{9}} Total
//         { type: "text", text: String(formatCurrency(paid)) },               // {{10}} Paid
//         { type: "text", text: String(formatCurrency(remaining)) },          // {{11}} Due
//         { type: "text", text: String(subscription.paymentMode || "Cash") }, // {{12}} Mode
//         { type: "text", text: String(invoiceLink) },                        // {{13}} Invoice Link
//       ];
//     } else if (type === "reminder") {
//       templateName = "planremainder"; 
//       parameters = [
//         { type: "text", text: String(user.name || "Member") },           // {{1}}
//         { type: "text", text: String(user.customerId || "N/A") },        // {{2}}
//         { type: "text", text: String(subscription.planName || "N/A") },  // {{3}}
//         { type: "text", text: String(formatCurrency(total)) },           // {{4}}
//         { type: "text", text: String(formatCurrency(paid)) },            // {{5}}
//         { type: "text", text: String(formatCurrency(remaining)) },       // {{6}}
//       ];
//     }

//     const payload = {
//       messaging_product: "whatsapp",
//       recipient_type: "individual",
//       to: phone,
//       type: "template",
//       template: {
//         name: templateName,
//         language: { code: "en" }, 
//         components: [{ type: "body", parameters: parameters }],
//       },
//     };

//     console.log(`Sending WhatsApp (${templateName}) to ${phone}...`);
//     const response = await axios.post(url, payload, {
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` },
//     });
//     console.log(`WhatsApp SUCCESS: ID ${response.data.messages?.[0]?.id}`);
//     return true; 
//   } catch (error) {
//     console.error("WhatsApp FAILED:", error.response?.data || error.message);
//     return false;
//   }
// };

// // --- Helper: Check Status & Auto-Send ---
// const checkSubscriptionStatus = async (user) => {
//   if (!user.subscription || !user.subscription.endDate || user.subscription.planStatus === "inactive" || user.subscription.planStatus === "cancelled") {
//     return user;
//   }

//   const now = new Date();
//   const end = new Date(user.subscription.endDate);
//   end.setHours(23, 59, 59, 999);

//   if (now > end) {
//     if (user.subscription.planStatus !== "expired") {
//       user.subscription.planStatus = "expired";
//       user.subscription.lastReminderDate = null;
//       await user.save();
//     }
//     return user;
//   }

//   const diffDays = getDaysDifference(now, end);
//   let needsSave = false;

//   if (diffDays <= 7 && diffDays >= 0) {
//     if (user.subscription.planStatus !== "expiring_soon") {
//       user.subscription.planStatus = "expiring_soon";
//       needsSave = true;
//     }
//   } else {
//     if (user.subscription.planStatus !== "active") {
//       user.subscription.planStatus = "active";
//       needsSave = true;
//     }
//   }

//   // --- AUTO REMINDER LOGIC ---
//   if (diffDays <= 3 && diffDays >= 0) {
//     const todayStr = new Date().toDateString();
//     const lastSentStr = user.subscription.lastReminderDate ? new Date(user.subscription.lastReminderDate).toDateString() : null;

//     if (lastSentStr !== todayStr) {
//       console.log(`Auto-Trigger: Sending reminder to ${user.name} (${diffDays} days left)`);
//       const sent = await sendWhatsAppMessage(user, user.subscription, "reminder");
//       if (sent) {
//         user.subscription.lastReminderDate = new Date();
//         needsSave = true;
//       }
//     }
//   }

//   if (needsSave) await user.save();
//   return user;
// };

// // --- Controllers ---
// const updateSubscription = async (req, res) => {
//   try {
//     const { startDate, endDate, planName, billedBy, packageFee, totalAmount, paidAmount, paymentMode, isActive, billingDate } = req.body;
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (!isActive) {
//       // Handle Cancel
//       const currentHistory = await SubscriptionHistory.findOne({ user: user._id, planStatus: { $in: ["active", "expiring_soon"] } }).sort({ createdAt: -1 });
//       if (currentHistory) { currentHistory.planStatus = "cancelled"; await currentHistory.save(); }
//       user.subscription = { 
//         planStatus: "inactive", startDate: null, endDate: null, planName: "", billedBy: "", 
//         packageFee: 0, totalAmount: 0, paidAmount: 0, paymentMode: "", lastReminderDate: null, 
//         billingDate: null 
//       };
//       await user.save();
//       return res.json(user);
//     }

//     // Handle Active
//     const isEditingCurrentPlan = user.subscription.planStatus === "active" || user.subscription.planStatus === "expiring_soon";
    
//     // Ensure billingDate is set
//     const validBillingDate = billingDate || new Date();

//     const subscriptionData = { 
//         user: user._id, 
//         planName, 
//         startDate, 
//         endDate, 
//         billingDate: validBillingDate, // Save to History
//         billedBy: billedBy || "Admin", 
//         packageFee: packageFee || 0, 
//         totalAmount: totalAmount || 0, 
//         paidAmount: paidAmount || 0, 
//         paymentMode, 
//         planStatus: "active" 
//     };

//     if (isEditingCurrentPlan) {
//       const lastHistory = await SubscriptionHistory.findOne({ user: user._id }).sort({ createdAt: -1 });
//       if (lastHistory) { Object.assign(lastHistory, subscriptionData); await lastHistory.save(); }
//       else { await SubscriptionHistory.create(subscriptionData); }
//     } else {
//       await SubscriptionHistory.create(subscriptionData);
//     }

//     user.subscription = { 
//         planStatus: "active", 
//         startDate, 
//         endDate, 
//         billingDate: validBillingDate, // Save to User
//         planName, 
//         billedBy: billedBy || "Admin", 
//         packageFee: packageFee || 0, 
//         totalAmount: totalAmount || 0, 
//         paidAmount: paidAmount || 0, 
//         paymentMode, 
//         lastReminderDate: null 
//     };
    
//     const updatedUser = await checkSubscriptionStatus(user);
//     await updatedUser.save();
    
//     // Send Welcome (Activation)
//     await sendWhatsAppMessage(updatedUser, updatedUser.subscription, "activation");
//     res.json(updatedUser);
//   } catch (error) { res.status(500).json({ message: error.message }); }
// };

// const sendSubscriptionReminder = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (!user.subscription.planName) return res.status(400).json({ message: "No active subscription found." });

//     console.log(`Manual Trigger: Sending reminder to ${user.name}`);
//     const sent = await sendWhatsAppMessage(user, user.subscription, "reminder");

//     if (sent) {
//       user.subscription.lastReminderDate = new Date();
//       await user.save();
//       res.status(200).json({ message: "Reminder sent successfully" });
//     } else {
//       res.status(500).json({ message: "Failed to send WhatsApp message." });
//     }
//   } catch (error) { res.status(500).json({ message: error.message }); }
// };

// // ... Include other controllers (getAllUsers, createUser, etc.) as provided in previous response
// // Ensure getAllUsers calls checkSubscriptionStatus!
// const getAllUsers = async (req, res) => {
//   try {
//     let users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
//     const updatedUsers = await Promise.all(users.map(async (user) => await checkSubscriptionStatus(user)));
//     res.json(updatedUsers);
//   } catch (error) { res.status(500).json({ message: error.message }); }
// };

// const sendSubscriptionWelcome = async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (!user) return res.status(404).json({ message: "User not found" });
//         await sendWhatsAppMessage(user, user.subscription, "activation");
//         res.status(200).json({ message: "Registration info sent successfully" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const getUserById = async (req, res) => {
//     try {
//         let user = await User.findById(req.params.id).select("-password");
//         if (user) {
//             user = await checkSubscriptionStatus(user);
//             res.json(user);
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const generateCustomerId = async () => {
//     const lastUser = await User.findOne({ customerId: { $exists: true } }, {}, { sort: { createdAt: -1 } });
//     if (lastUser && lastUser.customerId) {
//         const lastIdParts = lastUser.customerId.split("-");
//         const nextId = (parseInt(lastIdParts[1]) + 1).toString().padStart(4, "0");
//         return `HPFS-${nextId}`;
//     }
//     return "HPFS-0001";
// };

// const createUser = async (req, res) => {
//     const { name, phoneNumber, password, role } = req.body;
//     try {
//         const userExists = await User.findOne({ phoneNumber });
//         if (userExists) {
//             return res.status(400).json({ message: "User with this phone number already exists" });
//         }
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
//         const newCustomerId = await generateCustomerId();
//         const userRole = role || "user";
//         const user = await User.create({
//             name,
//             phoneNumber,
//             password: hashedPassword,
//             role: userRole,
//             customerId: newCustomerId,
//             isBlocked: false,
//         });
//         if (user) {
//             res.status(201).json({ _id: user._id });
//         } else {
//             res.status(400).json({ message: "Invalid user data" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const updateUser = async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (user) {
//             user.name = req.body.name || user.name;
//             user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
//             const updatedUser = await user.save();
//             res.json(updatedUser);
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const toggleBlockUser = async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (user) {
//             user.isBlocked = !user.isBlocked;
//             await user.save();
//             res.json({ message: `User status updated`, isBlocked: user.isBlocked });
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const changeUserPassword = async (req, res) => {
//     try {
//         const { password } = req.body;
//         const user = await User.findById(req.params.id);
//         if (user) {
//             const salt = await bcrypt.genSalt(10);
//             user.password = await bcrypt.hash(password, salt);
//             await user.save();
//             res.json({ message: "Password updated successfully" });
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const deleteUser = async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (user) {
//             await user.deleteOne();
//             res.json({ message: "User removed" });
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const getUserHistory = async (req, res) => {
//     try {
//         const history = await SubscriptionHistory.find({
//             user: req.params.id,
//         }).sort({ createdAt: -1 });
//         res.json(history);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const getInvoiceById = async (req, res) => {
//     try {
//         const invoice = await SubscriptionHistory.findById(req.params.id).populate(
//             "user",
//             "name phoneNumber customerId"
//         );
//         if (invoice) {
//             res.json(invoice);
//         } else {
//             res.status(404).json({ message: "Invoice not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// module.exports = {
//     getAllUsers,
//     updateUser,
//     toggleBlockUser,
//     deleteUser,
//     changeUserPassword,
//     createUser,
//     updateSubscription,
//     getUserById,
//     getUserHistory,
//     getInvoiceById,
//     sendSubscriptionReminder,
//     sendSubscriptionWelcome,
// };


// const User = require("../models/User");
// const SubscriptionHistory = require("../models/SubscriptionHistory");
// const bcrypt = require("bcryptjs");
// const axios = require("axios");
// const nodemailer = require("nodemailer"); // Import Nodemailer

// // --- CONFIG: Nodemailer Transporter ---
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// // --- Helper: Format Date ---
// const formatDate = (date) => {
//   if (!date) return "N/A";
//   return new Date(date).toLocaleDateString("en-IN", {
//     day: "2-digit", month: "short", year: "numeric",
//   });
// };

// // --- Helper: Format Currency ---
// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat("en-IN").format(amount || 0);
// };

// // --- Helper: Calculate Days Difference (Pure Date) ---
// const getDaysDifference = (date1, date2) => {
//   const d1 = new Date(date1);
//   const d2 = new Date(date2);
//   d1.setHours(0, 0, 0, 0);
//   d2.setHours(0, 0, 0, 0);
//   const diffTime = d2 - d1;
//   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
// };

// // --- NEW HELPER: Send Admin Email Alert ---
// const sendAdminExpiryAlert = async (user, diffDays) => {
//     try {
//         const mailOptions = {
//             from: `"HP Fitness System" <${process.env.SMTP_USER}>`,
//             to: process.env.SMTP_USER, // Send to Admin
//             subject: `⚠️ Expiry Alert: ${user.name} (ID: ${user.customerId})`,
//             html: `
//                 <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
//                     <h2 style="color: #d32f2f;">Subscription Expiring Soon</h2>
//                     <p>The following user's subscription is expiring in <strong>${diffDays} days</strong>.</p>
                    
//                     <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
//                         <tr>
//                             <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Customer Name:</strong></td>
//                             <td style="padding: 8px; border-bottom: 1px solid #eee;">${user.name}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Customer ID:</strong></td>
//                             <td style="padding: 8px; border-bottom: 1px solid #eee;">${user.customerId}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
//                             <td style="padding: 8px; border-bottom: 1px solid #eee;">${user.phoneNumber}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Plan Name:</strong></td>
//                             <td style="padding: 8px; border-bottom: 1px solid #eee;">${user.subscription.planName}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Expiry Date:</strong></td>
//                             <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatDate(user.subscription.endDate)}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount Due:</strong></td>
//                             <td style="padding: 8px; border-bottom: 1px solid #eee; color: #d32f2f; font-weight: bold;">
//                                 Rs ${formatCurrency(user.subscription.totalAmount - user.subscription.paidAmount)}
//                             </td>
//                         </tr>
//                     </table>

//                     <p style="margin-top: 20px; font-size: 12px; color: #666;">This is an automated message from HP Fitness Studio System.</p>
//                 </div>
//             `
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`Email Alert Sent to Admin for user: ${user.name}`);
//         return true;
//     } catch (error) {
//         console.error("Failed to send Admin Email:", error);
//         return false;
//     }
// };

// // --- Helper: Send WhatsApp Message ---
// const sendWhatsAppMessage = async (user, subscription, type = "activation") => {
//   try {
//     if (!user.phoneNumber) {
//       console.log(`WhatsApp Failed: No phone number for ${user.name}`);
//       return false;
//     }

//     let phone = user.phoneNumber.replace(/\D/g, ""); 
//     if (phone.length === 10) phone = "91" + phone;
//     else if (phone.length === 11 && phone.startsWith("0")) phone = "91" + phone.substring(1); 

//     const total = parseFloat(subscription.totalAmount) || 0;
//     const paid = parseFloat(subscription.paidAmount) || 0;
//     const remaining = total - paid;
//     const pkgFee = parseFloat(subscription.packageFee) || 0;

//     const url = `https://icpaas.in/v23.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
//     let templateName = "";
//     let parameters = [];

//     if (type === "activation") {
//       templateName = "purchaseplan";
//       let invoiceLink = "N/A";
//       try {
//         const latestHistory = await SubscriptionHistory.findOne({ user: user._id }).sort({ createdAt: -1 });
//         if (latestHistory && process.env.CLIENT_URL) {
//             invoiceLink = `${process.env.CLIENT_URL}/invoice/${latestHistory._id}`;
//         }
//       } catch (err) { console.error("Error fetching invoice link:", err.message); }

//       const billingDateStr = formatDate(subscription.billingDate || subscription.startDate || new Date());

//       parameters = [
//         { type: "text", text: String(user.name || "Member") },           
//         { type: "text", text: String(user.customerId || "N/A") },        
//         { type: "text", text: String(subscription.planName || "N/A") },  
//         { type: "text", text: String(billingDateStr) },                     
//         { type: "text", text: String(formatDate(subscription.startDate)) }, 
//         { type: "text", text: String(formatDate(subscription.endDate)) },   
//         { type: "text", text: String(subscription.billedBy || "Admin") },   
//         { type: "text", text: String(formatCurrency(pkgFee)) },             
//         { type: "text", text: String(formatCurrency(total)) },              
//         { type: "text", text: String(formatCurrency(paid)) },               
//         { type: "text", text: String(formatCurrency(remaining)) },          
//         { type: "text", text: String(subscription.paymentMode || "Cash") }, 
//         { type: "text", text: String(invoiceLink) },                        
//       ];
//     } else if (type === "reminder") {
//       templateName = "planremainder"; 
//       parameters = [
//         { type: "text", text: String(user.name || "Member") },           
//         { type: "text", text: String(user.customerId || "N/A") },        
//         { type: "text", text: String(subscription.planName || "N/A") },  
//         { type: "text", text: String(formatCurrency(total)) },           
//         { type: "text", text: String(formatCurrency(paid)) },            
//         { type: "text", text: String(formatCurrency(remaining)) },       
//       ];
//     }

//     const payload = {
//       messaging_product: "whatsapp",
//       recipient_type: "individual",
//       to: phone,
//       type: "template",
//       template: {
//         name: templateName,
//         language: { code: "en" }, 
//         components: [{ type: "body", parameters: parameters }],
//       },
//     };

//     await axios.post(url, payload, {
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` },
//     });
//     return true; 
//   } catch (error) {
//     console.error("WhatsApp FAILED:", error.response?.data || error.message);
//     return false;
//   }
// };

// // --- Helper: Check Status & Auto-Send (EMAIL ADDED HERE) ---
// const checkSubscriptionStatus = async (user) => {
//   if (!user.subscription || !user.subscription.endDate || user.subscription.planStatus === "inactive" || user.subscription.planStatus === "cancelled") {
//     return user;
//   }

//   const now = new Date();
//   const end = new Date(user.subscription.endDate);
//   end.setHours(23, 59, 59, 999);

//   if (now > end) {
//     if (user.subscription.planStatus !== "expired") {
//       user.subscription.planStatus = "expired";
//       user.subscription.lastReminderDate = null;
//       await user.save();
//     }
//     return user;
//   }

//   const diffDays = getDaysDifference(now, end);
//   let needsSave = false;

//   if (diffDays <= 7 && diffDays >= 0) {
//     if (user.subscription.planStatus !== "expiring_soon") {
//       user.subscription.planStatus = "expiring_soon";
//       needsSave = true;
//     }
//   } else {
//     if (user.subscription.planStatus !== "active") {
//       user.subscription.planStatus = "active";
//       needsSave = true;
//     }
//   }

//   // --- AUTO REMINDER LOGIC (WhatsApp + Email) ---
//   if (diffDays <= 3 && diffDays >= 0) {
//     const todayStr = new Date().toDateString();
//     const lastSentStr = user.subscription.lastReminderDate ? new Date(user.subscription.lastReminderDate).toDateString() : null;

//     // Only send if we haven't sent a reminder TODAY
//     if (lastSentStr !== todayStr) {
//       console.log(`Auto-Trigger: Processing 3-day reminder for ${user.name}`);
      
//       // 1. Send WhatsApp to User
//       const waSent = await sendWhatsAppMessage(user, user.subscription, "reminder");
      
//       // 2. Send Email to Admin (NEW ADDITION)
//       const emailSent = await sendAdminExpiryAlert(user, diffDays);

//       if (waSent || emailSent) {
//         user.subscription.lastReminderDate = new Date();
//         needsSave = true;
//       }
//     }
//   }

//   if (needsSave) await user.save();
//   return user;
// };

// // --- Controllers (No changes needed below, just standard exports) ---
// const updateSubscription = async (req, res) => {
//   try {
//     const { startDate, endDate, planName, billedBy, packageFee, totalAmount, paidAmount, paymentMode, isActive, billingDate } = req.body;
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (!isActive) {
//       const currentHistory = await SubscriptionHistory.findOne({ user: user._id, planStatus: { $in: ["active", "expiring_soon"] } }).sort({ createdAt: -1 });
//       if (currentHistory) { currentHistory.planStatus = "cancelled"; await currentHistory.save(); }
//       user.subscription = { 
//         planStatus: "inactive", startDate: null, endDate: null, planName: "", billedBy: "", 
//         packageFee: 0, totalAmount: 0, paidAmount: 0, paymentMode: "", lastReminderDate: null, 
//         billingDate: null 
//       };
//       await user.save();
//       return res.json(user);
//     }

//     const isEditingCurrentPlan = user.subscription.planStatus === "active" || user.subscription.planStatus === "expiring_soon";
//     const validBillingDate = billingDate || new Date();

//     const subscriptionData = { 
//         user: user._id, planName, startDate, endDate, billingDate: validBillingDate,
//         billedBy: billedBy || "Admin", packageFee: packageFee || 0, totalAmount: totalAmount || 0, 
//         paidAmount: paidAmount || 0, paymentMode, planStatus: "active" 
//     };

//     if (isEditingCurrentPlan) {
//       const lastHistory = await SubscriptionHistory.findOne({ user: user._id }).sort({ createdAt: -1 });
//       if (lastHistory) { Object.assign(lastHistory, subscriptionData); await lastHistory.save(); }
//       else { await SubscriptionHistory.create(subscriptionData); }
//     } else {
//       await SubscriptionHistory.create(subscriptionData);
//     }

//     user.subscription = { 
//         planStatus: "active", startDate, endDate, billingDate: validBillingDate,
//         planName, billedBy: billedBy || "Admin", packageFee: packageFee || 0, 
//         totalAmount: totalAmount || 0, paidAmount: paidAmount || 0, paymentMode, lastReminderDate: null 
//     };
    
//     const updatedUser = await checkSubscriptionStatus(user);
//     await updatedUser.save();
    
//     await sendWhatsAppMessage(updatedUser, updatedUser.subscription, "activation");
//     res.json(updatedUser);
//   } catch (error) { res.status(500).json({ message: error.message }); }
// };

// const sendSubscriptionReminder = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (!user.subscription.planName) return res.status(400).json({ message: "No active subscription found." });

//     console.log(`Manual Trigger: Sending reminder to ${user.name}`);
//     const sent = await sendWhatsAppMessage(user, user.subscription, "reminder");

//     if (sent) {
//       user.subscription.lastReminderDate = new Date();
//       await user.save();
//       res.status(200).json({ message: "Reminder sent successfully" });
//     } else {
//       res.status(500).json({ message: "Failed to send WhatsApp message." });
//     }
//   } catch (error) { res.status(500).json({ message: error.message }); }
// };

// const getAllUsers = async (req, res) => {
//   try {
//     let users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
//     // This triggers the email check automatically when you load the dashboard
//     const updatedUsers = await Promise.all(users.map(async (user) => await checkSubscriptionStatus(user)));
//     res.json(updatedUsers);
//   } catch (error) { res.status(500).json({ message: error.message }); }
// };

// const sendSubscriptionWelcome = async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (!user) return res.status(404).json({ message: "User not found" });
//         await sendWhatsAppMessage(user, user.subscription, "activation");
//         res.status(200).json({ message: "Registration info sent successfully" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const getUserById = async (req, res) => {
//     try {
//         let user = await User.findById(req.params.id).select("-password");
//         if (user) {
//             user = await checkSubscriptionStatus(user);
//             res.json(user);
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const generateCustomerId = async () => {
//     const lastUser = await User.findOne({ customerId: { $exists: true } }, {}, { sort: { createdAt: -1 } });
//     if (lastUser && lastUser.customerId) {
//         const lastIdParts = lastUser.customerId.split("-");
//         const nextId = (parseInt(lastIdParts[1]) + 1).toString().padStart(4, "0");
//         return `HPFS-${nextId}`;
//     }
//     return "HPFS-0001";
// };

// const createUser = async (req, res) => {
//     const { name, phoneNumber, password, role } = req.body;
//     try {
//         const userExists = await User.findOne({ phoneNumber });
//         if (userExists) {
//             return res.status(400).json({ message: "User with this phone number already exists" });
//         }
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
//         const newCustomerId = await generateCustomerId();
//         const userRole = role || "user";
//         const user = await User.create({
//             name,
//             phoneNumber,
//             password: hashedPassword,
//             role: userRole,
//             customerId: newCustomerId,
//             isBlocked: false,
//         });
//         if (user) {
//             res.status(201).json({ _id: user._id });
//         } else {
//             res.status(400).json({ message: "Invalid user data" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const updateUser = async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (user) {
//             user.name = req.body.name || user.name;
//             user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
//             const updatedUser = await user.save();
//             res.json(updatedUser);
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const toggleBlockUser = async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (user) {
//             user.isBlocked = !user.isBlocked;
//             await user.save();
//             res.json({ message: `User status updated`, isBlocked: user.isBlocked });
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const changeUserPassword = async (req, res) => {
//     try {
//         const { password } = req.body;
//         const user = await User.findById(req.params.id);
//         if (user) {
//             const salt = await bcrypt.genSalt(10);
//             user.password = await bcrypt.hash(password, salt);
//             await user.save();
//             res.json({ message: "Password updated successfully" });
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const deleteUser = async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (user) {
//             await user.deleteOne();
//             res.json({ message: "User removed" });
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const getUserHistory = async (req, res) => {
//     try {
//         const history = await SubscriptionHistory.find({
//             user: req.params.id,
//         }).sort({ createdAt: -1 });
//         res.json(history);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const getInvoiceById = async (req, res) => {
//     try {
//         const invoice = await SubscriptionHistory.findById(req.params.id).populate(
//             "user",
//             "name phoneNumber customerId"
//         );
//         if (invoice) {
//             res.json(invoice);
//         } else {
//             res.status(404).json({ message: "Invoice not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// module.exports = {
//     getAllUsers,
//     updateUser,
//     toggleBlockUser,
//     deleteUser,
//     changeUserPassword,
//     createUser,
//     updateSubscription,
//     getUserById,
//     getUserHistory,
//     getInvoiceById,
//     sendSubscriptionReminder,
//     sendSubscriptionWelcome,
// };


const User = require("../models/User");
require("dotenv").config();
const SubscriptionHistory = require("../models/SubscriptionHistory");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const nodemailer = require("nodemailer"); // Import Nodemailer

// --- CONFIG: Nodemailer Transporter ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// --- Helper: Format Date ---
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

// --- Helper: Format Currency ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN").format(amount || 0);
};

// --- Helper: Calculate Days Difference (Pure Date) ---
const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = d2 - d1;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// --- NEW HELPER: Send Admin Email Alert ---
const sendAdminExpiryAlert = async (user, diffDays) => {
    try {
        const mailOptions = {
            from: `"HP Fitness System" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to Admin
            subject: `⚠️ Expiry Alert: ${user.name} (ID: ${user.customerId})`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #d32f2f;">Subscription Expiring Soon</h2>
                    <p>The following user's subscription is expiring in <strong>${diffDays} days</strong>.</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Customer Name:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${user.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Customer ID:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${user.customerId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${user.phoneNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Plan Name:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${user.subscription.planName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Expiry Date:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatDate(user.subscription.endDate)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount Due:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #d32f2f; font-weight: bold;">
                                Rs ${formatCurrency(user.subscription.totalAmount - user.subscription.paidAmount)}
                            </td>
                        </tr>
                    </table>

                    <p style="margin-top: 20px; font-size: 12px; color: #666;">This is an automated message from HP Fitness Studio System.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email Alert Sent to Admin for user: ${user.name}`);
        return true;
    } catch (error) {
        console.error("Failed to send Admin Email:", error);
        return false;
    }
};

// --- Helper: Send WhatsApp Message ---
const sendWhatsAppMessage = async (user, subscription, type = "activation") => {
  try {
    if (!user.phoneNumber) {
      console.log(`WhatsApp Failed: No phone number for ${user.name}`);
      return false;
    }

    let phone = user.phoneNumber.replace(/\D/g, ""); 
    if (phone.length === 10) phone = "91" + phone;
    else if (phone.length === 11 && phone.startsWith("0")) phone = "91" + phone.substring(1); 

    const total = parseFloat(subscription.totalAmount) || 0;
    const paid = parseFloat(subscription.paidAmount) || 0;
    const remaining = total - paid;
    const pkgFee = parseFloat(subscription.packageFee) || 0;

    const url = `https://icpaas.in/v23.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
    let templateName = "";
    let parameters = [];

    if (type === "activation") {
      templateName = "purchaseplan";
      let invoiceLink = "N/A";
      try {
        const latestHistory = await SubscriptionHistory.findOne({ user: user._id }).sort({ createdAt: -1 });
        if (latestHistory && process.env.CLIENT_URL) {
            invoiceLink = `${process.env.CLIENT_URL}/invoice/${latestHistory._id}`;
        }
      } catch (err) { console.error("Error fetching invoice link:", err.message); }

      const billingDateStr = formatDate(subscription.billingDate || subscription.startDate || new Date());

      parameters = [
        { type: "text", text: String(user.name || "Member") },           
        { type: "text", text: String(user.customerId || "N/A") },        
        { type: "text", text: String(subscription.planName || "N/A") },  
        { type: "text", text: String(billingDateStr) },                     
        { type: "text", text: String(formatDate(subscription.startDate)) }, 
        { type: "text", text: String(formatDate(subscription.endDate)) },   
        { type: "text", text: String(subscription.billedBy || "Admin") },   
        { type: "text", text: String(formatCurrency(pkgFee)) },             
        { type: "text", text: String(formatCurrency(total)) },              
        { type: "text", text: String(formatCurrency(paid)) },               
        { type: "text", text: String(formatCurrency(remaining)) },          
        { type: "text", text: String(subscription.paymentMode || "Cash") }, 
        { type: "text", text: String(invoiceLink) },                        
      ];
    } else if (type === "reminder") {
      templateName = "planremainder"; 
      parameters = [
        { type: "text", text: String(user.name || "Member") },           
        { type: "text", text: String(user.customerId || "N/A") },        
        { type: "text", text: String(subscription.planName || "N/A") },  
        { type: "text", text: String(formatCurrency(total)) },           
        { type: "text", text: String(formatCurrency(paid)) },            
        { type: "text", text: String(formatCurrency(remaining)) },       
      ];
    }

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" }, 
        components: [{ type: "body", parameters: parameters }],
      },
    };

    await axios.post(url, payload, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` },
    });
    return true; 
  } catch (error) {
    console.error("WhatsApp FAILED:", error.response?.data || error.message);
    return false;
  }
};

// --- Helper: Check Status & Auto-Send (EMAIL ADDED HERE) ---
const checkSubscriptionStatus = async (user) => {
  if (!user.subscription || !user.subscription.endDate || user.subscription.planStatus === "inactive" || user.subscription.planStatus === "cancelled") {
    return user;
  }

  const now = new Date();
  const end = new Date(user.subscription.endDate);
  end.setHours(23, 59, 59, 999);

  if (now > end) {
    if (user.subscription.planStatus !== "expired") {
      user.subscription.planStatus = "expired";
      user.subscription.lastReminderDate = null;
      await user.save();
    }
    return user;
  }

  const diffDays = getDaysDifference(now, end);
  let needsSave = false;

  if (diffDays <= 7 && diffDays >= 0) {
    if (user.subscription.planStatus !== "expiring_soon") {
      user.subscription.planStatus = "expiring_soon";
      needsSave = true;
    }
  } else {
    if (user.subscription.planStatus !== "active") {
      user.subscription.planStatus = "active";
      needsSave = true;
    }
  }

  // --- AUTO REMINDER LOGIC (WhatsApp + Email) ---
  if (diffDays <= 3 && diffDays >= 0) {
    const todayStr = new Date().toDateString();
    const lastSentStr = user.subscription.lastReminderDate ? new Date(user.subscription.lastReminderDate).toDateString() : null;

    // Only send if we haven't sent a reminder TODAY
    if (lastSentStr !== todayStr) {
      console.log(`Auto-Trigger: Processing 3-day reminder for ${user.name}`);
      
      // 1. Send WhatsApp to User (COMMENTED OUT AS REQUESTED)
      // const waSent = await sendWhatsAppMessage(user, user.subscription, "reminder");
      const waSent = false; 
      
      // 2. Send Email to Admin (Stays Active)
      const emailSent = await sendAdminExpiryAlert(user, diffDays);

      if (waSent || emailSent) {
        user.subscription.lastReminderDate = new Date();
        needsSave = true;
      }
    }
  }

  if (needsSave) await user.save();
  return user;
};

// --- Controllers ---
const updateSubscription = async (req, res) => {
  try {
    const { startDate, endDate, planName, billedBy, packageFee, totalAmount, paidAmount, paymentMode, isActive, billingDate } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!isActive) {
      const currentHistory = await SubscriptionHistory.findOne({ user: user._id, planStatus: { $in: ["active", "expiring_soon"] } }).sort({ createdAt: -1 });
      if (currentHistory) { currentHistory.planStatus = "cancelled"; await currentHistory.save(); }
      user.subscription = { 
        planStatus: "inactive", startDate: null, endDate: null, planName: "", billedBy: "", 
        packageFee: 0, totalAmount: 0, paidAmount: 0, paymentMode: "", lastReminderDate: null, 
        billingDate: null 
      };
      await user.save();
      return res.json(user);
    }

    const isEditingCurrentPlan = user.subscription.planStatus === "active" || user.subscription.planStatus === "expiring_soon";
    const validBillingDate = billingDate || new Date();

    const subscriptionData = { 
        user: user._id, planName, startDate, endDate, billingDate: validBillingDate,
        billedBy: billedBy || "Admin", packageFee: packageFee || 0, totalAmount: totalAmount || 0, 
        paidAmount: paidAmount || 0, paymentMode, planStatus: "active" 
    };

    if (isEditingCurrentPlan) {
      const lastHistory = await SubscriptionHistory.findOne({ user: user._id }).sort({ createdAt: -1 });
      if (lastHistory) { Object.assign(lastHistory, subscriptionData); await lastHistory.save(); }
      else { await SubscriptionHistory.create(subscriptionData); }
    } else {
      await SubscriptionHistory.create(subscriptionData);
    }

    user.subscription = { 
        planStatus: "active", startDate, endDate, billingDate: validBillingDate,
        planName, billedBy: billedBy || "Admin", packageFee: packageFee || 0, 
        totalAmount: totalAmount || 0, paidAmount: paidAmount || 0, paymentMode, lastReminderDate: null 
    };
    
    const updatedUser = await checkSubscriptionStatus(user);
    await updatedUser.save();
    
    // Send Welcome (Activation) - AUTOMATIC WHATSAPP COMMENTED OUT
    // await sendWhatsAppMessage(updatedUser, updatedUser.subscription, "activation");
    
    res.json(updatedUser);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const sendSubscriptionReminder = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.subscription.planName) return res.status(400).json({ message: "No active subscription found." });

    console.log(`Manual Trigger: Sending reminder to ${user.name}`);
    const sent = await sendWhatsAppMessage(user, user.subscription, "reminder");

    if (sent) {
      user.subscription.lastReminderDate = new Date();
      await user.save();
      res.status(200).json({ message: "Reminder sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send WhatsApp message." });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllUsers = async (req, res) => {
  try {
    let users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    // This triggers the email check automatically when you load the dashboard
    const updatedUsers = await Promise.all(users.map(async (user) => await checkSubscriptionStatus(user)));
    res.json(updatedUsers);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const sendSubscriptionWelcome = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        await sendWhatsAppMessage(user, user.subscription, "activation");
        res.status(200).json({ message: "Registration info sent successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        let user = await User.findById(req.params.id).select("-password");
        if (user) {
            user = await checkSubscriptionStatus(user);
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateCustomerId = async () => {
    const lastUser = await User.findOne({ customerId: { $exists: true } }, {}, { sort: { createdAt: -1 } });
    if (lastUser && lastUser.customerId) {
        const lastIdParts = lastUser.customerId.split("-");
        const nextId = (parseInt(lastIdParts[1]) + 1).toString().padStart(4, "0");
        return `HPFS-${nextId}`;
    }
    return "HPFS-0001";
};

const createUser = async (req, res) => {
    const { name, phoneNumber, password, role } = req.body;
    try {
        const userExists = await User.findOne({ phoneNumber });
        if (userExists) {
            return res.status(400).json({ message: "User with this phone number already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newCustomerId = await generateCustomerId();
        const userRole = role || "user";
        const user = await User.create({
            name,
            phoneNumber,
            password: hashedPassword,
            role: userRole,
            customerId: newCustomerId,
            isBlocked: false,
        });
        if (user) {
            res.status(201).json({ _id: user._id });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isBlocked = !user.isBlocked;
            await user.save();
            res.json({ message: `User status updated`, isBlocked: user.isBlocked });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const changeUserPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.params.id);
        if (user) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            res.json({ message: "Password updated successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: "User removed" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserHistory = async (req, res) => {
    try {
        const history = await SubscriptionHistory.find({
            user: req.params.id,
        }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInvoiceById = async (req, res) => {
    try {
        const invoice = await SubscriptionHistory.findById(req.params.id).populate(
            "user",
            "name phoneNumber customerId"
        );
        if (invoice) {
            res.json(invoice);
        } else {
            res.status(404).json({ message: "Invoice not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUser,
    toggleBlockUser,
    deleteUser,
    changeUserPassword,
    createUser,
    updateSubscription,
    getUserById,
    getUserHistory,
    getInvoiceById,
    sendSubscriptionReminder,
    sendSubscriptionWelcome,
};