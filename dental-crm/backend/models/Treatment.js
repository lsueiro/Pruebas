const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Treatment = sequelize.define('Treatment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Clients',
      key: 'id',
    },
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Appointments',
      key: 'id',
    },
  },
  serviceId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Services',
      key: 'id',
    },
  },
  serviceName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Treatment;
