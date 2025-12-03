import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Appointment, AppointmentUpdateInput } from '@/types/appointment';

async function updateAppointment(
  id: number,
  data: AppointmentUpdateInput
): Promise<Appointment> {
  const response = await fetch(`/api/appointments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar la cita');
  }

  const result = await response.json();
  return result.data;
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AppointmentUpdateInput }) =>
      updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
