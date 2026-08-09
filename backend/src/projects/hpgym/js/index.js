import { Router } from 'express';
import { getFitnessAnalysis } from './analytics.js';

const hpgymRouter = Router();

// Test route to verify connection
hpgymRouter.get('/connection-test', (req, res) => {
  res.json({
    success: true,
    message: 'Js connection successful!',
    timestamp: new Date()
  });
});

// Fitness analytics and prediction API
hpgymRouter.post('/fitness-analysis', getFitnessAnalysis);

export default hpgymRouter;
