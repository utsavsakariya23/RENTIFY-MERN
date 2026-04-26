const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserDocument = sequelize.define('UserDocument', {
  document_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  gov_id_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gov_id_status: {
    type: DataTypes.ENUM('Not Uploaded', 'Pending', 'Verified', 'Rejected'),
    defaultValue: 'Not Uploaded'
  },
  license_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  license_status: {
    type: DataTypes.ENUM('Not Uploaded', 'Pending', 'Verified', 'Rejected'),
    defaultValue: 'Not Uploaded'
  }
}, {
  timestamps: true,
  tableName: 'user_documents'
});

module.exports = UserDocument;
