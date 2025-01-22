const Income = require('../models/Income');

const createIncome = async (req, res) => {
    try {
        const { description, amount, category } = req.body;
        const userId = req.user._id;

        if (!description || !amount || !category) {
            return res.status(400).json({ message: 'Description, amount, and category are required' });
        }

        const income = new Income({
            description,
            amount,
            category,
            userId
        });

        await income.save();
        res.status(201).json(income);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getIncomes = async (req, res) => {
    try {
        const userId = req.user._id;
        const { category } = req.query;

        const query = { userId };
        if (category) {
            query.category = category;
        }

        const incomes = await Income.find(query)
            .sort({ date: -1 });
        res.json(incomes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getIncomeById = async (req, res) => {
    try {
        const income = await Income.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }

        res.json(income);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateIncome = async (req, res) => {
    try {
        const { description, amount, category } = req.body;

        const income = await Income.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id
            },
            { description, amount, category },
            { new: true }
        );

        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }

        res.json(income);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteIncome = async (req, res) => {
    try {
        const income = await Income.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }

        res.json({ message: 'Income deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createIncome,
    getIncomes,
    getIncomeById,
    updateIncome,
    deleteIncome
};