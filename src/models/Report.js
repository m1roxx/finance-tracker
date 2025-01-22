const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    categories: {
        income: [{
            category: { type: String, required: true },
            actual: { type: Number, default: 0 }
        }],
        expense: [{
            category: { type: String, required: true },
            actual: { type: Number, default: 0 }
        }]
    }
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;