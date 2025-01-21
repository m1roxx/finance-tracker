const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkDatabaseConnection = require('../middleware/checkDatabaseConnection');
const {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
} = require('../controllers/expenseController');

router.use(authMiddleware);
router.use(checkDatabaseConnection);

router.post('/', createExpense);
router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;