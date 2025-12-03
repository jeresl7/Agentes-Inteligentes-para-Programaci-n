'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import CalendarView from '@/components/CalendarView';
import AppointmentForm from '@/components/AppointmentForm';
import AppointmentDetails from '@/components/AppointmentDetails';
import Modal from '@/components/Modal';
import { useAppointments } from '@/hooks/useAppointments';
import { useCreateAppointment } from '@/hooks/useCreateAppointment';
import { useUpdateAppointment } from '@/hooks/useUpdateAppointment';
import { useDeleteAppointment } from '@/hooks/useDeleteAppointment';
import { Appointment } from '@/types/appointment';
import { AppointmentFormData } from '@/lib/validations/appointmentSchema';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [initialFormData, setInitialFormData] = useState<Partial<AppointmentFormData> | undefined>();

  // Calculate date range for queries (current month)
  const startDate = dayjs(selectedDate).startOf('month').subtract(7, 'days').format('YYYY-MM-DD');
  const endDate = dayjs(selectedDate).endOf('month').add(7, 'days').format('YYYY-MM-DD');

  const { data: appointments, isLoading } = useAppointments({
    start_date: startDate,
    end_date: endDate,
  });

  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setInitialFormData({
      start_time: slotInfo.start,
      end_time: slotInfo.end,
      title: '',
      customer_name: '',
      customer_email: '',
    });
    setShowCreateModal(true);
  };

  const handleSelectEvent = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCreateAppointment = async (data: AppointmentFormData) => {
    try {
      await createMutation.mutateAsync({
        title: data.title,
        description: data.description,
        start_time: data.start_time.toISOString(),
        end_time: data.end_time.toISOString(),
        provider_id: data.provider_id,
        service_id: data.service_id,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        notes: data.notes,
      });
      setShowCreateModal(false);
      setInitialFormData(undefined);
    } catch (error: any) {
      alert(error.message || 'Error al crear la cita');
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      try {
        await deleteMutation.mutateAsync(selectedAppointment.id);
        setShowDetailsModal(false);
        setSelectedAppointment(null);
      } catch (error: any) {
        alert(error.message || 'Error al cancelar la cita');
      }
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setInitialFormData(undefined);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Citas</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              + Nueva Cita
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <CalendarView
              appointments={appointments || []}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              onNavigate={setSelectedDate}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        title="Nueva Cita"
      >
        <AppointmentForm
          initialData={initialFormData}
          onSubmit={handleCreateAppointment}
          onCancel={handleCloseCreateModal}
          isSubmitting={createMutation.isPending}
        />
      </Modal>

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={handleCloseDetailsModal}
          onCancel={handleCancelAppointment}
        />
      )}
    </div>
  );
}
