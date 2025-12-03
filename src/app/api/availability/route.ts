import { NextRequest, NextResponse } from 'next/server';
import db from '@/db/database';
import { Availability } from '@/types/availability';
import dayjs from 'dayjs';

// GET /api/availability - Get available time slots
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const provider_id = searchParams.get('provider_id');
    const date = searchParams.get('date'); // YYYY-MM-DD
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    if (!provider_id) {
      return NextResponse.json(
        { error: 'provider_id es requerido' },
        { status: 400 }
      );
    }

    // Get provider's availability rules
    const availabilityStmt = db.prepare(`
      SELECT * FROM availability
      WHERE provider_id = ?
      ORDER BY day_of_week, start_time
    `);
    const availability = availabilityStmt.all(parseInt(provider_id)) as Availability[];

    if (availability.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Get existing appointments for this provider
    let appointmentsQuery = `
      SELECT start_time, end_time FROM appointments
      WHERE provider_id = ?
      AND status NOT IN ('cancelled')
    `;
    const appointmentParams: any[] = [parseInt(provider_id)];

    if (date) {
      const dayStart = dayjs(date).startOf('day').toISOString();
      const dayEnd = dayjs(date).endOf('day').toISOString();
      appointmentsQuery += ' AND start_time >= ? AND start_time < ?';
      appointmentParams.push(dayStart, dayEnd);
    } else if (start_date && end_date) {
      appointmentsQuery += ' AND start_time >= ? AND start_time <= ?';
      appointmentParams.push(start_date, end_date);
    }

    const appointments = db.prepare(appointmentsQuery).all(...appointmentParams) as Array<{
      start_time: string;
      end_time: string;
    }>;

    // Calculate available slots
    const slots = calculateAvailableSlots(
      availability,
      appointments,
      date || start_date || dayjs().format('YYYY-MM-DD'),
      end_date || date || dayjs().add(7, 'days').format('YYYY-MM-DD')
    );

    return NextResponse.json({ data: slots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Error al obtener disponibilidad' },
      { status: 500 }
    );
  }
}

function calculateAvailableSlots(
  availability: Availability[],
  bookedSlots: Array<{ start_time: string; end_time: string }>,
  startDate: string,
  endDate: string
) {
  const slots: Array<{ start: string; end: string; available: boolean }> = [];
  const slotDuration = 30; // 30 minutes per slot

  let currentDate = dayjs(startDate);
  const end = dayjs(endDate);

  while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
    const dayOfWeek = currentDate.day();

    // Find availability rules for this day
    const dayAvailability = availability.filter((a) => a.day_of_week === dayOfWeek);

    for (const avail of dayAvailability) {
      const [startHour, startMin] = avail.start_time.split(':').map(Number);
      const [endHour, endMin] = avail.end_time.split(':').map(Number);

      let slotStart = currentDate.hour(startHour).minute(startMin).second(0);
      const slotEnd = currentDate.hour(endHour).minute(endMin).second(0);

      while (slotStart.isBefore(slotEnd)) {
        const slotEndTime = slotStart.add(slotDuration, 'minutes');

        if (slotEndTime.isAfter(slotEnd)) break;

        // Check if slot is booked
        const isBooked = bookedSlots.some((booking) => {
          const bookingStart = dayjs(booking.start_time);
          const bookingEnd = dayjs(booking.end_time);

          return (
            ((slotStart.isAfter(bookingStart) || slotStart.isSame(bookingStart)) && slotStart.isBefore(bookingEnd)) ||
            (slotEndTime.isAfter(bookingStart) && (slotEndTime.isBefore(bookingEnd) || slotEndTime.isSame(bookingEnd))) ||
            (slotStart.isBefore(bookingStart) && slotEndTime.isAfter(bookingEnd))
          );
        });

        slots.push({
          start: slotStart.toISOString(),
          end: slotEndTime.toISOString(),
          available: !isBooked,
        });

        slotStart = slotEndTime;
      }
    }

    currentDate = currentDate.add(1, 'day');
  }

  return slots;
}
