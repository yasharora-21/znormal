const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const { generateToken } = require('../utils/authMiddleware');

// 📝 POST /auth/register
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0)
      return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await db.query('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', [id, email, hashed]);

    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📝 POST /auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔒 GET /auth/profile (protected)
exports.getProfile = (req, res) => {
  res.json({ id: req.user.id, email: req.user.email });
};
