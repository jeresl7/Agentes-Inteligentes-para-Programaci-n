import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Appointment, AppointmentCreateInput } from '@/types/appointment';

async function createAppointment(data: AppointmentCreateInput): Promise<Appointment> {
  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear la cita');
  }

  const result = await response.json();
  return result.data;
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
