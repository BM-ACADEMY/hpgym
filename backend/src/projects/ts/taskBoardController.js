import TaskBoard from './taskBoardModel.js';

// ─── Default Seed Cards ───────────────────────────────────────────────────────
const DEFAULT_CARDS = [
  { id: 'card_mathan', name: 'MATHAN', color: '#006b1d', completed: [], progress: [], pending: [] },
  { id: 'card_asiba',  name: 'ASIBA',  color: '#0038b8', completed: [], progress: [], pending: [] },
  { id: 'card_babi',   name: 'BABI',   color: '#3b0078', completed: [], progress: [], pending: [] },
  { id: 'card_riz',    name: 'RIZ',    color: '#42006b', completed: [], progress: [], pending: [] }
];

// ─── GET /api/taskboard ───────────────────────────────────────────────────────
export const getBoard = async (req, res) => {
  try {
    let board = await TaskBoard.findOne({ boardId: 'main_board' });
    if (!board) {
      board = await TaskBoard.create({ boardId: 'main_board', cards: DEFAULT_CARDS });
    }
    return res.status(200).json(board);
  } catch (err) {
    console.error('TaskBoard GET Error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/taskboard ──────────────────────────────────────────────────────
export const saveBoard = async (req, res) => {
  try {
    const { cards } = req.body;
    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({ error: 'Invalid cards data provided' });
    }
    const board = await TaskBoard.findOneAndUpdate(
      { boardId: 'main_board' },
      { cards, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    return res.status(200).json({ success: true, board });
  } catch (err) {
    console.error('TaskBoard POST Error:', err);
    return res.status(500).json({ error: err.message });
  }
};
