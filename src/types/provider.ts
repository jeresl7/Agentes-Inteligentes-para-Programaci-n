export interface Provider {
  id: number;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  created_at: string;
}

export interface ProviderWithAvailability extends Provider {
  availability: Availability[];
}
