const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, sequelize } = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/citypoints', require('./routes/cityPointRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`❌ Server error: ${error.message}`);
  }
};
startServer();
