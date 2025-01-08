const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/convert', authMiddleware, async (req, res) => {
    try {
        const { amount, fromCurrency, toCurrency } = req.body;
        const response = await fetch(
            `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
            {
                headers: {
                    'apikey': process.env.EXCHANGE_RATE_API_KEY
                }
            }
        );

        const data = await response.json();
        const rate = data.rates[toCurrency];
        const result = (amount * rate).toFixed(2);

        res.json({ result });
    } catch (error) {
        console.error('Currency conversion error:', error);
        res.status(500).json({ message: 'Failed to convert currency' });
    }
});

module.exports = router;