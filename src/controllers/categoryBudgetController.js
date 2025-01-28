const CategoryBudget = require('../models/CategoryBudget');

const createOrUpdateBudget = async (req, res) => {
    try {
        const { categoryId, plannedAmount } = req.body;

        if (!categoryId || !plannedAmount) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        let budget = await CategoryBudget.findOne({
            userId: req.user._id,
            category: categoryId
        });

        if (budget) {
            budget.plannedAmount = plannedAmount;
            await budget.save();
        } else {
            budget = new CategoryBudget({
                userId: req.user._id,
                category: categoryId,
                plannedAmount: plannedAmount
            });
            await budget.save();
        }

        res.status(200).json(budget);
    } catch (error) {
        console.error('Error creating/updating budget:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getBudgetByCategory = async (req, res) => {
    try {
        const budget = await CategoryBudget.findOne({
            userId: req.user._id,
            category: decodeURIComponent(req.params.categoryId)
        });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found for this category' });
        }

        res.status(200).json(budget);
    } catch (error) {
        console.error('Error fetching budget:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllBudgets = async (req, res) => {
    try {
        const budgets = await CategoryBudget.find({
            userId: req.user._id
        });

        res.status(200).json(budgets);
    } catch (error) {
        console.error('Error fetching all budgets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteBudget = async (req, res) => {
    try {
        const budget = await CategoryBudget.findOneAndDelete({
            userId: req.user._id,
            category: decodeURIComponent(req.params.categoryId)
        });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.status(200).json({ message: 'Budget successfully deleted' });
    } catch (error) {
        console.error('Error deleting budget:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateBudget = async (req, res) => {
    try {
        const { plannedAmount } = req.body;
        const category = decodeURIComponent(req.params.categoryId);

        const budget = await CategoryBudget.findOneAndUpdate(
            { userId: req.user._id, category },
            { plannedAmount },
            { new: true, runValidators: true }
        );

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.status(200).json(budget);
    } catch (error) {
        console.error('Error updating budget:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createOrUpdateBudget,
    getBudgetByCategory,
    getAllBudgets,
    deleteBudget,
    updateBudget
};