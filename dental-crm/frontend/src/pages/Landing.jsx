import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z"/>
            </svg>
            <span className="text-2xl font-bold text-gray-800">DentalCRM</span>
          </div>
          <div className="space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-primary px-4 py-2">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition">
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            El CRM Inteligente para tu<br/>
            <span className="text-primary">Clínica Dental</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Automatiza reservas, gestiona pacientes y fideliza clientes con una plataforma 
            diseñada específicamente para dueños de clínicas dentales.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-secondary transition shadow-lg">
              Prueba Gratis 14 Días
            </Link>
            <Link to="#features" className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold border-2 border-primary hover:bg-cyan-50 transition">
              Ver Características
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Todo lo que necesitas para hacer crecer tu clínica
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-cyan-50 rounded-xl">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Reservas Automáticas</h3>
              <p className="text-gray-600">Calendario inteligente con recordatorios automáticos por email y SMS.</p>
            </div>
            <div className="p-6 bg-cyan-50 rounded-xl">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestión de Pacientes</h3>
              <p className="text-gray-600">Historial completo, preferencias y seguimiento de cada paciente.</p>
            </div>
            <div className="p-6 bg-cyan-50 rounded-xl">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dashboard Inteligente</h3>
              <p className="text-gray-600">Pipeline de clientes, métricas clave y sugerencias de contacto.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            ¿Listo para transformar tu clínica dental?
          </h2>
          <p className="text-cyan-100 mb-8 text-lg">
            Únete a cientos de clínicas que ya confían en DentalCRM
          </p>
          <Link to="/register" className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-cyan-50 transition inline-block">
            Comenzar Ahora - Sin Tarjeta Requerida
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold">DentalCRM</span>
            </div>
            <p className="text-gray-400">© 2024 DentalCRM. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
