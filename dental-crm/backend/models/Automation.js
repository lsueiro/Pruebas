const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Automation = sequelize.define('Automation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('reminder', 'reactivation', 'loyalty', 'birthday'),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  triggerDays: {
    type: DataTypes.INTEGER,
  },
  message: {
    type: DataTypes.TEXT,
  },
  channel: {
    type: DataTypes.ENUM('email', 'sms', 'both'),
    defaultValue: 'email',
  },
  lastRun: {
    type: DataTypes.DATE,
  },
});

module.exports = Automation;
