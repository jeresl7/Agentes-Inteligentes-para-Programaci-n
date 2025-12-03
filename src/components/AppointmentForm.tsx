'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, AppointmentFormData } from '@/lib/validations/appointmentSchema';
import { useProviders } from '@/hooks/useProviders';
import { useServices } from '@/hooks/useServices';
import dayjs from 'dayjs';

interface AppointmentFormProps {
  initialData?: Partial<AppointmentFormData>;
  onSubmit: (data: AppointmentFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export default function AppointmentForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AppointmentFormProps) {
  const { data: providers } = useProviders();
  const { data: services } = useServices();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      ...initialData,
      start_time: initialData?.start_time || new Date(),
      end_time: initialData?.end_time || dayjs().add(30, 'minutes').toDate(),
    },
  });

  const selectedServiceId = watch('service_id');

  // Auto-calculate end time based on service duration
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = parseInt(e.target.value);
    setValue('service_id', serviceId);

    const service = services?.find((s) => s.id === serviceId);
    if (service) {
      const startTime = watch('start_time');
      if (startTime) {
        const endTime = dayjs(startTime).add(service.duration, 'minutes').toDate();
        setValue('end_time', endTime);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
          Nombre completo *
        </label>
        <input
          type="text"
          id="customer_name"
          {...register('customer_name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.customer_name && (
          <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700">
          Email *
        </label>
        <input
          type="email"
          id="customer_email"
          {...register('customer_email')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.customer_email && (
          <p className="mt-1 text-sm text-red-600">{errors.customer_email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <input
          type="tel"
          id="customer_phone"
          {...register('customer_phone')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.customer_phone && (
          <p className="mt-1 text-sm text-red-600">{errors.customer_phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="provider_id" className="block text-sm font-medium text-gray-700">
          Proveedor
        </label>
        <select
          id="provider_id"
          {...register('provider_id', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Seleccionar proveedor</option>
          {providers?.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name} {provider.specialty && `- ${provider.specialty}`}
            </option>
          ))}
        </select>
        {errors.provider_id && (
          <p className="mt-1 text-sm text-red-600">{errors.provider_id.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="service_id" className="block text-sm font-medium text-gray-700">
          Servicio
        </label>
        <select
          id="service_id"
          onChange={handleServiceChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Seleccionar servicio</option>
          {services?.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - {service.duration} min
              {service.price && ` - $${service.price}`}
            </option>
          ))}
        </select>
        {errors.service_id && (
          <p className="mt-1 text-sm text-red-600">{errors.service_id.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Título de la cita *
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
            Fecha y hora de inicio *
          </label>
          <input
            type="datetime-local"
            id="start_time"
            {...register('start_time', { valueAsDate: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.start_time && (
            <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
            Fecha y hora de fin *
          </label>
          <input
            type="datetime-local"
            id="end_time"
            {...register('end_time', { valueAsDate: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.end_time && (
            <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notas adicionales
        </label>
        <textarea
          id="notes"
          rows={2}
          {...register('notes')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar cita'}
        </button>
      </div>
    </form>
  );
}
