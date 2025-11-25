

import React, { useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, ReviewStatus, PerformanceCycleStatus } from '../../types';
import { getSubordinateIds } from '../../utils/hierarchyUtils';
import Avatar from '../../components/ui/Avatar';
import { Link } from 'react-router-dom';
import { Edit } from 'lucide-react';
import Button from '../../components/ui/Button';

const TeamReviewsPage: React.FC = () => {
    const { currentUser, userRole, employees, reviews, performanceCycles } = useAuth();

    const activeCycle = useMemo(() => {
        return performanceCycles.find(c => c.status === PerformanceCycleStatus.ACTIVE);
    }, [performanceCycles]);

    const teamMembers = useMemo(() => {
        if (!currentUser) return [];
        if (userRole === UserRole.ADMIN) return employees.filter(e => e.id !== currentUser.id);
        const subordinateIds = getSubordinateIds(currentUser.id, employees);
        return employees.filter(e => subordinateIds.includes(e.id));
    }, [currentUser, userRole, employees]);

    const teamReviews = useMemo(() => {
        if (!activeCycle) return [];
        return teamMembers.map(member => {
            const review = reviews.find(r => r.employeeId === member.id && r.cycleId === activeCycle.id);
            return {
                employee: member,
                status: review?.status || ReviewStatus.NOT_STARTED,
            };
        });
    }, [teamMembers, reviews, activeCycle]);

    const getStatusChip = (status: ReviewStatus): { text: string, color: string } => {
        switch (status) {
            case ReviewStatus.NOT_STARTED:
                return { text: 'Not Started', color: 'bg-slate-100 text-slate-800' };
            case ReviewStatus.SELF_ASSESSMENT_COMPLETE:
                return { text: 'Self-Assessment Done', color: 'bg-yellow-100 text-yellow-800' };
            case ReviewStatus.MANAGER_REVIEW_COMPLETE:
                return { text: 'Manager Review Done', color: 'bg-blue-100 text-blue-800' };
            case ReviewStatus.CLOSED:
                return { text: 'Completed', color: 'bg-green-100 text-green-800' };
            default:
                return { text: 'Unknown', color: 'bg-slate-100 text-slate-800' };
        }
    };
    
    if (!activeCycle) {
        return (
            <PageWrapper title="Team Reviews">
                <Card><p className="text-center py-10">No active performance cycle found.</p></Card>
            </PageWrapper>
        );
    }
    
    return (
        <PageWrapper title={`Team Reviews for ${activeCycle.name}`}>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold">Employee</th>
                                <th className="p-4 font-semibold">Department</th>
                                <th className="p-4 font-semibold">Review Status</th>
                                <th className="p-4 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamReviews.map(({ employee, status }) => {
                                const statusInfo = getStatusChip(status);
                                return (
                                <tr key={employee.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={employee.name} size="md" />
                                            <div>
                                                <p className="font-semibold text-slate-800">{employee.name}</p>
                                                <p className="text-xs text-slate-500">{employee.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-700">{employee.department}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                                            {statusInfo.text}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <Link to="/performance/my-goals" state={{ managedEmployeeId: employee.id }}>
                                            <Button variant="secondary" size="sm" leftIcon={<Edit size={14}/>}>
                                                {status === ReviewStatus.SELF_ASSESSMENT_COMPLETE ? "Complete Review" : "View Progress"}
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default TeamReviewsPage;