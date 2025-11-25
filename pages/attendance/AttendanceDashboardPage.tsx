
import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, LeaveRequest, LeaveStatus, LeaveType, UserRole, WorkLocation, AttendanceStatus } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import { getSubordinateIds } from '../../utils/hierarchyUtils';

// Sub-component for Daily Stat cards
const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center">
        <div className={`w-1.5 h-10 rounded-full ${color}`} />
        <div className="ml-4">
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

// Sub-component for Overtime Request cards
const OvertimeRequestCard: React.FC<{ request: LeaveRequest; employee?: Employee, onApprove: (id: string) => void, onReject: (id: string) => void }> = ({ request, employee, onApprove, onReject }) => {
    if (!employee) return null;
    
    const date = new Date(request.startDate + 'T00:00:00Z');
    const dateString = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' });

    return (
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3 h-full flex flex-col">
            <div className="flex items-center gap-3">
                <Avatar name={employee.name} size="md" />
                <div>
                    <p className="font-semibold text-slate-800">{employee.name}</p>
                    <p className="text-xs text-slate-500">{employee.role}</p>
                </div>
            </div>
            <div className="flex-grow space-y-2 text-sm">
                <div>
                    <p className="font-medium text-slate-500">Date</p>
                    <p className="text-slate-700">{dateString} {request.startTime && request.endTime && `(${request.startTime} - ${request.endTime})`}</p>
                </div>
                 <div>
                    <p className="font-medium text-slate-500">Reason</p>
                    <p className="text-slate-700">{request.reason}</p>
                </div>
            </div>
            <div className="flex justify-end items-center gap-4 pt-2 border-t border-slate-200">
                <button onClick={() => onReject(request.id)} className="text-sm font-semibold text-red-500 hover:text-red-700">Reject</button>
                <button onClick={() => onApprove(request.id)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Approve</button>
            </div>
        </div>
    );
};

// Sub-component for Time Off Request list
const TimeOffRequestsCard: React.FC<{ requests: LeaveRequest[]; onApprove: (id: string) => void, onReject: (id: string) => void }> = ({ requests, onApprove, onReject }) => {
     const getLeaveTypeChip = (type: LeaveType) => {
        switch(type) {
            case LeaveType.SICK: return 'bg-green-100 text-green-800 border-green-200';
            case LeaveType.CASUAL: return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };
    return (
        <Card title="Time Off Requests">
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {requests.length > 0 ? requests.map(req => (
                    <div key={req.id} className="flex items-center gap-3">
                        <Avatar name={req.employeeName} size="md" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm text-slate-800">{req.employeeName}</p>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${getLeaveTypeChip(req.leaveType)}`}>
                                    {req.leaveType === LeaveType.CASUAL ? 'Personal' : 'Medical'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">{new Date(req.startDate+'T00:00:00Z').toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})} - {new Date(req.endDate+'T00:00:00Z').toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => onReject(req.id)} className="text-xs font-semibold text-red-500 hover:text-red-700">Reject</button>
                             <button onClick={() => onApprove(req.id)} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Approve</button>
                        </div>
                    </div>
                )) : <p className="text-sm text-slate-500 text-center py-10">No pending time off requests.</p>}
            </div>
        </Card>
    );
};

// Sub-component for Team Attendance Calendar
const TeamAttendanceCalendar: React.FC<{ employeesToShow: Employee[], records: any[], currentDate: Date, onPrevMonth: () => void, onNextMonth: () => void }> = ({ employeesToShow, records, currentDate, onPrevMonth, onNextMonth }) => {
    
    const { year, month } = { year: currentDate.getFullYear(), month: currentDate.getMonth() };
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarGrid = useMemo(() => {
        const grid = [];
        for (let i = 0; i < firstDayOfMonth; i++) grid.push(null);
        for (let i = 1; i <= daysInMonth; i++) grid.push(new Date(year, month, i));
        return grid;
    }, [year, month, daysInMonth, firstDayOfMonth]);

    const getStatusForDay = (employeeId: string, date: Date) => {
        if (!date) return null;
        const dateStr = date.toISOString().split('T')[0];
        const record = records.find(r => r.employeeId === employeeId && r.date === dateStr);
        if (!record) return null;

        const employee = employeesToShow.find(e => e.id === employeeId);
        if(record.status === AttendanceStatus.PRESENT && employee?.workLocation === WorkLocation.HOME) {
            return 'wfh';
        }

        const statusMap: Record<AttendanceStatus, string> = {
            [AttendanceStatus.WEEK_OFF]: 'off',
            [AttendanceStatus.HOLIDAY]: 'holiday',
            [AttendanceStatus.ON_LEAVE]: 'leave',
            [AttendanceStatus.ABSENT]: 'absent',
            [AttendanceStatus.PRESENT]: 'present', // This case might not be used if WFH is prioritized
            [AttendanceStatus.HALF_DAY_LEAVE]: 'leave', // Simplified
            [AttendanceStatus.HALF_DAY_PRESENT_ABSENT]: 'absent', // Simplified
        };
        return statusMap[record.status] || null;
    };
    
    const statusColors: Record<string, string> = {
        wfh: 'bg-purple-400', // Work for home
        off: 'bg-orange-400', // Weekly off
        leave: 'bg-green-400', // Paid leave
        absent: 'bg-red-400', // No attendance
        holiday: 'bg-blue-400'
    };
    
    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={onPrevMonth} className="p-2 rounded-md hover:bg-slate-100"><ChevronLeft size={20} /></button>
                    <h3 className="text-lg font-semibold w-32 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={onNextMonth} className="p-2 rounded-md hover:bg-slate-100"><ChevronRight size={20} /></button>
                </div>
                 <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-400"/>Work from home</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-400"/>Weekly off</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-400"/>Paid leave</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"/>No attendance</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400"/>Holiday</div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <div className="grid grid-cols-[150px_repeat(31,minmax(40px,1fr))] gap-x-2 text-sm">
                     {/* Header: Employee */}
                    <div className="sticky left-0 bg-slate-50 py-2 font-semibold">Employee</div>
                    {/* Header: Dates */}
                    {Array.from({length: daysInMonth}).map((_, i) => {
                         const date = new Date(year, month, i + 1);
                         const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
                         const dayOfMonth = date.getDate();
                        return <div key={i} className="text-center py-2"><p className="text-slate-500">{dayName}</p><p className="font-semibold">{dayOfMonth}</p></div>
                    })}
                    
                     {/* Rows: Employee data */}
                    {employeesToShow.map(emp => (
                        <React.Fragment key={emp.id}>
                            <div className="sticky left-0 bg-white py-2 font-semibold flex items-center gap-2 pr-2 border-t">
                                <Avatar name={emp.name} size="sm" />
                                {emp.name}
                            </div>
                            {Array.from({length: daysInMonth}).map((_, i) => {
                                const date = new Date(year, month, i + 1);
                                const status = getStatusForDay(emp.id, date);
                                return (
                                    <div key={i} className="h-full flex items-center justify-center border-t">
                                        {status && status !== 'present' && <div className={`w-5 h-5 rounded-full ${statusColors[status]}`} title={status}/>}
                                    </div>
                                )
                            })}
                        </React.Fragment>
                    ))}

                </div>
            </div>
        </Card>
    );
};


const AttendanceDashboardPage: React.FC = () => {
    const { currentUser, userRole, employees, punchRecords, leaveRequests, attendance, updateLeaveRequestStatus } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());

    const todayStr = new Date().toISOString().split('T')[0];

    const stats = useMemo(() => {
        const todayPunches = punchRecords.filter(p => p.date === todayStr);
        const lateArrivals = todayPunches.filter(p => p.punchIn && new Date(p.punchIn).getHours() >= 10 || (new Date(p.punchIn).getHours() === 9 && new Date(p.punchIn).getMinutes() > 30)).length;
        const onTime = todayPunches.length - lateArrivals;

        const onDutyToday = leaveRequests.filter(lr => lr.leaveType === LeaveType.ON_DUTY && lr.status === LeaveStatus.APPROVED && todayStr >= lr.startDate && todayStr <= lr.endDate).length;
        const wfhEmployees = employees.filter(e => e.workLocation === WorkLocation.HOME).length;
        
        const remoteClockIns = todayPunches.filter(p => employees.find(e => e.id === p.employeeId)?.workLocation === WorkLocation.HOME).length;

        return { lateArrivals, onTime, wfhOnDuty: onDutyToday + wfhEmployees, remoteClockIns };
    }, [punchRecords, leaveRequests, employees, todayStr]);
    
    const subordinateIds = useMemo(() => {
        if (!currentUser || userRole !== UserRole.MANAGER) return [];
        return getSubordinateIds(currentUser.id, employees);
    }, [currentUser, userRole, employees]);

    const teamIds = useMemo(() => {
        if(userRole === UserRole.ADMIN) return employees.map(e => e.id);
        if(userRole === UserRole.MANAGER && currentUser) return [currentUser.id, ...subordinateIds];
        return [];
    }, [userRole, currentUser, subordinateIds, employees]);

    const pendingOvertimeRequests = useMemo(() => {
        return leaveRequests.filter(lr => lr.leaveType === LeaveType.ON_DUTY && teamIds.includes(lr.employeeId) && lr.status === LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL);
    }, [leaveRequests, teamIds]);

    const pendingTimeOffRequests = useMemo(() => {
        return leaveRequests.filter(lr => lr.leaveType !== LeaveType.ON_DUTY && teamIds.includes(lr.employeeId) && (lr.status === LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL || lr.status === LeaveStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL));
    }, [leaveRequests, teamIds]);
    
    const handleApprove = (id: string) => updateLeaveRequestStatus(id, LeaveStatus.APPROVED);
    const handleReject = (id: string) => updateLeaveRequestStatus(id, LeaveStatus.REJECTED);

    const employeesForCalendar = useMemo(() => {
        if(userRole === UserRole.ADMIN) return employees.slice(0, 5); // Show first 5 for admin
        if(userRole === UserRole.MANAGER && currentUser) return [currentUser, ...employees.filter(e => subordinateIds.includes(e.id))].slice(0,5);
        return [];
    }, [userRole, currentUser, employees, subordinateIds]);
    
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));


    return (
        <PageWrapper title="Time & Attendance Dashboard">
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                             <h2 className="text-xl font-bold text-slate-800">Today's Stats</h2>
                             {/* Placeholder for filters */}
                             <div className="flex items-center gap-2">
                                 <select className="text-sm bg-white border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                     <option>All Departments</option>
                                 </select>
                                  <select className="text-sm bg-white border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                     <option>Location</option>
                                 </select>
                             </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                           <StatCard title="Late arrivals" value={stats.lateArrivals} color="bg-purple-500" />
                           <StatCard title="On time" value={stats.onTime} color="bg-green-500" />
                           <StatCard title="WFH / On duty" value={stats.wfhOnDuty} color="bg-orange-500" />
                           <StatCard title="Remote clock-ins" value={stats.remoteClockIns} color="bg-indigo-500" />
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                         <TimeOffRequestsCard requests={pendingTimeOffRequests} onApprove={handleApprove} onReject={handleReject}/>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Overtime Requests</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingOvertimeRequests.length > 0 ? pendingOvertimeRequests.map(req => (
                            <OvertimeRequestCard 
                                key={req.id} 
                                request={req} 
                                employee={employees.find(e => e.id === req.employeeId)}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        )) : <p className="text-sm text-slate-500 md:col-span-3 text-center py-10">No pending overtime requests.</p>}
                    </div>
                </div>

                <TeamAttendanceCalendar 
                    employeesToShow={employeesForCalendar}
                    records={attendance}
                    currentDate={currentDate}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                />

            </div>
        </PageWrapper>
    );
};

export default AttendanceDashboardPage;
