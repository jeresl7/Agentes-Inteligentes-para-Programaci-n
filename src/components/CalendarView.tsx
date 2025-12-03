'use client';

import { Calendar, dayjsLocalizer, View } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Appointment } from '@/types/appointment';
import { useState } from 'react';

const localizer = dayjsLocalizer(dayjs);

interface CalendarViewProps {
  appointments: Appointment[];
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  onSelectEvent?: (event: Appointment) => void;
  onNavigate?: (date: Date) => void;
  onViewChange?: (view: View) => void;
}

export default function CalendarView({
  appointments,
  onSelectSlot,
  onSelectEvent,
  onNavigate,
  onViewChange,
}: CalendarViewProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Transform appointments to calendar events
  const events = appointments.map((apt) => ({
    ...apt,
    start: new Date(apt.start_time),
    end: new Date(apt.end_time),
    title: apt.title,
  }));

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
    onNavigate?.(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
    onViewChange?.(newView);
  };

  // Custom event styling
  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3b82f6'; // blue-500

    if (event.status === 'confirmed') {
      backgroundColor = '#10b981'; // green-500
    } else if (event.status === 'cancelled') {
      backgroundColor = '#ef4444'; // red-500
    } else if (event.status === 'completed') {
      backgroundColor = '#6b7280'; // gray-500
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="h-[700px] bg-white p-4 rounded-lg shadow">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={handleViewChange}
        date={date}
        onNavigate={handleNavigate}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        selectable
        eventPropGetter={eventStyleGetter}
        messages={{
          next: 'Siguiente',
          previous: 'Anterior',
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          agenda: 'Agenda',
          date: 'Fecha',
          time: 'Hora',
          event: 'Evento',
          noEventsInRange: 'No hay eventos en este rango',
          showMore: (total) => `+ Ver más (${total})`,
        }}
      />
    </div>
  );
}
