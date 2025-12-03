import { NextRequest, NextResponse } from 'next/server';
import db from '@/db/database';
import { Service } from '@/types/service';

// GET /api/services - List all services
export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM services ORDER BY name ASC');
    const services = stmt.all() as Service[];

    return NextResponse.json({ data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Error al obtener los servicios' },
      { status: 500 }
    );
  }
}
