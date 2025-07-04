const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret123'; // same as above

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Check if user is admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
}

module.exports = { verifyToken, isAdmin };
