import db, { initDatabase } from './database';

export function seedDatabase() {
  console.log('Seeding database with sample data...');

  // Check if data already exists
  const providerCount = db.prepare('SELECT COUNT(*) as count FROM providers').get() as { count: number };
  
  if (providerCount.count > 0) {
    console.log('Database already seeded. Skipping...');
    return;
  }

  // Insert providers
  const insertProvider = db.prepare(`
    INSERT INTO providers (name, email, phone, specialty)
    VALUES (?, ?, ?, ?)
  `);

  const providers = [
    ['Dr. María González', 'maria.gonzalez@clinic.com', '+1-555-0101', 'Medicina General'],
    ['Dr. Juan Pérez', 'juan.perez@clinic.com', '+1-555-0102', 'Cardiología'],
    ['Dra. Ana Martínez', 'ana.martinez@clinic.com', '+1-555-0103', 'Pediatría'],
  ];

  for (const provider of providers) {
    insertProvider.run(...provider);
  }

  // Insert services
  const insertService = db.prepare(`
    INSERT INTO services (name, description, duration, price)
    VALUES (?, ?, ?, ?)
  `);

  const services = [
    ['Consulta General', 'Consulta médica de rutina', 30, 50.00],
    ['Chequeo Completo', 'Examen médico completo con análisis', 60, 120.00],
    ['Consulta de Seguimiento', 'Seguimiento de tratamiento', 20, 35.00],
    ['Consulta Pediátrica', 'Consulta para niños', 30, 45.00],
    ['Consulta Cardiológica', 'Evaluación cardiovascular', 45, 90.00],
  ];

  for (const service of services) {
    insertService.run(...service);
  }

  // Insert availability (Monday to Friday, 9 AM - 5 PM)
  const insertAvailability = db.prepare(`
    INSERT INTO availability (provider_id, day_of_week, start_time, end_time)
    VALUES (?, ?, ?, ?)
  `);

  const providerIds = [1, 2, 3];
  
  for (const providerId of providerIds) {
    // Monday to Friday (1-5)
    for (let day = 1; day <= 5; day++) {
      insertAvailability.run(providerId, day, '09:00', '17:00');
    }
  }

  // Insert sample appointments
  const insertAppointment = db.prepare(`
    INSERT INTO appointments (
      title, description, start_time, end_time, status,
      provider_id, service_id, customer_name, customer_email, customer_phone, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Tomorrow at 10 AM
  const tomorrow10am = new Date(today);
  tomorrow10am.setDate(tomorrow10am.getDate() + 1);
  tomorrow10am.setHours(10, 0, 0, 0);
  
  const tomorrow10_30am = new Date(tomorrow10am);
  tomorrow10_30am.setMinutes(30);

  // Tomorrow at 2 PM
  const tomorrow2pm = new Date(today);
  tomorrow2pm.setDate(tomorrow2pm.getDate() + 1);
  tomorrow2pm.setHours(14, 0, 0, 0);
  
  const tomorrow2_30pm = new Date(tomorrow2pm);
  tomorrow2_30pm.setMinutes(30);

  // Next week at 11 AM
  const nextWeek11am = new Date(today);
  nextWeek11am.setDate(nextWeek11am.getDate() + 7);
  nextWeek11am.setHours(11, 0, 0, 0);
  
  const nextWeek12pm = new Date(nextWeek11am);
  nextWeek12pm.setHours(12, 0);

  const appointments = [
    [
      'Consulta General - Pedro Sánchez',
      'Chequeo de rutina',
      tomorrow10am.toISOString(),
      tomorrow10_30am.toISOString(),
      'confirmed',
      1,
      1,
      'Pedro Sánchez',
      'pedro.sanchez@email.com',
      '+1-555-1001',
      'Primera visita'
    ],
    [
      'Consulta Cardiológica - Laura Torres',
      'Evaluación cardiovascular',
      tomorrow2pm.toISOString(),
      tomorrow2_30pm.toISOString(),
      'pending',
      2,
      5,
      'Laura Torres',
      'laura.torres@email.com',
      '+1-555-1002',
      'Dolor en el pecho ocasional'
    ],
    [
      'Consulta Pediátrica - Familia Ramírez',
      'Revisión del niño',
      nextWeek11am.toISOString(),
      nextWeek12pm.toISOString(),
      'confirmed',
      3,
      4,
      'Carlos Ramírez',
      'carlos.ramirez@email.com',
      '+1-555-1003',
      'Vacunación pendiente'
    ],
  ];

  for (const appointment of appointments) {
    insertAppointment.run(...appointment);
  }

  console.log('Database seeded successfully!');
  console.log(`- ${providers.length} providers`);
  console.log(`- ${services.length} services`);
  console.log(`- ${providerIds.length * 5} availability slots`);
  console.log(`- ${appointments.length} sample appointments`);
}

// Run if executed directly
if (require.main === module) {
  initDatabase();
  seedDatabase();
  console.log('Database setup complete!');
}
