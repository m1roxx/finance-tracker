const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    createIncome,
    getIncomes,
    getIncomeById,
    updateIncome,
    deleteIncome,
} = require('../controllers/incomeController');

router.use(authMiddleware);

router.post('/', createIncome);
router.get('/', getIncomes);
router.get('/:id', getIncomeById);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;