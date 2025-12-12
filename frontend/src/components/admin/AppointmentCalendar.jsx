import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './AppointmentCalendar.css';
import 'moment/locale/vi';

moment.locale('vi');
const localizer = momentLocalizer(moment);

const AppointmentCalendar = ({ appointments, onSelectEvent }) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  // Convert appointments to calendar events
  const events = appointments.map(appointment => {
    const [year, month, day] = appointment.appointmentDate.split('-');
    const [hours, minutes] = appointment.appointmentTime.split(':');
    
    const start = new Date(year, month - 1, day, hours, minutes);
    const end = new Date(start.getTime() + 30 * 60000); // 30 minutes duration

    return {
      id: appointment.id,
      title: `${appointment.patientName} - ${appointment.doctorName}`,
      start,
      end,
      resource: appointment,
    };
  });

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    
    switch (event.resource.status) {
      case 'PENDING':
        backgroundColor = '#f59e0b'; // amber
        break;
      case 'CONFIRMED':
        backgroundColor = '#3b82f6'; // blue
        break;
      case 'COMPLETED':
        backgroundColor = '#10b981'; // green
        break;
      case 'CANCELLED':
        backgroundColor = '#ef4444'; // red
        break;
      default:
        backgroundColor = '#6b7280'; // gray
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.85rem',
      },
    };
  };

  const messages = {
    allDay: 'Cả ngày',
    previous: '◀ Trước',
    next: 'Sau ▶',
    today: '📅 Hôm nay',
    month: 'Tháng',
    week: 'Tuần',
    day: 'Ngày',
    agenda: 'Lịch trình',
    date: 'Ngày',
    time: 'Thời gian',
    event: 'Sự kiện',
    noEventsInRange: 'Không có lịch hẹn nào trong khoảng thời gian này.',
    showMore: (total) => `+${total} lịch hẹn khác`,
  };

  return (
    <div className="bg-white rounded-lg shadow p-6" style={{ height: '700px' }}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Lịch Hẹn</h2>
        <div className="flex gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></span>
            <span className="text-gray-600">Chờ xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }}></span>
            <span className="text-gray-600">Đã xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></span>
            <span className="text-gray-600">Hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></span>
            <span className="text-gray-600">Đã hủy</span>
          </div>
        </div>
      </div>
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 60px)' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event) => onSelectEvent(event.resource)}
        messages={messages}
        view={view}
        onView={setView}
        date={date}
        onNavigate={handleNavigate}
        views={['month', 'week', 'day', 'agenda']}
        popup
      />
    </div>
  );
};

export default AppointmentCalendar;
