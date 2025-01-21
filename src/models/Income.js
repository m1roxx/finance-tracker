const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    category: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Income = mongoose.model('Income', incomeSchema);
module.exports = Income;