import { useQuery } from '@tanstack/react-query';
import { TimeSlot } from '@/types/availability';

interface AvailabilityParams {
  provider_id: number;
  date?: string;
  start_date?: string;
  end_date?: string;
}

async function fetchAvailability(params: AvailabilityParams): Promise<TimeSlot[]> {
  const queryParams = new URLSearchParams();
  
  queryParams.append('provider_id', params.provider_id.toString());
  if (params.date) queryParams.append('date', params.date);
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);

  const response = await fetch(`/api/availability?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error('Error al obtener disponibilidad');
  }

  const data = await response.json();
  return data.data.map((slot: any) => ({
    start: new Date(slot.start),
    end: new Date(slot.end),
    available: slot.available,
  }));
}

export function useAvailability(params: AvailabilityParams, enabled: boolean = true) {
  return useQuery({
    queryKey: ['availability', params],
    queryFn: () => fetchAvailability(params),
    enabled: enabled && !!params.provider_id,
  });
}
