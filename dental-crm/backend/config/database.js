const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database/dental_crm.sqlite'),
  logging: false,
});

module.exports = sequelize;
