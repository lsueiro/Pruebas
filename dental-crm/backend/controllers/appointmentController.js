const { db } = require('../models');

exports.getAppointments = (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = `
      SELECT a.*, c.name as client_name, c.email as client_email, c.phone as client_phone
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE a.user_id = ?
    `;
    const params = [req.user.id];

    if (startDate && endDate) {
      query += ' AND a.date_time >= ? AND a.date_time <= ?';
      params.push(startDate, endDate);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.date_time ASC';

    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Error al obtener citas' });
  }
};

exports.getAppointment = (req, res) => {
  try {
    const appointment = db.prepare(`
      SELECT a.*, c.name as client_name, c.email as client_email, c.phone as client_phone
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE a.id = ? AND a.user_id = ?
    `).get(req.params.id, req.user.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Error al obtener cita' });
  }
};

exports.createAppointment = (req, res) => {
  try {
    const { clientId, date_time, duration, service_type, notes } = req.body;

    const client = db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?')
      .get(clientId, req.user.id);

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const result = db.prepare(`
      INSERT INTO appointments (user_id, client_id, date_time, duration, service_type, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'scheduled')
    `).run(
      req.user.id,
      clientId,
      date_time,
      duration || 60,
      service_type || null,
      notes || null
    );

    const appointment = db.prepare(`
      SELECT a.*, c.name as client_name, c.email as client_email, c.phone as client_phone
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid);

    // Update client last_visit and status
    db.prepare(`
      UPDATE clients SET last_visit = ?, status = 'recurrent' 
      WHERE id = ? AND user_id = ?
    `).run(date_time, clientId, req.user.id);

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Error al crear cita' });
  }
};

exports.updateAppointment = (req, res) => {
  try {
    const { date_time, duration, service_type, status, notes } = req.body;

    const existing = db.prepare('SELECT * FROM appointments WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!existing) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    db.prepare(`
      UPDATE appointments SET
        date_time = ?, duration = ?, service_type = ?, status = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `).run(
      date_time,
      duration,
      service_type,
      status,
      notes,
      req.params.id,
      req.user.id
    );

    const appointment = db.prepare(`
      SELECT a.*, c.name as client_name, c.email as client_email, c.phone as client_phone
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE a.id = ?
    `).get(req.params.id);

    res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Error al actualizar cita' });
  }
};

exports.deleteAppointment = (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM appointments WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!existing) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    db.prepare('DELETE FROM appointments WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);

    res.json({ message: 'Cita eliminada' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Error al eliminar cita' });
  }
};

exports.getAvailableSlots = (req, res) => {
  try {
    const { date } = req.query;
    const startHour = 9;
    const endHour = 18;

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const existingAppointments = db.prepare(`
      SELECT date_time FROM appointments 
      WHERE user_id = ? AND date_time >= ? AND date_time < ?
      AND status != 'cancelled'
    `).all(req.user.id, startDate.toISOString(), endDate.toISOString());

    const bookedSlots = existingAppointments.map(apt => {
      const aptDate = new Date(apt.date_time);
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
    console.error('Get slots error:', error);
    res.status(500).json({ message: 'Error al obtener slots disponibles' });
  }
};
