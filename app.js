const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/userRoutes.js');
const incomeRoutes = require('./src/routes/incomeRoutes');
const currencyRoutes = require('./src/routes/currencyRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const categoryBudgetRoutes = require('./src/routes/categoryBudgetRoutes');

const app = express();
const uri = process.env.MONGODB_URI;
const port = process.env.PORT

// db connection
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

app.use(bodyParser.json());
app.use('/api/users', userRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/budgets', categoryBudgetRoutes);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
});
app.get('/incomes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'incomes.html'));
});
app.get('/expenses', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'expenses.html'));
});
app.get('/reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reports.html'));
});
app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.listen(port, () => console.log(`Server running on port ${port}`));