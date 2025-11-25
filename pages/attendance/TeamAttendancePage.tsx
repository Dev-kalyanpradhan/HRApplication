
import React, { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { INDIAN_HOLIDAYS } from '../../constants';
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { getSubordinateIds } from '../../utils/hierarchyUtils';

const TeamAttendancePage: React.FC = () => {
    const { currentUser, userRole, employees, attendance } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const visibleEmployees = useMemo(() => {
        if (!currentUser) return [];
        if (userRole === UserRole.ADMIN) return employees;
        if (userRole === UserRole.MANAGER) {
            const subordinateIds = getSubordinateIds(currentUser.id, employees);
            return employees.filter(e => e.id === currentUser.id || subordinateIds.includes(e.id));
        }
        return currentUser ? [currentUser] : [];
    }, [currentUser, userRole, employees]);
    
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(currentUser?.id || (visibleEmployees.length > 0 ? visibleEmployees[0].id : ''));

    const employeeAttendance = useMemo(() => {
        return attendance.filter(record => record.employeeId === selectedEmployeeId);
    }, [attendance, selectedEmployeeId]);
    
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };
    
    return (
        <PageWrapper title="Team Attendance">
            <Card>
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                         <Button variant="secondary" size="sm" onClick={handlePrevMonth} aria-label="Previous month"><ChevronLeft size={16}/></Button>
                         <h3 className="text-lg font-semibold text-center w-48">{currentDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</h3>
                         <Button variant="secondary" size="sm" onClick={handleNextMonth} aria-label="Next month"><ChevronRight size={16}/></Button>
                         <Button variant="secondary" size="sm" onClick={handleToday}>Today</Button>
                    </div>
                    
                    <div className="flex-grow sm:flex-grow-0">
                        <label htmlFor="employee-select" className="sr-only">Select Employee</label>
                        <select 
                           id="employee-select"
                           value={selectedEmployeeId} 
                           onChange={e => setSelectedEmployeeId(e.target.value)} 
                           className="w-full bg-white border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                       >
                           {visibleEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                       </select>
                   </div>
                </div>
                
                <AttendanceCalendar 
                    year={currentDate.getFullYear()}
                    month={currentDate.getMonth()}
                    records={employeeAttendance}
                    holidays={INDIAN_HOLIDAYS}
                />
            </Card>
        </PageWrapper>
    );
};

export default TeamAttendancePage;
