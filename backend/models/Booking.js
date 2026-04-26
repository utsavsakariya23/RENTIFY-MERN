const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
  booking_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  car_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_days: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  pickup_location: {
    type: DataTypes.STRING(100)
  },
  drop_location: {
    type: DataTypes.STRING(100)
  },
  is_permanent_location: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  final_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  coupon_code: {
    type: DataTypes.STRING(50)
  },
  payment_method: {
    type: DataTypes.STRING(50),
    defaultValue: 'Cash'
  },
  payment_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Unpaid' // Unpaid, Paid, Refunded
  },
  booking_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Pending' // Pending, Confirmed, Completed, Cancelled
  },
  transaction_id: {
    type: DataTypes.STRING(100)
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'bookings',
  timestamps: false
});

module.exports = Booking;
