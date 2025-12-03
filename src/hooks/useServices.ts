import { useQuery } from '@tanstack/react-query';
import { Service } from '@/types/service';

async function fetchServices(): Promise<Service[]> {
  const response = await fetch('/api/services');

  if (!response.ok) {
    throw new Error('Error al obtener los servicios');
  }

  const data = await response.json();
  return data.data;
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
  });
}
