import { NextRequest, NextResponse } from 'next/server';
import db from '@/db/database';
import { Appointment } from '@/types/appointment';

// GET /api/appointments/[id] - Get single appointment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const stmt = db.prepare('SELECT * FROM appointments WHERE id = ?');
    const appointment = stmt.get(id) as Appointment | undefined;

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: appointment });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Error al obtener la cita' },
      { status: 500 }
    );
  }
}

// PUT /api/appointments/[id] - Update appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    // Check if appointment exists
    const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    const {
      title,
      description,
      start_time,
      end_time,
      status,
      provider_id,
      service_id,
      customer_name,
      customer_email,
      customer_phone,
      notes,
    } = body;

    const stmt = db.prepare(`
      UPDATE appointments
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          start_time = COALESCE(?, start_time),
          end_time = COALESCE(?, end_time),
          status = COALESCE(?, status),
          provider_id = COALESCE(?, provider_id),
          service_id = COALESCE(?, service_id),
          customer_name = COALESCE(?, customer_name),
          customer_email = COALESCE(?, customer_email),
          customer_phone = COALESCE(?, customer_phone),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title,
      description,
      start_time,
      end_time,
      status,
      provider_id,
      service_id,
      customer_name,
      customer_email,
      customer_phone,
      notes,
      id
    );

    const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as Appointment;

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la cita' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[id] - Delete/Cancel appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Instead of deleting, mark as cancelled
    const stmt = db.prepare(`
      UPDATE appointments
      SET status = 'cancelled',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Cita cancelada exitosamente' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Error al cancelar la cita' },
      { status: 500 }
    );
  }
}
