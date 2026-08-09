import mongoose from 'mongoose';



// ─── Card Schema ──────────────────────────────────────────────────────────────
const CardSchema = new mongoose.Schema(
  {
    id:        { type: String, required: true },
    name:      { type: String, required: true },
    color:     { type: String, default: '#006b1d' },
    completed: [String],
    progress:  [String],
    pending:   [String]
  },
  { _id: false }
);

// ─── Board Schema ─────────────────────────────────────────────────────────────
const BoardSchema = new mongoose.Schema({
  boardId:   { type: String, default: 'main_board', unique: true },
  cards:     [CardSchema],
  updatedAt: { type: Date, default: Date.now }
});

const TaskBoard = mongoose.model('TaskBoard', BoardSchema);

export default TaskBoard;
