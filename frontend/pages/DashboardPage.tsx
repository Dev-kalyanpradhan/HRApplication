import React, { useMemo } from 'react';
import { Users, Briefcase, CalendarCheck, UserPlus, CalendarOff, ArrowRight, PartyPopper } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import { LeaveStatus, UserRole, InterviewStatus, Employee } from '../types';
import { INDIAN_HOLIDAYS } from '../constants';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { getSubordinateIds } from '../utils/hierarchyUtils';
import { Link } from 'react-router-dom';
import RecentAnnouncementsCard from '../components/dashboard/RecentAnnouncementsCard';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
    <Card className="flex items-center p-4">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </Card>
);

const DashboardPage: React.FC = () => {
    const { currentUser, userRole, employees, leaveRequests, candidates, kudos } = useAuth();

    const subordinateIds = useMemo(() => {
        if (userRole === UserRole.MANAGER && currentUser) {
            return [currentUser.id, ...getSubordinateIds(currentUser.id, employees)];
        }
        return [];
    }, [currentUser, userRole, employees]);

    const { teamEmployees, teamPendingLeaves, teamNewHires } = useMemo(() => {
        if (userRole === UserRole.MANAGER) {
            const team = employees.filter(e => subordinateIds.includes(e.id));
            return {
                teamEmployees: team,
                teamPendingLeaves: leaveRequests.filter(lr => subordinateIds.includes(lr.employeeId) && (lr.status === LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL || lr.status === LeaveStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL)).length,
                teamNewHires: team.filter(e => new Date(e.joiningDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
            };
        }
        return { teamEmployees: [], teamPendingLeaves: 0, teamNewHires: [] };
    }, [userRole, subordinateIds, employees, leaveRequests]);

    const companyPendingLeaves = useMemo(() => leaveRequests.filter(lr => lr.status === LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL || lr.status === LeaveStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL).length, [leaveRequests]);
    const companyNewHires = useMemo(() => employees.filter(e => new Date(e.joiningDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), [employees]);

    const upcomingHolidays = useMemo(() => INDIAN_HOLIDAYS.filter(h => new Date(h.date) >= new Date()).slice(0, 5), []);
    
    const upcomingInterviews = useMemo(() => {
        if (!currentUser) return [];
        return candidates.flatMap(c => 
            c.interviews
             .filter(i => i.interviewerId === currentUser.id && i.status === InterviewStatus.SCHEDULED && new Date(i.scheduledAt) >= new Date())
             .map(i => ({ ...i, candidateName: c.name, candidateRole: c.applyingForRole }))
        ).sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    }, [candidates, currentUser]);

    const upcomingBirthdays = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
        
        const limitDate = new Date();
        limitDate.setHours(0, 0, 0, 0);
        limitDate.setDate(limitDate.getDate() + 30); // Set limit to 30 days from now

        return employees
            .map(employee => {
                if (!employee.dateOfBirth) return null;
                
                // Use ISO format to avoid timezone issues. The mock service normalizes to YYYY-MM-DD.
                const dob = new Date(employee.dateOfBirth + 'T00:00:00');
                if (isNaN(dob.getTime())) return null;

                // Get birthday for this year
                let nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
                nextBirthday.setHours(0,0,0,0);

                // If it has already passed this year, check for next year's birthday
                if (nextBirthday < today) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }

                // Check if the next birthday falls within our 30-day window
                if (nextBirthday >= today && nextBirthday <= limitDate) {
                    return { employee, birthdayDate: nextBirthday };
                }

                return null;
            })
            .filter((item): item is { employee: Employee; birthdayDate: Date } => item !== null)
            .sort((a, b) => a.birthdayDate.getTime() - b.birthdayDate.getTime());
    }, [employees]);

    const employeeLeaveBalances = currentUser?.leaveBalance || {
      casual: 0,
      sick: 0,
      earned: 0,
    };
    
    if (!currentUser) return <div>Loading...</div>;

  return (
    <PageWrapper title={`Welcome, ${currentUser.name.split(' ')[0]}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {userRole === UserRole.ADMIN && (
          <>
            <StatCard icon={<Users size={24} className="text-blue-800" />} title="Total Employees" value={employees.length} color="bg-blue-100" />
            <StatCard icon={<Briefcase size={24} className="text-green-800" />} title="Departments" value={new Set(employees.map(e => e.department)).size} color="bg-green-100" />
            <StatCard icon={<CalendarCheck size={24} className="text-yellow-800" />} title="Pending Leaves" value={companyPendingLeaves} color="bg-yellow-100" />
            <StatCard icon={<UserPlus size={24} className="text-indigo-800" />} title="New Hires (30d)" value={companyNewHires.length} color="bg-indigo-100" />
          </>
        )}
        {userRole === UserRole.MANAGER && (
           <>
            <StatCard icon={<Users size={24} className="text-blue-800" />} title="My Team Size" value={teamEmployees.length} color="bg-blue-100" />
            <StatCard icon={<CalendarCheck size={24} className="text-yellow-800" />} title="Team Pending Leaves" value={teamPendingLeaves} color="bg-yellow-100" />
            <StatCard icon={<UserPlus size={24} className="text-indigo-800" />} title="Team New Hires (30d)" value={teamNewHires.length} color="bg-indigo-100" />
          </>
        )}
         {userRole === UserRole.EMPLOYEE && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:col-span-3">
            <StatCard icon={<CalendarOff size={24} className="text-blue-800" />} title="Casual Leave" value={`${employeeLeaveBalances.casual} days`} color="bg-blue-100" />
            <StatCard icon={<CalendarOff size={24} className="text-green-800" />} title="Sick Leave" value={`${employeeLeaveBalances.sick} days`} color="bg-green-100" />
            <StatCard icon={<CalendarOff size={24} className="text-yellow-800" />} title="Earned Leave" value={`${employeeLeaveBalances.earned} days`} color="bg-yellow-100" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card title="Upcoming Holidays">
                <div className="space-y-3">
                {upcomingHolidays.map(holiday => (
                    <div key={holiday.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <p className="font-semibold text-slate-700">{holiday.name}</p>
                        <p className="text-sm text-blue-600 font-medium">{new Date(holiday.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                ))}
                </div>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <RecentAnnouncementsCard />
            {upcomingInterviews.length > 0 && (
                 <Card title="My Upcoming Interviews" className="bg-purple-50 border border-purple-200">
                    <div className="space-y-4">
                        {upcomingInterviews.slice(0,3).map(interview => (
                            <div key={interview.id} className="p-3 rounded-lg bg-white border border-purple-100">
                                <p className="font-semibold text-purple-800">{interview.candidateName}</p>
                                <p className="text-sm text-slate-600">for {interview.candidateRole}</p>
                                <p className="text-xs text-slate-500 mt-1">{new Date(interview.scheduledAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</p>
                            </div>
                        ))}
                         <Link to="/recruitment/my-interviews" className="text-sm font-medium text-purple-700 hover:underline flex items-center gap-1">
                            Go to My Interviews <ArrowRight size={14} />
                        </Link>
                    </div>
                 </Card>
            )}

             <Card title="Upcoming Birthdays" actions={<PartyPopper size={20} className="text-pink-500" />}>
                {upcomingBirthdays.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingBirthdays.map(({ employee, birthdayDate }) => (
                            <div key={employee.id} className="flex items-center gap-4">
                                <Avatar name={employee.name} size="md" />
                                <div>
                                    <p className="font-semibold text-slate-800">{employee.name}</p>
                                    <p className="text-sm text-slate-500">{employee.role}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="font-bold text-sm text-pink-600">
                                        {birthdayDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-4 text-sm text-slate-500">No birthdays in the next 30 days.</p>
                )}
            </Card>

            {(userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && (
                <Card title={userRole === UserRole.ADMIN ? "New Hires" : "New Hires in Team"}>
                <div className="space-y-4">
                    {(userRole === UserRole.ADMIN ? companyNewHires : teamNewHires).slice(0, 5).map(employee => (
                    <div key={employee.id} className="flex items-center gap-4">
                        <Avatar name={employee.name} size="md" />
                        <div>
                        <p className="font-semibold text-slate-800">{employee.name}</p>
                        <p className="text-sm text-slate-500">{employee.role}</p>
                        </div>
                    </div>
                    ))}
                    {(userRole === UserRole.ADMIN ? companyNewHires.length === 0 : teamNewHires.length === 0) && (
                        <p className="text-slate-500">No new hires in the last 30 days.</p>
                    )}
                </div>
                </Card>
            )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;