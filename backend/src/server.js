import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import project modules
import taskBoardRoutes from './projects/ts/taskBoardRoutes.js';

dotenv.config();

// Global variables
const PORT = process.env.PORT || 442;

// Connect to MongoDB
connectDB();

const app = express();

// Global Middlewares
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('dev'));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Base Route
app.get('/', (req, res) => {
  res.send('API is running securely...');
});

// Link projects routes
app.use('/api/taskboard', taskBoardRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("ts structure runing");
});
