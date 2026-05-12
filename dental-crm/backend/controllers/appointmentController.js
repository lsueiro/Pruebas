const { Appointment, Client } = require('../models');

exports.getAppointments = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const where = { userId: req.user.id };

    if (startDate && endDate) {
      where.date = {
        [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (status) {
      where.status = status;
    }

    const appointments = await Appointment.findAll({
      where,
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'email', 'phone'],
      }],
      order: [['date', 'ASC']],
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener citas' });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{
        model: Client,
        as: 'client',
      }],
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cita' });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { clientId, date, duration, service, notes } = req.body;

    const client = await Client.findOne({
      where: { id: clientId, userId: req.user.id },
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const appointment = await Appointment.create({
      userId: req.user.id,
      clientId,
      date,
      duration: duration || 60,
      service,
      notes,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear cita' });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { date, duration, service, status, notes } = req.body;

    const appointment = await Appointment.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    await appointment.update({
      date,
      duration,
      service,
      status,
      notes,
    });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar cita' });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    await appointment.destroy();
    res.json({ message: 'Cita eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar cita' });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const startHour = 9;
    const endHour = 18;
    const slotDuration = 60;

    const existingAppointments = await Appointment.findAll({
      where: {
        userId: req.user.id,
        date: {
          [require('sequelize').Op.gte]: new Date(date),
          [require('sequelize').Op.lt]: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
        },
        status: { [require('sequelize').Op.notIn']: ['cancelled'] },
      },
    });

    const bookedSlots = existingAppointments.map(apt => {
      const aptDate = new Date(apt.date);
      return `${aptDate.getHours().toString().padStart(2, '0')}:${aptDate.getMinutes().toString().padStart(2, '0')}`;
    });

    const availableSlots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      if (!bookedSlots.includes(timeSlot)) {
        availableSlots.push(timeSlot);
      }
    }

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener slots disponibles' });
  }
};
