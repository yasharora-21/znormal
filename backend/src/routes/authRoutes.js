const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');

const JWT_SECRET = 'secret123'; // 👈 change this in prod

// 🔐 Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const id = uuidv4();

  try {
    await db.query('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', [id, email, hashed]);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// 🔓 Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

  if (!users.length) return res.status(400).json({ message: 'Invalid email or password' });

  const user = users[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid email or password' });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

module.exports = router;
