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
import { useProviders } from '@/hooks/useProviders';
import { useServices } from '@/hooks/useServices';
import { Appointment } from '@/types/appointment';
import { AppointmentFormData } from '@/lib/validations/appointmentSchema';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [initialFormData, setInitialFormData] = useState<Partial<AppointmentFormData> | undefined>();
  const [isCreatingTestAppointment, setIsCreatingTestAppointment] = useState(false);
  const [isFillingCalendar, setIsFillingCalendar] = useState(false);

  // Calculate date range for queries (current month)
  const startDate = dayjs(selectedDate).startOf('month').subtract(7, 'days').format('YYYY-MM-DD');
  const endDate = dayjs(selectedDate).endOf('month').add(7, 'days').format('YYYY-MM-DD');

  const { data: appointments, isLoading } = useAppointments({
    start_date: startDate,
    end_date: endDate,
  });

  const { data: providers } = useProviders();
  const { data: services } = useServices();

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

  const handleCreateTestAppointment = async () => {
    if (!providers || !services || providers.length === 0 || services.length === 0) {
      alert('No hay proveedores o servicios disponibles');
      return;
    }

    setIsCreatingTestAppointment(true);

    try {
      // Datos aleatorios para clientes
      const firstNames = ['Carlos', 'María', 'José', 'Ana', 'Luis', 'Laura', 'Pedro', 'Carmen', 'Miguel', 'Isabel'];
      const lastNames = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres'];
      
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const customerName = `${firstName} ${lastName}`;
      
      // Seleccionar proveedor y servicio aleatorios
      const randomProvider = providers[Math.floor(Math.random() * providers.length)];
      const randomService = services[Math.floor(Math.random() * services.length)];

      // Generar fecha aleatoria en noviembre 2025 (días laborables: 1-5)
      const daysOfWeek = [1, 2, 3, 4, 5]; // Lunes a Viernes
      const randomDay = Math.floor(Math.random() * 30) + 1; // 1-30 de noviembre
      
      const appointmentDate = new Date(2025, 10, randomDay); // Mes 10 = noviembre
      
      // Si cae en fin de semana, ajustar al lunes siguiente
      if (appointmentDate.getDay() === 0) {
        appointmentDate.setDate(appointmentDate.getDate() + 1); // Domingo -> Lunes
      } else if (appointmentDate.getDay() === 6) {
        appointmentDate.setDate(appointmentDate.getDate() + 2); // Sábado -> Lunes
      }

      // Generar hora aleatoria entre 9 AM y 4 PM (para que termine antes de las 5 PM)
      const possibleHours = [9, 10, 11, 12, 13, 14, 15, 16];
      const randomHour = possibleHours[Math.floor(Math.random() * possibleHours.length)];
      const randomMinutes = Math.random() < 0.5 ? 0 : 30; // 0 o 30 minutos

      appointmentDate.setHours(randomHour, randomMinutes, 0, 0);

      // Calcular hora de fin basada en la duración del servicio
      const endTime = new Date(appointmentDate);
      endTime.setMinutes(endTime.getMinutes() + randomService.duration);

      // Verificar disponibilidad
      const checkResponse = await fetch(`/api/availability?provider_id=${randomProvider.id}&date=${dayjs(appointmentDate).format('YYYY-MM-DD')}`);
      
      if (!checkResponse.ok) {
        throw new Error('Error al verificar disponibilidad');
      }

      const availabilityData = await checkResponse.json();
      const timeSlots = availabilityData.data;

      // Buscar un slot disponible que contenga la hora propuesta
      const isAvailable = timeSlots.some((slot: any) => {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slot.end);
        return slot.available && 
               appointmentDate >= slotStart && 
               endTime <= slotEnd;
      });

      if (!isAvailable) {
        // Intentar encontrar el primer slot disponible del día
        const availableSlot = timeSlots.find((slot: any) => slot.available);
        
        if (availableSlot) {
          const slotStart = new Date(availableSlot.start);
          appointmentDate.setHours(slotStart.getHours(), slotStart.getMinutes(), 0, 0);
          endTime.setTime(appointmentDate.getTime());
          endTime.setMinutes(endTime.getMinutes() + randomService.duration);
        } else {
          throw new Error('No hay horarios disponibles para este día. Intentando otro día...');
        }
      }

      // Crear la cita
      await createMutation.mutateAsync({
        title: `${randomService.name} - ${customerName}`,
        description: `Cita de prueba generada automáticamente`,
        start_time: appointmentDate.toISOString(),
        end_time: endTime.toISOString(),
        provider_id: randomProvider.id,
        service_id: randomService.id,
        customer_name: customerName,
        customer_email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        customer_phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: 'Cita de prueba generada automáticamente',
      });

      alert(`✓ Cita de prueba creada:\n${customerName}\n${dayjs(appointmentDate).format('DD/MM/YYYY HH:mm')}\n${randomService.name}`);
    } catch (error: any) {
      alert(error.message || 'Error al crear la cita de prueba. Intente nuevamente.');
    } finally {
      setIsCreatingTestAppointment(false);
    }
  };

  const handleFillCalendar = async () => {
    if (!providers || !services || providers.length === 0 || services.length === 0) {
      alert('No hay proveedores o servicios disponibles');
      return;
    }

    const confirmFill = confirm(
      '¿Desea llenar el calendario de Noviembre 2025 con citas de 7 AM a 8 PM?\n\n' +
      'Esto creará aproximadamente 100+ citas aleatorias.\n\n' +
      '⚠️ Esto puede tomar varios minutos.'
    );

    if (!confirmFill) return;

    setIsFillingCalendar(true);

    try {
      const firstNames = ['Carlos', 'María', 'José', 'Ana', 'Luis', 'Laura', 'Pedro', 'Carmen', 'Miguel', 'Isabel', 'Fernando', 'Sofía', 'Diego', 'Lucía', 'Javier'];
      const lastNames = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez'];

      let createdCount = 0;
      let failedCount = 0;
      const maxAttempts = 150; // Intentar crear hasta 150 citas

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
          const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
          const customerName = `${firstName} ${lastName}`;

          const randomProvider = providers[Math.floor(Math.random() * providers.length)];
          const randomService = services[Math.floor(Math.random() * services.length)];

          // Generar fecha aleatoria en noviembre 2025
          const randomDay = Math.floor(Math.random() * 30) + 1;
          const appointmentDate = new Date(2025, 10, randomDay);

          // Ajustar si es fin de semana
          if (appointmentDate.getDay() === 0) {
            appointmentDate.setDate(appointmentDate.getDate() + 1);
          } else if (appointmentDate.getDay() === 6) {
            appointmentDate.setDate(appointmentDate.getDate() + 2);
          }

          // Generar hora entre 7 AM y 7:30 PM (para que termine antes de las 8 PM)
          const possibleHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
          const randomHour = possibleHours[Math.floor(Math.random() * possibleHours.length)];
          const randomMinutes = Math.random() < 0.5 ? 0 : 30;

          appointmentDate.setHours(randomHour, randomMinutes, 0, 0);

          const endTime = new Date(appointmentDate);
          endTime.setMinutes(endTime.getMinutes() + randomService.duration);

          // Verificar que no pase de las 8 PM
          if (endTime.getHours() >= 20) {
            continue; // Saltar este intento
          }

          // Verificar disponibilidad
          const checkResponse = await fetch(`/api/availability?provider_id=${randomProvider.id}&date=${dayjs(appointmentDate).format('YYYY-MM-DD')}`);
          
          if (!checkResponse.ok) {
            failedCount++;
            continue;
          }

          const availabilityData = await checkResponse.json();
          const timeSlots = availabilityData.data;

          const isAvailable = timeSlots.some((slot: any) => {
            const slotStart = new Date(slot.start);
            const slotEnd = new Date(slot.end);
            return slot.available && 
                   appointmentDate >= slotStart && 
                   endTime <= slotEnd;
          });

          if (!isAvailable) {
            failedCount++;
            continue;
          }

          // Crear la cita sin mostrar alert
          await createMutation.mutateAsync({
            title: `${randomService.name} - ${customerName}`,
            description: `Cita de llenado automático`,
            start_time: appointmentDate.toISOString(),
            end_time: endTime.toISOString(),
            provider_id: randomProvider.id,
            service_id: randomService.id,
            customer_name: customerName,
            customer_email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
            customer_phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
            notes: 'Llenado automático del calendario',
          });

          createdCount++;

          // Pequeña pausa para no saturar el servidor
          if (createdCount % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

        } catch (error) {
          failedCount++;
          continue;
        }
      }

      alert(`✓ Calendario llenado:\n\n${createdCount} citas creadas exitosamente\n${failedCount} intentos fallidos`);
    } catch (error: any) {
      alert(error.message || 'Error al llenar el calendario');
    } finally {
      setIsFillingCalendar(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-100">Sistema de Citas</h1>
            <div className="flex gap-3">
              <button
                onClick={handleFillCalendar}
                disabled={isFillingCalendar}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFillingCalendar ? 'Llenando calendario...' : '📅 Llenar calendario (7AM-8PM)'}
              </button>
              <button
                onClick={handleCreateTestAppointment}
                disabled={isCreatingTestAppointment}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingTestAppointment ? 'Creando...' : '🎲 Agregar cita de prueba'}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                + Nueva Cita
              </button>
            </div>
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
