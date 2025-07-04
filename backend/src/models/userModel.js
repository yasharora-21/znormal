const db = require('../db/db');

// 🔐 Register User
exports.createUser = async (id, email, hashedPassword) => {
  return await db.query(
    'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
    [id, email, hashedPassword]
  );
};

// 🔓 Find User by Email (for login)
exports.findUserByEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0]; // return single user
};
