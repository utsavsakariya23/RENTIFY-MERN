const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Car = sequelize.define('Car', {
  car_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  price_per_day: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fuel_type: {
    type: DataTypes.STRING(20),
    defaultValue: 'Petrol'
  },
  transmission: {
    type: DataTypes.STRING(20),
    defaultValue: 'Automatic'
  },
  image_url: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  car_type: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  seats: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  model_year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 150.00
  },
  status: {
    type: DataTypes.ENUM('active', 'deactive'),
    defaultValue: 'active'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'cars',
  timestamps: false
});

module.exports = Car;
