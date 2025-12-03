'use client';

import { Appointment } from '@/types/appointment';
import dayjs from 'dayjs';

interface AppointmentDetailsProps {
  appointment: Appointment;
  onClose: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
}

export default function AppointmentDetails({
  appointment,
  onClose,
  onEdit,
  onCancel,
}: AppointmentDetailsProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{appointment.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusColors[appointment.status]}`}>
                {statusLabels[appointment.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha y hora de inicio</p>
                <p className="mt-1 text-lg text-gray-900">
                  {dayjs(appointment.start_time).format('DD/MM/YYYY HH:mm')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Fecha y hora de fin</p>
                <p className="mt-1 text-lg text-gray-900">
                  {dayjs(appointment.end_time).format('DD/MM/YYYY HH:mm')}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Duración</p>
              <p className="mt-1 text-gray-900">
                {dayjs(appointment.end_time).diff(dayjs(appointment.start_time), 'minutes')} minutos
              </p>
            </div>

            {appointment.description && (
              <div>
                <p className="text-sm font-medium text-gray-500">Descripción</p>
                <p className="mt-1 text-gray-900">{appointment.description}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del cliente</h3>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="mt-1 text-gray-900">{appointment.customer_name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-gray-900">{appointment.customer_email}</p>
                </div>

                {appointment.customer_phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <p className="mt-1 text-gray-900">{appointment.customer_phone}</p>
                  </div>
                )}
              </div>
            </div>

            {appointment.notes && (
              <div>
                <p className="text-sm font-medium text-gray-500">Notas</p>
                <p className="mt-1 text-gray-900">{appointment.notes}</p>
              </div>
            )}

            <div className="text-xs text-gray-400 pt-4 border-t">
              <p>Creada: {dayjs(appointment.created_at).format('DD/MM/YYYY HH:mm')}</p>
              <p>Actualizada: {dayjs(appointment.updated_at).format('DD/MM/YYYY HH:mm')}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            {appointment.status !== 'cancelled' && onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-50"
              >
                Cancelar cita
              </button>
            )}
            {appointment.status === 'pending' && onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Editar
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
