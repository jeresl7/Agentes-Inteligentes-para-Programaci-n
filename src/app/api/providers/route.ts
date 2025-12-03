import { NextRequest, NextResponse } from 'next/server';
import db from '@/db/database';
import { Provider } from '@/types/provider';

// GET /api/providers - List all providers
export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM providers ORDER BY name ASC');
    const providers = stmt.all() as Provider[];

    return NextResponse.json({ data: providers });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: 'Error al obtener los proveedores' },
      { status: 500 }
    );
  }
}
