const Report = require('../models/Report');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

const createReport = async (req, res) => {
    try {
        const { month, year } = req.body;
        const userId = req.user._id;

        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year are required' });
        }

        const monthNumber = monthToNumber(month);
        if (monthNumber === undefined) {
            return res.status(400).json({ message: 'Invalid month format' });
        }

        const startDate = new Date(year, monthNumber, 1);
        const endDate = new Date(year, monthNumber + 1, 0);

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

        let report = await Report.findOne({ userId, month, year });

        if (!report) {
            const incomeCategories = processCategories(incomes, req.body.budget?.income || []);
            const expenseCategories = processCategories(expenses, req.body.budget?.expense || []);

            report = new Report({
                userId,
                month,
                year,
                categories: {
                    income: incomeCategories,
                    expense: expenseCategories
                }
            });

            try {
                await report.save();
                return res.status(201).json(report);
            } catch (saveError) {
                console.error('Error saving new report:', saveError);
                return res.status(500).json({ message: 'Server error saving report' });
            }
        } else {
            const incomeCategories = processCategories(incomes, req.body.budget?.income || report.categories.income);
            const expenseCategories = processCategories(expenses, req.body.budget?.expense || report.categories.expense);

            report.categories.income = incomeCategories;
            report.categories.expense = expenseCategories;
            try {
                await report.save();
                return res.json(report);
            } catch (saveError) {
                console.error('Error updating report:', saveError);
                return res.status(500).json({ message: 'Server error updating report' });
            }
        }

    } catch (error) {
        console.error('Error creating report:', error);
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

    items.forEach(item => {
        const current = processedCategories.get(item.category) || 0;
        processedCategories.set(item.category, current + item.amount);
    });

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