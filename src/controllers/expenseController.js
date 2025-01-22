const Expense = require('../models/Expense');

const createExpense = async (req, res) => {
    try {
        const { description, amount, category } = req.body;
        const userId = req.user._id;

        if (!description || !amount || !category) {
            return res.status(400).json({ message: 'Description, amount, and category are required' });
        }

        const expense = new Expense({
            description,
            amount,
            category,
            userId
        });

        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getExpenses = async (req, res) => {
    try {
        const userId = req.user._id;
        const { category } = req.query;

        const query = { userId };
        if (category) {
            query.category = category;
        }

        const expenses = await Expense.find(query)
            .sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateExpense = async (req, res) => {
    try {
        const { description, amount, category } = req.body;

        const expense = await Expense.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id
            },
            { description, amount, category },
            { new: true }
        );

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense
};