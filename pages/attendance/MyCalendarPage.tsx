
import React, { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { INDIAN_HOLIDAYS } from '../../constants';
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';

const MyCalendarPage: React.FC = () => {
    const { currentUser, attendance } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const employeeAttendance = useMemo(() => {
        if (!currentUser) return [];
        return attendance.filter(record => record.employeeId === currentUser.id);
    }, [attendance, currentUser]);
    
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };
    
    const StatusLegend = () => (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Present</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Absent</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> On Leave</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400"></div> Holiday</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div> Week Off</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Half Day Leave</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Half Day Work</div>
        </div>
    );

    return (
        <PageWrapper title="My Attendance Calendar">
            <Card>
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                         <Button variant="secondary" size="sm" onClick={handlePrevMonth} aria-label="Previous month"><ChevronLeft size={16}/></Button>
                         <h3 className="text-lg font-semibold text-center w-48">{currentDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</h3>
                         <Button variant="secondary" size="sm" onClick={handleNextMonth} aria-label="Next month"><ChevronRight size={16}/></Button>
                         <Button variant="secondary" size="sm" onClick={handleToday}>Today</Button>
                    </div>
                </div>

                <div className="mb-4">
                    <StatusLegend />
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

export default MyCalendarPage;
