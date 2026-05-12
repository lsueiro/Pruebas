const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../models');

exports.register = (req, res) => {
  try {
    const { name, email, password, clinicName } = req.body;

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email ya registrado' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, clinic_name)
      VALUES (?, ?, ?, 'owner', ?)
    `).run(name, email, hashedPassword, clinicName || 'Clínica Dental');

    const token = jwt.sign(
      { id: result.lastInsertRowid, email },
      process.env.JWT_SECRET || 'dental-crm-secret-key-2024',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: result.lastInsertRowid,
        name,
        email,
        clinicName: clinicName || 'Clínica Dental',
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'dental-crm-secret-key-2024',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        clinicName: user.clinic_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

exports.getProfile = (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, role, clinic_name as "clinicName"
      FROM users WHERE id = ?
    `).get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};
