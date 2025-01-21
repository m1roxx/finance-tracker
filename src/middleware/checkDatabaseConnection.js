const mongoose = require('mongoose');

const checkDatabaseConnection = async (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000
            });
            next();
        } catch (error) {
            console.error('Database connection error:', error);
            return res.status(503).json({
                status: 'error',
                message: 'Database is temporarily unavailable. Please try again later.',
                error: {
                    code: 'DATABASE_UNAVAILABLE',
                    details: 'The service is experiencing technical difficulties with the database connection'
                }
            });
        }
    } else {
        next();
    }
};

module.exports = checkDatabaseConnection;