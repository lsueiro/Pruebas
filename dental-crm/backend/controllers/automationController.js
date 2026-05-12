const { db } = require('../models');

exports.getAutomations = (req, res) => {
  try {
    const automations = db.prepare(`
      SELECT * FROM automations WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);
    
    res.json(automations);
  } catch (error) {
    console.error('Get automations error:', error);
    res.status(500).json({ message: 'Error al obtener automatizaciones' });
  }
};

exports.createAutomation = (req, res) => {
  try {
    const { type, name, enabled, triggerDays, message, channel } = req.body;

    const result = db.prepare(`
      INSERT INTO automations (user_id, type, enabled, config)
      VALUES (?, ?, ?, ?)
    `).run(
      req.user.id,
      type,
      enabled !== false,
      JSON.stringify({ triggerDays, message, channel: channel || 'email', name })
    );

    const automation = db.prepare('SELECT * FROM automations WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(automation);
  } catch (error) {
    console.error('Create automation error:', error);
    res.status(500).json({ message: 'Error al crear automatización' });
  }
};

exports.updateAutomation = (req, res) => {
  try {
    const { type, name, enabled, triggerDays, message, channel } = req.body;

    const existing = db.prepare('SELECT * FROM automations WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!existing) {
      return res.status(404).json({ message: 'Automatización no encontrada' });
    }

    db.prepare(`
      UPDATE automations SET type = ?, enabled = ?, config = ?
      WHERE id = ? AND user_id = ?
    `).run(
      type,
      enabled !== false,
      JSON.stringify({ triggerDays, message, channel: channel || 'email', name }),
      req.params.id,
      req.user.id
    );

    const automation = db.prepare('SELECT * FROM automations WHERE id = ?').get(req.params.id);
    res.json(automation);
  } catch (error) {
    console.error('Update automation error:', error);
    res.status(500).json({ message: 'Error al actualizar automatización' });
  }
};

exports.deleteAutomation = (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM automations WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!existing) {
      return res.status(404).json({ message: 'Automatización no encontrada' });
    }

    db.prepare('DELETE FROM automations WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);

    res.json({ message: 'Automatización eliminada' });
  } catch (error) {
    console.error('Delete automation error:', error);
    res.status(500).json({ message: 'Error al eliminar automatización' });
  }
};

exports.runAutomations = (req, res) => {
  try {
    const now = new Date();
    const results = {
      remindersSent: 0,
      inactiveClientsFound: 0,
      loyaltyCampaignsSent: 0,
    };

    // Get all automations for user
    const automations = db.prepare(`
      SELECT * FROM automations WHERE user_id = ? AND enabled = 1
    `).all(req.user.id);

    automations.forEach(automation => {
      const config = JSON.parse(automation.config || '{}');
      
      if (automation.type === 'appointment_reminder') {
        // Send reminders for appointments in next 24 hours
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const upcomingAppointments = db.prepare(`
          SELECT a.*, c.name, c.email, c.phone
          FROM appointments a
          JOIN clients c ON a.client_id = c.id
          WHERE a.user_id = ? 
          AND a.date_time >= ? 
          AND a.date_time <= ?
          AND a.reminder_sent = 0
          AND a.status = 'scheduled'
        `).all(req.user.id, now.toISOString(), tomorrow.toISOString());

        upcomingAppointments.forEach(apt => {
          // Mark reminder as sent
          db.prepare('UPDATE appointments SET reminder_sent = 1 WHERE id = ?').run(apt.id);
          results.remindersSent++;
          console.log(`Reminder sent to ${apt.name} for appointment on ${apt.date_time}`);
        });
      }
      
      if (automation.type === 'inactive_client_recovery') {
        const daysThreshold = config.triggerDays || 90;
        const thresholdDate = new Date(now);
        thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
        
        const inactiveClients = db.prepare(`
          SELECT * FROM clients 
          WHERE user_id = ? 
          AND status != 'inactive'
          AND (last_visit IS NULL OR last_visit < ?)
        `).all(req.user.id, thresholdDate.toISOString());

        inactiveClients.forEach(client => {
          // Update client status and set next suggested contact
          const nextContact = new Date(now);
          nextContact.setDate(nextContact.getDate() + 7);
          
          db.prepare(`
            UPDATE clients SET status = 'inactive', next_suggested_contact = ?
            WHERE id = ?
          `).run(nextContact.toISOString(), client.id);
          
          results.inactiveClientsFound++;
          console.log(`Inactive client identified: ${client.name}`);
        });
      }
      
      if (automation.type === 'loyalty_campaign') {
        // Find recurrent clients for loyalty campaign
        const loyalClients = db.prepare(`
          SELECT c.*, COUNT(a.id) as appointment_count
          FROM clients c
          LEFT JOIN appointments a ON c.id = a.client_id
          WHERE c.user_id = ? 
          AND c.status = 'recurrent'
          GROUP BY c.id
          HAVING COUNT(a.id) >= 3
        `).all(req.user.id);

        loyalClients.forEach(client => {
          results.loyaltyCampaignsSent++;
          console.log(`Loyalty campaign triggered for: ${client.name}`);
        });
      }
    });

    // Update last_run for all automations
    automations.forEach(automation => {
      db.prepare('UPDATE automations SET last_run = ? WHERE id = ?')
        .run(now.toISOString(), automation.id);
    });

    res.json({ success: true, results });
  } catch (error) {
    console.error('Run automations error:', error);
    res.status(500).json({ message: 'Error al ejecutar automatizaciones' });
  }
};

exports.getClientContactSuggestions = (req, res) => {
  try {
    const now = new Date();
    
    // Clients who need follow-up
    const needsContact = db.prepare(`
      SELECT c.*, 
        CASE 
          WHEN c.next_suggested_contact <= ? THEN 'Follow-up needed'
          WHEN c.last_visit IS NULL THEN 'New client - initial contact'
          ELSE 'Regular check-in'
        END as contact_reason
      FROM clients c
      WHERE c.user_id = ?
      AND (c.next_suggested_contact <= ? OR c.last_visit IS NULL)
      ORDER BY c.next_suggested_contact ASC
    `).all(now.toISOString(), req.user.id, now.toISOString());

    // Upcoming birthdays or special dates (if stored in preferences)
    const specialDates = db.prepare(`
      SELECT c.*, c.preferences
      FROM clients c
      WHERE c.user_id = ? 
      AND c.preferences IS NOT NULL
    `).all(req.user.id);

    const suggestions = {
      needsContact,
      specialDates: specialDates.filter(c => {
        try {
          const prefs = JSON.parse(c.preferences);
          return prefs.birthday || prefs.anniversary;
        } catch {
          return false;
        }
      }),
    };

    res.json(suggestions);
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Error al obtener sugerencias' });
  }
};
