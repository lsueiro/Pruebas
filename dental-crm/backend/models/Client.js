const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('new', 'recurrent', 'inactive'),
    defaultValue: 'new',
  },
  lastVisit: {
    type: DataTypes.DATE,
  },
  nextAppointment: {
    type: DataTypes.DATE,
  },
  totalVisits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lifetimeValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
});

module.exports = Client;
