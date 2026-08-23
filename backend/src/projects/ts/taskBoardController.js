import TaskBoard from './taskBoardModel.js';

// ─── Default Seed Cards ───────────────────────────────────────────────────────
const DEFAULT_CARDS = [
  { id: 'card_mathan', name: 'MATHAN', color: '#006b1d', today: [], completed: [], progress: [], pending: [], isLeave: false },
  { id: 'card_asiba',  name: 'ASIBA',  color: '#0038b8', today: [], completed: [], progress: [], pending: [], isLeave: false },
  { id: 'card_babi',   name: 'BABI',   color: '#3b0078', today: [], completed: [], progress: [], pending: [], isLeave: false },
  { id: 'card_riz',    name: 'RIZ',    color: '#42006b', today: [], completed: [], progress: [], pending: [], isLeave: false }
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

// ─── POST /api/taskboard/ai-upload ────────────────────────────────────────────
export const aiUploadBoard = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key is not configured on the server' });
    }

    console.log("Analyzing board image using OpenRouter vision model...");

    // Call OpenRouter API using Gemini 2.5 Flash for vision
    const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "nvidia/nemotron-nano-12b-v2-vl:free",
        "max_tokens": 1500,
        "messages": [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "Extract daily tasks from this image. Identify each team member name and their tasks categorized into: 'today' (tasks they plan/need to do today), 'completed' (done), 'progress' (in progress), and 'pending' (paused/delayed/waiting). If the member is marked as on leave or absent, set isLeave to true. Output the results as a JSON array of card objects, where each object has: name (string), today (array of strings), completed (array of strings), progress (array of strings), pending (array of strings), isLeave (boolean). Respond ONLY with the JSON data, no explanations, no markdown wrapper."
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ]
      })
    });

    if (!openrouterRes.ok) {
      const errorText = await openrouterRes.text();
      throw new Error(`OpenRouter API error: ${errorText}`);
    }

    const aiResult = await openrouterRes.json();
    let text = aiResult.choices[0].message.content.trim();
    console.log("Raw AI response:\n", text);
    
    // Robust JSON array extraction: find first '[' and last ']'
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      text = text.substring(firstBracket, lastBracket + 1).trim();
    } else {
      // Fallback: strip markdown blocks if brackets not found
      if (text.includes("```")) {
        const match = text.match(/```(?:json)?([\s\S]*?)```/);
        if (match) {
          text = match[1].trim();
        }
      }
    }
    
    console.log("Extracted JSON string for parsing:\n", text);

    const parsedCards = JSON.parse(text);
    if (!Array.isArray(parsedCards)) {
      throw new Error("AI did not return a valid array of cards");
    }

    // Retrieve the existing board
    let board = await TaskBoard.findOne({ boardId: 'main_board' });
    if (!board) {
      board = await TaskBoard.create({ boardId: 'main_board', cards: DEFAULT_CARDS });
    }

    const currentCards = [...board.cards];

    // Update existing cards or create new ones
    for (const aiCard of parsedCards) {
      if (!aiCard.name) continue;
      const matchedCard = currentCards.find(c => c.name.toUpperCase() === aiCard.name.toUpperCase());
      
      if (matchedCard) {
        matchedCard.today = aiCard.today || [];
        matchedCard.completed = aiCard.completed || [];
        matchedCard.progress = aiCard.progress || [];
        matchedCard.pending = aiCard.pending || [];
        matchedCard.isLeave = !!aiCard.isLeave;
      } else {
        // Create new card
        const newId = `card_${aiCard.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        currentCards.push({
          id: newId,
          name: aiCard.name.toUpperCase(),
          color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'), // random color
          today: aiCard.today || [],
          completed: aiCard.completed || [],
          progress: aiCard.progress || [],
          pending: aiCard.pending || [],
          isLeave: !!aiCard.isLeave
        });
      }
    }

    board.cards = currentCards;
    board.updatedAt = Date.now();
    await board.save();

    return res.status(200).json({ success: true, board });
  } catch (err) {
    console.error('AI Board Upload Error:', err);
    return res.status(500).json({ error: err.message });
  }
};
