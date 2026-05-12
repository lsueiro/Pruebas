const { db } = require('../models');

exports.getClients = (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM appointments a WHERE a.client_id = c.id AND a.user_id = ?) as appointment_count,
        (SELECT MAX(date_time) FROM appointments a WHERE a.client_id = c.id AND a.user_id = ?) as last_appointment
      FROM clients c WHERE c.user_id = ?
    `;
    const params = [req.user.id, req.user.id, req.user.id];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY c.created_at DESC';

    const clients = db.prepare(query).all(...params);

    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
};

exports.getClient = (req, res) => {
  try {
    const client = db.prepare(`
      SELECT * FROM clients WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Get appointments
    const appointments = db.prepare(`
      SELECT * FROM appointments WHERE client_id = ? ORDER BY date_time DESC
    `).all(req.params.id);

    // Get treatments
    const treatments = db.prepare(`
      SELECT t.*, s.name as service_name 
      FROM treatments t
      LEFT JOIN services s ON t.service_id = s.id
      WHERE t.client_id = ? 
      ORDER BY t.created_at DESC
    `).all(req.params.id);

    res.json({ ...client, appointments, treatments });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ message: 'Error al obtener cliente' });
  }
};

exports.createClient = (req, res) => {
  try {
    const { name, email, phone, notes, preferences } = req.body;

    const result = db.prepare(`
      INSERT INTO clients (user_id, name, email, phone, notes, preferences, status)
      VALUES (?, ?, ?, ?, ?, ?, 'new')
    `).run(
      req.user.id,
      name,
      email || null,
      phone,
      notes || null,
      JSON.stringify(preferences || {})
    );

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Error al crear cliente' });
  }
};

exports.updateClient = (req, res) => {
  try {
    const { name, email, phone, status, notes, preferences, last_visit, next_suggested_contact } = req.body;

    const existing = db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!existing) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    db.prepare(`
      UPDATE clients SET
        name = ?, email = ?, phone = ?, status = ?, notes = ?, 
        preferences = ?, last_visit = ?, next_suggested_contact = ?
      WHERE id = ? AND user_id = ?
    `).run(
      name,
      email,
      phone,
      status,
      notes,
      JSON.stringify(preferences || {}),
      last_visit,
      next_suggested_contact,
      req.params.id,
      req.user.id
    );

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
};

exports.deleteClient = (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!existing) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    db.prepare('DELETE FROM clients WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
};

exports.getStats = (req, res) => {
  try {
    const newClients = db.prepare(`
      SELECT COUNT(*) as count FROM clients WHERE user_id = ? AND status = 'new'
    `).get(req.user.id).count;

    const recurrentClients = db.prepare(`
      SELECT COUNT(*) as count FROM clients WHERE user_id = ? AND status = 'recurrent'
    `).get(req.user.id).count;

    const inactiveClients = db.prepare(`
      SELECT COUNT(*) as count FROM clients WHERE user_id = ? AND status = 'inactive'
    `).get(req.user.id).count;

    const totalClients = db.prepare(`
      SELECT COUNT(*) as count FROM clients WHERE user_id = ?
    `).get(req.user.id).count;

    const totalRevenue = db.prepare(`
      SELECT COALESCE(SUM(price), 0) as total FROM treatments 
      WHERE client_id IN (SELECT id FROM clients WHERE user_id = ?)
    `).get(req.user.id).total;

    res.json({
      newClients,
      recurrentClients,
      inactiveClients,
      totalClients,
      totalRevenue,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};
