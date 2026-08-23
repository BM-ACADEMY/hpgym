import { Router } from 'express';
import { getBoard, saveBoard, aiUploadBoard } from './taskBoardController.js';

const router = Router();

// GET  /api/taskboard  - Fetch all team cards from MongoDB
router.get('/', getBoard);

// POST /api/taskboard  - Save / Update all team cards to MongoDB
router.post('/', saveBoard);

// POST /api/taskboard/ai-upload - Analyze task card image and populate cards
router.post('/ai-upload', aiUploadBoard);

export default router;
