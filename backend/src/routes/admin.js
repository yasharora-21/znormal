const express = require('express');
const db = require('../db/db');
const { verifyToken, isAdmin } = require('../utils/authMiddleware');

const router = express.Router();

router.use(verifyToken, isAdmin);
router.use((req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden: Admins only' });
  next();
});

router.get('/users', verifyToken, isAdmin, async (req, res) => {
  const [users] = await db.query('SELECT id, email, isAdmin FROM users');
  res.json(users);
});

router.get('/notes', verifyToken, isAdmin, async (req, res) => {
  const [notes] = await db.query('SELECT * FROM notes');
  res.json(notes);
});

router.get('/user/:id/notes',  async (req, res) => {
  const [notes] = await db.query('SELECT * FROM notes WHERE userId = ?', [req.params.id]);
  res.json(notes);
});

router.delete('/user/:id', verifyToken, isAdmin, async (req, res) => {
  await db.query('DELETE FROM notes WHERE userId = ?', [req.params.id]);
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);

  if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User and their notes deleted' });
});

router.put('/user/:id/toggle-admin', async (req, res) => {
  const [userRows] = await db.query('SELECT isAdmin FROM users WHERE id = ?', [req.params.id]);
  if (userRows.length === 0) return res.status(404).json({ message: 'User not found' });

  const currentStatus = userRows[0].isAdmin;
  await db.query('UPDATE users SET isAdmin = ? WHERE id = ?', [!currentStatus, req.params.id]);
  res.json({ message: `User admin status updated to ${!currentStatus}` });
});

module.exports = router;
