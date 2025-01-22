const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkDatabaseConnection = require('../middleware/checkDatabaseConnection');
const {
    createReport,
    getReports,
    getReportByMonthYear,
    updateReport,
    deleteReport
} = require('../controllers/reportController');

router.use(authMiddleware);
router.use(checkDatabaseConnection);

router.post('/', createReport);
router.get('/', getReports);
router.get('/:month/:year', getReportByMonthYear);
router.put('/:month/:year', updateReport);
router.delete('/:month/:year', deleteReport);

module.exports = router;