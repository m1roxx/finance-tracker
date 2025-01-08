const Income = require('../models/Income');

const createIncome = async (req, res) => {
    try {
        const { description, amount } = req.body;
        const userId = req.user._id;

        if (!description || !amount) {
            return res.status(400).json({ message: 'Description and amount are required' });
        }

        const income = new Income({
            description,
            amount,
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
        const incomes = await Income.find({ userId })
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
        const { description, amount } = req.body;

        const income = await Income.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id
            },
            { description, amount },
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