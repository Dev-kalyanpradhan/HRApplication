import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  label: string;
  id: string;
  value: string; // HH:mm
  onChange: (value: string) => void;
  disabled?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ label, id, value, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const initialHour = value ? value.split(':')[0] : '09';
  const initialMinute = value ? value.split(':')[1] : '00';

  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHour(h);
      setMinute(m);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  useEffect(() => {
    if (isOpen) {
        setTimeout(() => {
            hourRef.current?.querySelector(`[data-hour="${hour}"]`)?.scrollIntoView({ block: 'center' });
            minuteRef.current?.querySelector(`[data-minute="${minute}"]`)?.scrollIntoView({ block: 'center' });
        }, 50);
    }
  }, [isOpen, hour, minute]);

  const handleSetTime = () => {
    onChange(`${hour}:${minute}`);
    setIsOpen(false);
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="relative" ref={wrapperRef}>
      <div onClick={() => !disabled && setIsOpen(p => !p)}>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
          <input
            id={id}
            type="text"
            value={value}
            readOnly
            disabled={disabled}
            placeholder="HH:mm"
            className={`block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10 ${disabled ? 'cursor-not-allowed bg-slate-50 text-slate-500' : 'cursor-pointer'}`}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border p-2">
          <div className="flex justify-center items-center gap-1">
            <div ref={hourRef} className="h-48 overflow-y-scroll snap-y scrollbar-thin">
              {hours.map(h => (
                <button key={h} type="button" data-hour={h} onClick={() => setHour(h)} className={`block w-full text-center p-2 rounded-md snap-center ${h === hour ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                  {h}
                </button>
              ))}
            </div>
            <span className="font-bold text-lg">:</span>
            <div ref={minuteRef} className="h-48 overflow-y-scroll snap-y scrollbar-thin">
              {minutes.map(m => (
                <button key={m} type="button" data-minute={m} onClick={() => setMinute(m)} className={`block w-full text-center p-2 rounded-md snap-center ${m === minute ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={handleSetTime} className="w-full mt-2 bg-blue-600 text-white text-sm font-semibold py-1.5 rounded-md hover:bg-blue-700">
            Set Time
          </button>
        </div>
      )}
       <style>{`
          .scrollbar-thin::-webkit-scrollbar { width: 4px; }
          .scrollbar-thin::-webkit-scrollbar-track { background: #f1f5f9; }
          .scrollbar-thin::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 4px; }
          .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #94a3b8 #f1f5f9; }
        `}</style>
    </div>
  );
};

export default TimePicker;