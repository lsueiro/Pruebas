const { Automation, Client, Appointment } = require('../models');
const { Op } = require('sequelize');

exports.getAutomations = async (req, res) => {
  try {
    const automations = await Automation.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(automations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener automatizaciones' });
  }
};

exports.createAutomation = async (req, res) => {
  try {
    const { type, name, enabled, triggerDays, message, channel } = req.body;

    const automation = await Automation.create({
      userId: req.user.id,
      type,
      name,
      enabled: enabled !== false,
      triggerDays,
      message,
      channel: channel || 'email',
    });

    res.status(201).json(automation);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear automatización' });
  }
};

exports.updateAutomation = async (req, res) => {
  try {
    const { type, name, enabled, triggerDays, message, channel } = req.body;

    const automation = await Automation.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!automation) {
      return res.status(404).json({ message: 'Automatización no encontrada' });
    }

    await automation.update({
      type,
      name,
      enabled,
      triggerDays,
      message,
      channel,
    });

    res.json(automation);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar automatización' });
  }
};

exports.deleteAutomation = async (req, res) => {
  try {
    const automation = await Automation.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!automation) {
      return res.status(404).json({ message: 'Automatización no encontrada' });
    }

    await automation.destroy();
    res.json({ message: 'Automatización eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar automatización' });
  }
};

exports.runAutomations = async (req, res) => {
  try {
    const automations = await Automation.findAll({
      where: { userId: req.user.id, enabled: true },
    });

    const results = {
      reminders: [],
      reactivations: [],
      loyalty: [],
    };

    const today = new Date();

    for (const automation of automations) {
      if (automation.type === 'reminder') {
        const daysAhead = automation.triggerDays || 1;
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + daysAhead);

        const appointments = await Appointment.findAll({
          where: {
            userId: req.user.id,
            date: {
              [Op.gte]: new Date(targetDate.setHours(0, 0, 0, 0)),
              [Op.lt]: new Date(targetDate.setHours(23, 59, 59, 999)),
            },
            status: ['scheduled', 'confirmed'],
            reminderSent: false,
          },
          include: [{ model: Client, as: 'client' }],
        });

        results.reminders.push(...appointments.map(apt => ({
          clientId: apt.clientId,
          clientName: apt.client.name,
          appointmentDate: apt.date,
          message: automation.message || `Recordatorio: Tienes una cita mañana a las ${new Date(apt.date).toLocaleTimeString()}`,
        })));
      }

      if (automation.type === 'reactivation') {
        const daysInactive = automation.triggerDays || 90;
        const cutoffDate = new Date(today);
        cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

        const inactiveClients = await Client.findAll({
          where: {
            userId: req.user.id,
            lastVisit: {
              [Op.lt]: cutoffDate,
            },
            status: 'inactive',
          },
        });

        results.reactivations.push(...inactiveClients.map(client => ({
          clientId: client.id,
          clientName: client.name,
          lastVisit: client.lastVisit,
          message: automation.message || `¡Te extrañamos! Ha pasado tiempo desde tu última visita. Agenda tu cita hoy y recibe un 10% de descuento.`,
        })));
      }

      if (automation.type === 'loyalty') {
        const loyalClients = await Client.findAll({
          where: {
            userId: req.user.id,
            totalVisits: { [Op.gte]: automation.triggerDays || 5 },
            status: 'recurrent',
          },
        });

        results.loyalty.push(...loyalClients.map(client => ({
          clientId: client.id,
          clientName: client.name,
          totalVisits: client.totalVisits,
          message: automation.message || `¡Gracias por tu lealtad! Como cliente frecuente, tienes acceso a beneficios exclusivos.`,
        })));
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error al ejecutar automatizaciones' });
  }
};

exports.getClientContactSuggestions = async (req, res) => {
  try {
    const clients = await Client.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Appointment,
        as: 'appointments',
        limit: 1,
        order: [['date', 'DESC']],
      }],
    });

    const today = new Date();
    const suggestions = [];

    for (const client of clients) {
      const lastAppointment = client.appointments[0];
      const lastVisit = client.lastVisit ? new Date(client.lastVisit) : null;
      
      let reason = null;
      let priority = 'low';
      let contactDate = null;

      if (client.status === 'inactive' && lastVisit) {
        const daysSinceLastVisit = Math.floor((today - lastVisit) / (1000 * 60 * 60 * 24));
        if (daysSinceLastVisit > 90) {
          reason = 'Cliente inactivo por más de 90 días';
          priority = 'high';
          contactDate = new Date(today);
        }
      }

      if (lastAppointment && lastAppointment.date) {
        const nextCheckup = new Date(lastAppointment.date);
        nextCheckup.setMonth(nextCheckup.getMonth() + 6);
        
        if (nextCheckup <= today && client.status !== 'inactive') {
          reason = 'Es hora de su revisión semestral';
          priority = 'medium';
          contactDate = nextCheckup;
        }
      }

      if (client.totalVisits >= 5 && client.status === 'recurrent') {
        reason = 'Cliente frecuente - ofrecer programa de fidelización';
        priority = 'medium';
        contactDate = new Date(today);
      }

      if (reason) {
        suggestions.push({
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          clientPhone: client.phone,
          reason,
          priority,
          contactDate,
          status: client.status,
          totalVisits: client.totalVisits,
        });
      }
    }

    suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener sugerencias de contacto' });
  }
};
