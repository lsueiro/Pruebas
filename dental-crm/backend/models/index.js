const sequelize = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Appointment = require('./Appointment');
const Service = require('./Service');
const Treatment = require('./Treatment');
const Automation = require('./Automation');

// Associations
User.hasMany(Client, { foreignKey: 'userId', as: 'clients' });
Client.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Client.hasMany(Appointment, { foreignKey: 'clientId', as: 'appointments' });
Appointment.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

User.hasMany(Service, { foreignKey: 'userId', as: 'services' });
Service.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Client.hasMany(Treatment, { foreignKey: 'clientId', as: 'treatments' });
Treatment.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Appointment.hasMany(Treatment, { foreignKey: 'appointmentId', as: 'treatments' });
Treatment.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

Service.hasMany(Treatment, { foreignKey: 'serviceId', as: 'treatments' });
Treatment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

User.hasMany(Automation, { foreignKey: 'userId', as: 'automations' });
Automation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Client,
  Appointment,
  Service,
  Treatment,
  Automation,
};
