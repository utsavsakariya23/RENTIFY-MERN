const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Coupon = sequelize.define('Coupon', {
  coupon_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  discount_percent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 100 }
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  assigned_user_email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  max_uses: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  used_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  show_in_suggestions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'coupons',
  timestamps: true  // use Sequelize timestamps for createdAt
});

module.exports = Coupon;
