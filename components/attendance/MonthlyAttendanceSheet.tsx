
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Employee, AttendanceRecord, AttendanceStatus } from '../../types';
import Avatar from '../ui/Avatar';
import { ChevronDown } from 'lucide-react';

interface MonthlyAttendanceSheetProps {
    year: number;
    month: number; // 1-12
    employees: Employee[];
    records: AttendanceRecord[];
    onRecordsChange: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
    onMarkLeave?: (employeeId: string, day: number) => void;
    highlightStartDate?: string;
    highlightEndDate?: string;
}

const statusOptions: { value: AttendanceStatus; label: string }[] = [
    { value: AttendanceStatus.PRESENT, label: 'P' },
    { value: AttendanceStatus.ABSENT, label: 'A' },
    { value: AttendanceStatus.ON_LEAVE, label: 'L' },
    { value: AttendanceStatus.HOLIDAY, label: 'H' },
    { value: AttendanceStatus.WEEK_OFF, label: 'WO' },
    { value: AttendanceStatus.HALF_DAY_LEAVE, label: 'HD' },
    { value: AttendanceStatus.HALF_DAY_PRESENT_ABSENT, label: 'HA' },
];

const statusAbbreviation: Record<AttendanceStatus, string> = {
    [AttendanceStatus.PRESENT]: 'P',
    [AttendanceStatus.ABSENT]: 'A',
    [AttendanceStatus.ON_LEAVE]: 'L',
    [AttendanceStatus.HOLIDAY]: 'H',
    [AttendanceStatus.WEEK_OFF]: 'WO',
    [AttendanceStatus.HALF_DAY_LEAVE]: 'HD',
    [AttendanceStatus.HALF_DAY_PRESENT_ABSENT]: 'HA',
};

// Color maps for better styling control
const statusTextClass: Record<AttendanceStatus, string> = {
    [AttendanceStatus.PRESENT]: 'text-blue-800',
    [AttendanceStatus.ABSENT]: 'text-red-800',
    [AttendanceStatus.ON_LEAVE]: 'text-purple-800',
    [AttendanceStatus.HOLIDAY]: 'text-slate-800',
    [AttendanceStatus.WEEK_OFF]: 'text-red-800',
    [AttendanceStatus.HALF_DAY_LEAVE]: 'text-amber-800',
    [AttendanceStatus.HALF_DAY_PRESENT_ABSENT]: 'text-indigo-800',
};

const statusBgClass: Record<AttendanceStatus, string> = {
    [AttendanceStatus.PRESENT]: 'bg-blue-100',
    [AttendanceStatus.ABSENT]: 'bg-red-100',
    [AttendanceStatus.ON_LEAVE]: 'bg-purple-100',
    [AttendanceStatus.HOLIDAY]: 'bg-slate-100',
    [AttendanceStatus.WEEK_OFF]: 'bg-red-100',
    [AttendanceStatus.HALF_DAY_LEAVE]: 'bg-amber-100',
    [AttendanceStatus.HALF_DAY_PRESENT_ABSENT]: 'bg-indigo-100',
};

const MonthlyAttendanceSheet: React.FC<MonthlyAttendanceSheetProps> = ({ year, month, employees, records, onRecordsChange, onMarkLeave, highlightStartDate, highlightEndDate }) => {
    const [editingCell, setEditingCell] = useState<{ employeeId: string; day: number } | null>(null);
    const selectRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        if (editingCell && selectRef.current) {
            selectRef.current.focus();
        }
    }, [editingCell]);

    const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);
    const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

    const handleStatusChange = (employeeId: string, day: number, newStatus: AttendanceStatus) => {
        if (newStatus === AttendanceStatus.ON_LEAVE && onMarkLeave) {
            onMarkLeave(employeeId, day);
            setEditingCell(null);
            return;
        }

        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onRecordsChange(prevRecords => {
            const existingRecordIndex = prevRecords.findIndex(r => r.employeeId === employeeId && r.date === dateStr);
            if (existingRecordIndex !== -1) {
                const newRecords = [...prevRecords];
                newRecords[existingRecordIndex] = { ...newRecords[existingRecordIndex], status: newStatus };
                return newRecords;
            } else {
                const newRecord: AttendanceRecord = {
                    id: `${employeeId}-${dateStr}`,
                    employeeId,
                    date: dateStr,
                    status: newStatus,
                };
                return [...prevRecords, newRecord];
            }
        });
        setEditingCell(null);
    };
    
    const getStatusForCell = (employeeId: string, day: number): AttendanceStatus | undefined => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return records.find(r => r.employeeId === employeeId && r.date === dateStr)?.status;
    };
    
    return (
        <div className="overflow-x-auto border border-slate-300 rounded-lg bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                    <tr>
                        <th className="p-2 font-semibold text-sm border-b-2 border-slate-300 min-w-[250px] sticky left-0 bg-slate-800 text-white z-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
                            Employee
                        </th>
                        {daysArray.map(day => {
                            const dayOfWeek = new Date(year, month - 1, day).getDay();
                            const isSunday = dayOfWeek === 0;
                            return (
                                <th key={day} className={`p-2 font-semibold text-xs text-center border-b-2 border-slate-300 min-w-[45px] bg-slate-800 text-white ${isSunday ? '!bg-red-900/50' : ''}`}>
                                    {day}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {employees.map((employee, empIndex) => (
                        <tr key={employee.id} className={`${empIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            <td className="p-2 border-b border-r border-slate-200 sticky left-0 bg-inherit z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                                <div className="flex items-center gap-3">
                                    <Avatar name={employee.name} size="md" />
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900 truncate max-w-[150px]">{employee.name}</p>
                                        <p className="text-xs text-slate-500 font-mono">{employee.id}</p>
                                    </div>
                                </div>
                            </td>
                            {daysArray.map(day => {
                                const status = getStatusForCell(employee.id, day);
                                const dayOfWeek = new Date(year, month - 1, day).getDay();
                                const isSunday = dayOfWeek === 0;

                                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                let isHighlighted = false;
                                if (highlightStartDate && highlightEndDate) {
                                    isHighlighted = dateStr >= highlightStartDate && dateStr <= highlightEndDate;
                                }
                                
                                const isCellEditing = editingCell?.employeeId === employee.id && editingCell?.day === day;

                                return (
                                    <td key={day} className={`p-0.5 border-b border-r border-slate-200 text-center transition-colors ${isSunday ? 'bg-red-100/50' : ''} ${isHighlighted ? 'bg-blue-100' : ''}`}>
                                        {isCellEditing ? (
                                            <div className="relative h-full">
                                                <select
                                                    ref={selectRef}
                                                    value={status || ''}
                                                    onChange={(e) => handleStatusChange(employee.id, day, e.target.value as AttendanceStatus)}
                                                    onBlur={() => setEditingCell(null)}
                                                    className={`w-full h-full text-center text-xs font-bold p-2 pr-7 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none focus:z-10 appearance-none transition-colors bg-white border-blue-300 ${status ? statusTextClass[status] : 'text-slate-800'}`}
                                                >
                                                    <option value="" disabled> - </option>
                                                    {statusOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 text-slate-500">
                                                    <ChevronDown size={14} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div 
                                                onDoubleClick={() => setEditingCell({ employeeId: employee.id, day })}
                                                className={`w-full h-full flex items-center justify-center p-2 text-xs font-bold rounded-md cursor-pointer ${status ? (statusBgClass[status] + ' ' + statusTextClass[status]) : ''}`}
                                                title="Double-click to edit"
                                            >
                                                {status ? statusAbbreviation[status] : '-'}
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                     {employees.length === 0 && (
                        <tr>
                            <td colSpan={daysInMonth + 1} className="text-center p-10 text-slate-500">
                                No employees match the current search filter.
                            </td>
                        </tr>
                     )}
                </tbody>
            </table>
        </div>
    );
};

export default MonthlyAttendanceSheet;
