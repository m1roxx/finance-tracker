const mongoose = require('mongoose');

const categoryBudgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    plannedAmount: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('CategoryBudget', categoryBudgetSchema);