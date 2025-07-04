const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const { verifyToken } = require('../utils/authMiddleware');

const router = express.Router();

router.use(verifyToken);

// 🔽 Get all notes
router.get('/notes', async (req, res) => {
  const [notes] = await db.query('SELECT * FROM notes WHERE userId = ?', [req.user.id]);
  res.json(notes);
});

// ⬆️ Create note
router.post('/notes', async (req, res) => {
  const { title, content, category } = req.body;
  const id = uuidv4();
  const createdAt = new Date();

  await db.query(
    'INSERT INTO notes (id, title, content, category, createdAt, isPinned, userId) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, title, content, category, createdAt, false, req.user.id]
  );

  res.status(201).json({ message: 'Note added successfully', id });
});

// 📄 Get single note
router.get('/note/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM notes WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Note not found' });
  res.json(rows[0]);
});

// ❌ Delete note
router.delete('/note/:id', async (req, res) => {
  const [result] = await db.query('DELETE FROM notes WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Note not found' });
  res.json({ message: 'Note deleted' });
});

// ✏️ Update note
router.put('/note/:id', async (req, res) => {
  const { title, content, category } = req.body;
  const [result] = await db.query(
    'UPDATE notes SET title = ?, content = ?, category = ? WHERE id = ? AND userId = ?',
    [title, content, category, req.params.id, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Note not found' });
  res.json({ message: 'Note updated' });
});

// 📌 Toggle pin
router.put('/note/:id/pin', async (req, res) => {
  const [rows] = await db.query('SELECT isPinned FROM notes WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Note not found' });

  const current = rows[0].isPinned;
  await db.query('UPDATE notes SET isPinned = ? WHERE id = ? AND userId = ?', [!current, req.params.id, req.user.id]);
  res.json({ message: 'Pin status toggled' });
});

module.exports = router;
