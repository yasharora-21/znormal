const db = require('../db/db');

// 📥 Create Note
exports.createNote = async (note) => {
  const { id, title, content, category, createdAt, userId } = note;
  return await db.query(
    'INSERT INTO notes (id, title, content, category, createdAt, isPinned, userId) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, title, content, category, createdAt, false, userId]
  );
};

// 📋 Get All Notes for User
exports.getNotesByUser = async (userId) => {
  const [rows] = await db.query(
    'SELECT * FROM notes WHERE userId = ? ORDER BY isPinned DESC, createdAt DESC',
    [userId]
  );
  return rows;
};

// 📄 Get Single Note
exports.getNoteById = async (id, userId) => {
  const [rows] = await db.query(
    'SELECT * FROM notes WHERE id = ? AND userId = ?',
    [id, userId]
  );
  return rows[0];
};

// ❌ Delete Note
exports.deleteNote = async (id, userId) => {
  return await db.query(
    'DELETE FROM notes WHERE id = ? AND userId = ?',
    [id, userId]
  );
};

// 📝 Update Note
exports.updateNote = async (id, userId, title, content, category) => {
  return await db.query(
    'UPDATE notes SET title = ?, content = ?, category = ? WHERE id = ? AND userId = ?',
    [title, content, category, id, userId]
  );
};

// 📌 Toggle Pin
exports.togglePin = async (id, userId, newStatus) => {
  return await db.query(
    'UPDATE notes SET isPinned = ? WHERE id = ? AND userId = ?',
    [newStatus, id, userId]
  );
};
