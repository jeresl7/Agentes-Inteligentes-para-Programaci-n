export interface Appointment {
  id: number;
  title: string;
  description?: string;
  start_time: string; // ISO 8601 datetime
  end_time: string;   // ISO 8601 datetime
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  provider_id?: number;
  service_id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentFormData {
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  provider_id?: number;
  service_id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  notes?: string;
}

export interface AppointmentCreateInput extends Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'status'> {
  status?: 'pending' | 'confirmed';
}

export interface AppointmentUpdateInput extends Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>> {}
