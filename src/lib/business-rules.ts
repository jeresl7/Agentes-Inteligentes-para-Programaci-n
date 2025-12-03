import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export interface BusinessHours {
  start: string; // HH:MM
  end: string;   // HH:MM
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
}

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  start: '09:00',
  end: '17:00',
  daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
};

export const DEFAULT_SLOT_DURATION = 30; // minutes
export const DEFAULT_BUFFER_TIME = 0; // minutes between appointments

/**
 * Check if a given date/time falls within business hours
 */
export function isWithinBusinessHours(
  dateTime: Date | Dayjs,
  businessHours: BusinessHours = DEFAULT_BUSINESS_HOURS
): boolean {
  const dt = dayjs(dateTime);
  const dayOfWeek = dt.day();

  // Check if day is a business day
  if (!businessHours.daysOfWeek.includes(dayOfWeek)) {
    return false;
  }

  // Check time range
  const [startHour, startMin] = businessHours.start.split(':').map(Number);
  const [endHour, endMin] = businessHours.end.split(':').map(Number);

  const startTime = dt.hour(startHour).minute(startMin).second(0);
  const endTime = dt.hour(endHour).minute(endMin).second(0);

  return dt.isBetween(startTime, endTime, null, '[)');
}

/**
 * Check if two time ranges conflict
 */
export function hasTimeConflict(
  start1: Date | Dayjs,
  end1: Date | Dayjs,
  start2: Date | Dayjs,
  end2: Date | Dayjs
): boolean {
  const s1 = dayjs(start1);
  const e1 = dayjs(end1);
  const s2 = dayjs(start2);
  const e2 = dayjs(end2);

  return (
    s1.isBefore(e2) && e1.isAfter(s2)
  );
}

/**
 * Validate appointment duration
 */
export function validateDuration(
  startTime: Date,
  endTime: Date,
  minDuration: number = 15,
  maxDuration: number = 240
): { valid: boolean; error?: string } {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  if (end.isBefore(start) || end.isSame(start)) {
    return {
      valid: false,
      error: 'La hora de fin debe ser posterior a la hora de inicio',
    };
  }

  const durationMinutes = end.diff(start, 'minutes');

  if (durationMinutes < minDuration) {
    return {
      valid: false,
      error: `La duración mínima es de ${minDuration} minutos`,
    };
  }

  if (durationMinutes > maxDuration) {
    return {
      valid: false,
      error: `La duración máxima es de ${maxDuration} minutos`,
    };
  }

  return { valid: true };
}

/**
 * Check if appointment can be booked (minimum advance notice)
 */
export function validateAdvanceNotice(
  appointmentTime: Date,
  minimumHours: number = 2
): { valid: boolean; error?: string } {
  const now = dayjs();
  const apptTime = dayjs(appointmentTime);
  const hoursDiff = apptTime.diff(now, 'hours', true);

  if (hoursDiff < minimumHours) {
    return {
      valid: false,
      error: `Las citas deben agendarse con al menos ${minimumHours} horas de anticipación`,
    };
  }

  return { valid: true };
}

/**
 * Check if appointment is not too far in the future
 */
export function validateMaxAdvance(
  appointmentTime: Date,
  maximumDays: number = 90
): { valid: boolean; error?: string } {
  const now = dayjs();
  const apptTime = dayjs(appointmentTime);
  const daysDiff = apptTime.diff(now, 'days', true);

  if (daysDiff > maximumDays) {
    return {
      valid: false,
      error: `Las citas solo pueden agendarse hasta ${maximumDays} días en el futuro`,
    };
  }

  return { valid: true };
}

/**
 * Generate time slots for a given date range
 */
export function generateTimeSlots(
  startDate: Date,
  endDate: Date,
  slotDuration: number = DEFAULT_SLOT_DURATION,
  businessHours: BusinessHours = DEFAULT_BUSINESS_HOURS
): Array<{ start: Date; end: Date }> {
  const slots: Array<{ start: Date; end: Date }> = [];
  let currentDate = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).endOf('day');

  while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
    const dayOfWeek = currentDate.day();

    if (businessHours.daysOfWeek.includes(dayOfWeek)) {
      const [startHour, startMin] = businessHours.start.split(':').map(Number);
      const [endHour, endMin] = businessHours.end.split(':').map(Number);

      let slotStart = currentDate.hour(startHour).minute(startMin).second(0);
      const dayEnd = currentDate.hour(endHour).minute(endMin).second(0);

      while (slotStart.isBefore(dayEnd)) {
        const slotEnd = slotStart.add(slotDuration, 'minutes');

        if (slotEnd.isAfter(dayEnd)) break;

        slots.push({
          start: slotStart.toDate(),
          end: slotEnd.toDate(),
        });

        slotStart = slotEnd;
      }
    }

    currentDate = currentDate.add(1, 'day');
  }

  return slots;
}
