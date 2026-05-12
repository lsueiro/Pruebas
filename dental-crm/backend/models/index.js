const db = require('../config/database');

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'owner',
      clinic_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Clients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      last_visit DATE,
      next_suggested_contact DATE,
      preferences TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Appointments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      date_time DATETIME NOT NULL,
      duration INTEGER DEFAULT 60,
      status TEXT DEFAULT 'scheduled',
      service_type TEXT,
      notes TEXT,
      reminder_sent BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )
  `);

  // Services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL,
      duration INTEGER DEFAULT 60,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Treatments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS treatments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      appointment_id INTEGER,
      service_id INTEGER,
      user_id INTEGER NOT NULL,
      date_performed DATE,
      notes TEXT,
      price REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (appointment_id) REFERENCES appointments(id),
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Automations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS automations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      enabled BOOLEAN DEFAULT TRUE,
      config TEXT,
      last_run DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create default services
  const defaultServices = [
    { name: 'Limpieza Dental', description: 'Limpieza profesional y pulido', price: 80, duration: 60 },
    { name: 'Blanqueamiento', description: 'Blanqueamiento dental profesional', price: 250, duration: 90 },
    { name: 'Ortodoncia', description: 'Evaluación y tratamiento de ortodoncia', price: 150, duration: 45 },
    { name: 'Implantes', description: 'Implantes dentales', price: 800, duration: 120 },
    { name: 'Endodoncia', description: 'Tratamiento de conducto', price: 300, duration: 90 },
    { name: 'Extracción', description: 'Extracción dental', price: 100, duration: 45 },
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO services (name, description, price, duration, user_id)
    VALUES (?, ?, ?, ?, 1)
  `);

  defaultServices.forEach(service => {
    stmt.run(service.name, service.description, service.price, service.duration);
  });

  // Create default admin user (password: admin123)
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  db.exec(`
    INSERT OR IGNORE INTO users (name, email, password, role, clinic_name)
    VALUES ('Administrador', 'admin@dentalcrm.com', '${hashedPassword}', 'owner', 'Clínica Dental Demo')
  `);

  console.log('Database initialized successfully!');
}

module.exports = {
  db,
  initializeDatabase,
};
