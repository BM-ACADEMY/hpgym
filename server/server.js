const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); // 1. Import Helmet
const morgan = require('morgan'); // 2. Import Morgan
const cors = require('cors');     // 3. Import Cors
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes'); 

dotenv.config();

connectDB();

const app = express();

app.use(helmet()); 

 app.use(morgan('dev'));


app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true, 
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));