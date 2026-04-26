const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CouponUsage = sequelize.define('CouponUsage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  coupon_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  booking_id: { type: DataTypes.INTEGER, allowNull: true },
  used_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'coupon_usages', timestamps: false });

module.exports = CouponUsage;
