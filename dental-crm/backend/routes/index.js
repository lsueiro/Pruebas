const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const authController = require('../controllers/authController');
const clientController = require('../controllers/clientController');
const appointmentController = require('../controllers/appointmentController');
const automationController = require('../controllers/automationController');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', auth, authController.getProfile);

// Client routes
router.get('/clients', auth, clientController.getClients);
router.get('/clients/:id', auth, clientController.getClient);
router.post('/clients', auth, clientController.createClient);
router.put('/clients/:id', auth, clientController.updateClient);
router.delete('/clients/:id', auth, clientController.deleteClient);
router.get('/clients/stats', auth, clientController.getStats);

// Appointment routes
router.get('/appointments', auth, appointmentController.getAppointments);
router.get('/appointments/:id', auth, appointmentController.getAppointment);
router.post('/appointments', auth, appointmentController.createAppointment);
router.put('/appointments/:id', auth, appointmentController.updateAppointment);
router.delete('/appointments/:id', auth, appointmentController.deleteAppointment);
router.get('/appointments/slots', auth, appointmentController.getAvailableSlots);

// Automation routes
router.get('/automations', auth, automationController.getAutomations);
router.post('/automations', auth, automationController.createAutomation);
router.put('/automations/:id', auth, automationController.updateAutomation);
router.delete('/automations/:id', auth, automationController.deleteAutomation);
router.post('/automations/run', auth, automationController.runAutomations);
router.get('/automations/suggestions', auth, automationController.getClientContactSuggestions);

module.exports = router;
