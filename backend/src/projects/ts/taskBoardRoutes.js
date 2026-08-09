import { Router } from 'express';
import { getBoard, saveBoard } from './taskBoardController.js';

const router = Router();

// GET  /api/taskboard  - Fetch all team cards from MongoDB
router.get('/', getBoard);

// POST /api/taskboard  - Save / Update all team cards to MongoDB
router.post('/', saveBoard);

export default router;
