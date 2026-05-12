const { Client, Appointment, Treatment } = require('../models');
const { Op } = require('sequelize');

exports.getClients = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = { userId: req.user.id };
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const clients = await Client.findAll({
      where,
      include: [{
        model: Appointment,
        as: 'appointments',
        limit: 1,
        order: [['date', 'DESC']],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
};

exports.getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        {
          model: Appointment,
          as: 'appointments',
          order: [['date', 'DESC']],
        },
        {
          model: Treatment,
          as: 'treatments',
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cliente' });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, notes, preferences } = req.body;

    const client = await Client.create({
      userId: req.user.id,
      name,
      email,
      phone,
      notes,
      preferences: preferences || {},
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear cliente' });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { name, email, phone, status, notes, preferences } = req.body;

    const client = await Client.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    await client.update({
      name,
      email,
      phone,
      status,
      notes,
      preferences,
    });

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    await client.destroy();
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const newClients = await Client.count({
      where: { userId: req.user.id, status: 'new' },
    });

    const recurrentClients = await Client.count({
      where: { userId: req.user.id, status: 'recurrent' },
    });

    const inactiveClients = await Client.count({
      where: { userId: req.user.id, status: 'inactive' },
    });

    const totalClients = await Client.count({
      where: { userId: req.user.id },
    });

    const totalRevenue = await Treatment.sum('price', {
      include: [{
        model: Client,
        as: 'client',
        where: { userId: req.user.id },
      }],
    });

    res.json({
      newClients,
      recurrentClients,
      inactiveClients,
      totalClients,
      totalRevenue: totalRevenue || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};
