const Report = require('../models/Report');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

const createReport = async (req, res) => {
    try {
        const { month, year, budget } = req.body;
        const userId = req.user._id;

        if (!month || !year || !budget) {
            return res.status(400).json({ message: 'Month, year, and budget are required' });
        }

        // Get all incomes and expenses for the specified month and year
        const startDate = new Date(year, monthToNumber(month), 1);
        const endDate = new Date(year, monthToNumber(month) + 1, 0);

        const [incomes, expenses] = await Promise.all([
            Income.find({
                userId,
                date: { $gte: startDate, $lte: endDate }
            }),
            Expense.find({
                userId,
                date: { $gte: startDate, $lte: endDate }
            })
        ]);

        // Process incomes by category
        const incomeCategories = processCategories(incomes, budget.income || []);

        // Process expenses by category
        const expenseCategories = processCategories(expenses, budget.expense || []);

        // Calculate remaining budget
        const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
        const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remaining = budget.planned - totalExpense;

        const report = new Report({
            userId,
            month,
            year,
            budget: {
                planned: budget.planned,
                remaining
            },
            categories: {
                income: incomeCategories,
                expense: expenseCategories
            }
        });

        await report.save();
        res.status(201).json(report);
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getReports = async (req, res) => {
    try {
        const userId = req.user._id;
        const reports = await Report.find({ userId }).sort({ year: -1, month: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getReportByMonthYear = async (req, res) => {
    try {
        const { month, year } = req.params;
        const userId = req.user._id;

        const report = await Report.findOne({ userId, month, year });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateReport = async (req, res) => {
    try {
        const { month, year } = req.params;
        const { budget } = req.body;
        const userId = req.user._id;

        const report = await Report.findOneAndUpdate(
            { userId, month, year },
            {
                $set: {
                    'budget.planned': budget.planned,
                    'categories.income': budget.income,
                    'categories.expense': budget.expense
                }
            },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteReport = async (req, res) => {
    try {
        const { month, year } = req.params;
        const userId = req.user._id;

        const report = await Report.findOneAndDelete({ userId, month, year });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper functions
function monthToNumber(month) {
    const months = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
        'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    return months[month];
}

function processCategories(items, plannedCategories) {
    const categoriesMap = new Map(plannedCategories.map(cat => [cat.category, cat.planned]));
    const processedCategories = new Map();

    // Sum actual amounts by category
    items.forEach(item => {
        const current = processedCategories.get(item.category) || 0;
        processedCategories.set(item.category, current + item.amount);
    });

    // Convert to required format
    return Array.from(categoriesMap.entries()).map(([category, planned]) => ({
        category,
        planned,
        actual: processedCategories.get(category) || 0
    }));
}

module.exports = {
    createReport,
    getReports,
    getReportByMonthYear,
    updateReport,
    deleteReport
};