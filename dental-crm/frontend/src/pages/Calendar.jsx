import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function Calendar() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({ clientId: '', service: '', date: '', notes: '' });

  useEffect(() => {
    loadAppointments();
    loadClients();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', formData);
      setShowModal(false);
      loadAppointments();
      setFormData({ clientId: '', service: '', date: '', notes: '' });
    } catch (error) {
      alert('Error al crear cita');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-xl font-bold">DentalCRM - Calendario</span>
          <Link to="/dashboard" className="text-primary">← Volver</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📅 Calendario de Citas</h1>
          <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary">
            + Nueva Cita
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(apt.date).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(apt.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{apt.client?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{apt.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && (
            <p className="text-center py-8 text-gray-500">No hay citas programadas</p>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nueva Cita</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <select required value={formData.clientId} onChange={(e) => setFormData({...formData, clientId: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2">
                  <option value="">Seleccionar cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Servicio</label>
                <input required type="text" value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Limpieza, Ortodoncia..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                <input required type="datetime-local" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notas</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" rows="2"></textarea>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Calendar;
