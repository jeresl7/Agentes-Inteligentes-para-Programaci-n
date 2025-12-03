import { useQuery } from '@tanstack/react-query';
import { Provider } from '@/types/provider';

async function fetchProviders(): Promise<Provider[]> {
  const response = await fetch('/api/providers');

  if (!response.ok) {
    throw new Error('Error al obtener los proveedores');
  }

  const data = await response.json();
  return data.data;
}

export function useProviders() {
  return useQuery({
    queryKey: ['providers'],
    queryFn: fetchProviders,
  });
}
