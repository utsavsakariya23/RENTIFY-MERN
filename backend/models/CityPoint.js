const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CityPoint = sequelize.define('CityPoint', {
  city_point_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  city_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  point_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'city_points',
  timestamps: false
});

module.exports = CityPoint;
