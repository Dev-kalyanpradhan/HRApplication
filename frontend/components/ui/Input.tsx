import React from 'react';
import { Calendar } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, type, ...props }) => {
  const isDate = type === 'date';

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          className={`block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isDate ? 'pr-10' : ''}`}
          {...props}
        />
        {isDate && (
          <>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-slate-400" />
            </div>
            {/* This style block makes the native picker transparent but clickable over the whole input, solving the invisible icon issue */}
            <style>{`
              input[type="date"]::-webkit-calendar-picker-indicator {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100%;
                cursor: pointer;
                color: transparent;
                background: transparent;
              }
              
              /* For Firefox - it's harder to style, but let's at least make it look a bit better */
              input[type="date"] {
                -moz-appearance: none; /* Potentially removes default styling that could interfere */
                 appearance: none;
              }
            `}</style>
          </>
        )}
      </div>
    </div>
  );
};

export default Input;