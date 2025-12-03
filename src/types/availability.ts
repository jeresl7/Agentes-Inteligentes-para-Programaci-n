export interface Availability {
  id: number;
  provider_id: number;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  start_time: string; // Format: HH:MM (24-hour)
  end_time: string;   // Format: HH:MM (24-hour)
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  provider_id?: number;
}

export interface AvailabilityQueryParams {
  provider_id?: number;
  date?: string; // YYYY-MM-DD
  start_date?: string;
  end_date?: string;
}
