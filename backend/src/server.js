const express = require('express');
const app = express();
const cors = require('cors');
const routes = require('./routes/notes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/admin');
const PORT = process.env.PORT || 3000;

app.use (express.json());
app.use(cors());
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', routes);


app.get('/' ,(req,res) =>{
    res.send('Welcome to the Notes App');
})

app.listen(PORT ,() =>{
    console.log(`server is running at port ${PORT}`)
})