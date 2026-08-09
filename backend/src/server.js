import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import project modules
import hpgymRoutes from './projects/hpgym/js/index.js';

dotenv.config();

// Global variables
const PORT = process.env.PORT || 5050;
const CLIENT_URL = 'http://localhost:5173';

// Connect to MongoDB
connectDB();

const app = express();

// Global Middlewares
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('dev'));
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base Route
app.get('/', (req, res) => {
  res.send('API is running securely...');
});

// Link projects routes
app.use('/api/hpgym', hpgymRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] Running globally on port ${PORT} 🚀`);
});
