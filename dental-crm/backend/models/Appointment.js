const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
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
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Clients',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
  },
  service: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'),
    defaultValue: 'scheduled',
  },
  notes: {
    type: DataTypes.TEXT,
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Appointment;
