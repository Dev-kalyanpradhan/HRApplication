import React from 'react';
import { AttendanceRecord, AttendanceStatus } from '../../types';

interface AttendanceCalendarProps {
  year: number;
  month: number; // 0-11
  records: AttendanceRecord[];
  holidays: { date: string; name: string }[];
  isEditable?: boolean;
  onDayClick?: (date: string) => void;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ year, month, records, holidays, isEditable = false, onDayClick }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon, ...

  const getStatusForDate = (date: string): AttendanceStatus | undefined => {
    const record = records.find(r => r.date === date);
    return record?.status;
  };

  const getHolidayForDate = (date: string): string | undefined => {
    const holiday = holidays.find(h => h.date === date);
    return holiday?.name;
  }

  const statusColors: Record<AttendanceStatus, string> = {
    [AttendanceStatus.PRESENT]: 'bg-green-500',
    [AttendanceStatus.ABSENT]: 'bg-red-500',
    [AttendanceStatus.ON_LEAVE]: 'bg-blue-500',
    [AttendanceStatus.HOLIDAY]: 'bg-yellow-400',
    [AttendanceStatus.WEEK_OFF]: 'bg-red-400',
    [AttendanceStatus.HALF_DAY_LEAVE]: 'bg-orange-500',
    [AttendanceStatus.HALF_DAY_PRESENT_ABSENT]: 'bg-purple-500',
  };

  const calendarDays = [];
  // Add blank days for the first week
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-start-${i}`} className="border-r border-b border-slate-200"></div>);
  }

  // Add actual days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const status = getStatusForDate(dateStr);
    const holidayName = getHolidayForDate(dateStr);
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

    let dayClass = 'relative p-2 border-r border-b border-slate-200 text-sm min-h-[6rem]';
    if (holidayName) {
        dayClass += ' bg-yellow-50';
    }
     if (isEditable) {
        dayClass += ' cursor-pointer hover:bg-slate-100 transition-colors';
    }


    calendarDays.push(
      <div 
        key={day} 
        className={dayClass} 
        title={holidayName}
        onClick={isEditable ? () => onDayClick?.(dateStr) : undefined}
      >
        <div className={`flex items-center justify-center w-7 h-7 rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
          {day}
        </div>
        {status && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
             <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} title={status}></div>
          </div>
        )}
      </div>
    );
  }
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-7 border-t border-l border-slate-200 bg-white">
      {weekDays.map(day => (
        <div key={day} className="p-2 text-center font-semibold text-slate-600 border-r border-b border-slate-200 bg-slate-50">
          {day}
        </div>
      ))}
      {calendarDays}
    </div>
  );
};

export default AttendanceCalendar;