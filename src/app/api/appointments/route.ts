import { NextRequest, NextResponse } from 'next/server';
import db, { initDatabase } from '@/db/database';
import { Appointment } from '@/types/appointment';

// Initialize database on first API call
let dbInitialized = false;
function ensureDbInitialized() {
  if (!dbInitialized) {
    initDatabase();
    dbInitialized = true;
  }
}

// GET /api/appointments - List all appointments with optional filters
export async function GET(request: NextRequest) {
  try {
    ensureDbInitialized();
    
    const searchParams = request.nextUrl.searchParams;
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const provider_id = searchParams.get('provider_id');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM appointments WHERE 1=1';
    const params: any[] = [];

    if (start_date) {
      query += ' AND start_time >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND start_time <= ?';
      params.push(end_date);
    }

    if (provider_id) {
      query += ' AND provider_id = ?';
      params.push(parseInt(provider_id));
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY start_time ASC';

    const stmt = db.prepare(query);
    const appointments = stmt.all(...params) as Appointment[];

    return NextResponse.json({ data: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Error al obtener las citas' },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    ensureDbInitialized();
    
    const body = await request.json();
    const {
      title,
      description,
      start_time,
      end_time,
      provider_id,
      service_id,
      customer_name,
      customer_email,
      customer_phone,
      notes,
    } = body;

    // Validate required fields
    if (!title || !start_time || !end_time || !customer_name || !customer_email) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Check for conflicts
    const conflictQuery = db.prepare(`
      SELECT id FROM appointments
      WHERE provider_id = ?
      AND status NOT IN ('cancelled')
      AND (
        (start_time < ? AND end_time > ?)
        OR (start_time < ? AND end_time > ?)
        OR (start_time >= ? AND end_time <= ?)
      )
    `);

    const conflict = conflictQuery.get(
      provider_id || null,
      end_time,
      start_time,
      end_time,
      start_time,
      start_time,
      end_time
    );

    if (conflict) {
      return NextResponse.json(
        { error: 'Ya existe una cita en este horario' },
        { status: 409 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO appointments (
        title, description, start_time, end_time, status,
        provider_id, service_id, customer_name, customer_email,
        customer_phone, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      description || null,
      start_time,
      end_time,
      'pending',
      provider_id || null,
      service_id || null,
      customer_name,
      customer_email,
      customer_phone || null,
      notes || null
    );

    const newAppointment = db
      .prepare('SELECT * FROM appointments WHERE id = ?')
      .get(result.lastInsertRowid) as Appointment;

    return NextResponse.json({ data: newAppointment }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Error al crear la cita' },
      { status: 500 }
    );
  }
}
