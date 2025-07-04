const express = require('express');
const cors = require('cors');
const path = require('path');

const routes = require('./routes/notes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/notes', routes);

app.use(express.static(path.join(__dirname, '../../frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
