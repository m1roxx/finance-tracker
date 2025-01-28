const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    createOrUpdateBudget,
    getBudgetByCategory,
    getAllBudgets,
    deleteBudget,
    updateBudget
} = require('../controllers/categoryBudgetController');

router.use(auth);
router.post('/', createOrUpdateBudget);
router.put('/:categoryId', updateBudget);
router.get('/category/:categoryId', getBudgetByCategory);
router.get('/', getAllBudgets);
router.delete('/:categoryId', deleteBudget);

module.exports = router;