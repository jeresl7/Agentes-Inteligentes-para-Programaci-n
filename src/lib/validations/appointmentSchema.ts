import { z } from 'zod';

export const appointmentSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(100, 'El título es demasiado largo'),
  description: z.string().max(500, 'La descripción es demasiado larga').optional(),
  start_time: z.date({
    required_error: 'La fecha y hora de inicio son requeridas',
    invalid_type_error: 'Formato de fecha inválido',
  }),
  end_time: z.date({
    required_error: 'La fecha y hora de fin son requeridas',
    invalid_type_error: 'Formato de fecha inválido',
  }),
  provider_id: z.number().int().positive().optional(),
  service_id: z.number().int().positive().optional(),
  customer_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es demasiado largo'),
  customer_email: z.string().email('Email inválido'),
  customer_phone: z.string().regex(/^\+?[\d\s\-()]+$/, 'Teléfono inválido').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Las notas son demasiado largas').optional(),
}).refine((data) => data.end_time > data.start_time, {
  message: 'La hora de fin debe ser posterior a la hora de inicio',
  path: ['end_time'],
});

export const appointmentUpdateSchema = appointmentSchema.partial().extend({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type AppointmentUpdateData = z.infer<typeof appointmentUpdateSchema>;
