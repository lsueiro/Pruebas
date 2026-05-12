import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, suggestionsRes, appointmentsRes] = await Promise.all([
        api.get('/clients/stats'),
        api.get('/automations/suggestions'),
        api.get('/appointments'),
      ]);
      setStats(statsRes.data);
      setSuggestions(suggestionsRes.data.slice(0, 5));
      setAppointments(appointmentsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z"/>
            </svg>
            <span className="text-xl font-bold text-gray-800">DentalCRM</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user?.clinicName}</span>
            <button onClick={logout} className="text-gray-600 hover:text-primary">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="border-b-2 border-primary py-4 px-1 text-primary font-medium">
              Dashboard
            </Link>
            <Link to="/calendar" className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Calendario
            </Link>
            <Link to="/clients" className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Clientes
            </Link>
            <Link to="/automations" className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Automatizaciones
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {user?.name} 👋
          </h1>
          <p className="text-gray-600">Resumen de tu clínica dental</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes Nuevos</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.newClients || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recurrentes</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.recurrentClients || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactivos</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.inactiveClients || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Totales</p>
                <p className="text-3xl font-bold text-gray-900">${stats?.totalRevenue || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Suggestions */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📞 Sugerencias de Contacto
            </h2>
            {suggestions.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay sugerencias pendientes</p>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.clientId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{suggestion.clientName}</p>
                      <p className="text-sm text-gray-600">{suggestion.reason}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {suggestion.priority === 'high' ? 'Alta' : suggestion.priority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link to="/automations" className="mt-4 block text-sm text-primary hover:text-secondary">
              Ver todas las sugerencias →
            </Link>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📅 Próximas Citas
            </h2>
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay citas programadas</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{apt.client?.name}</p>
                      <p className="text-sm text-gray-600">{apt.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(apt.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(apt.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/calendar" className="mt-4 block text-sm text-primary hover:text-secondary">
              Ver calendario completo →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
