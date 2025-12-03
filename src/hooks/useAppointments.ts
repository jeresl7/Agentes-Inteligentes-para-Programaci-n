import { useQuery } from '@tanstack/react-query';
import { Appointment } from '@/types/appointment';
import { AppointmentQueryParams } from '@/types/api';

async function fetchAppointments(params?: AppointmentQueryParams): Promise<Appointment[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);
  if (params?.provider_id) queryParams.append('provider_id', params.provider_id.toString());
  if (params?.status) queryParams.append('status', params.status);

  const url = `/api/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Error al obtener las citas');
  }

  const data = await response.json();
  return data.data;
}

export function useAppointments(params?: AppointmentQueryParams) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => fetchAppointments(params),
  });
}
