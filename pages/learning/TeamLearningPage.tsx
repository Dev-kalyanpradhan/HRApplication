import React, { useMemo, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, LearningStatus, LearningAssignment } from '../../types';
import { getSubordinateIds } from '../../utils/hierarchyUtils';
import Avatar from '../../components/ui/Avatar';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import AssignLearningModal from '../../components/learning/AssignLearningModal';

const TeamLearningPage: React.FC = () => {
    const { currentUser, userRole, employees, learningAssignments } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);

    const teamMembers = useMemo(() => {
        if (!currentUser) return [];
        if (userRole === UserRole.ADMIN) return employees.filter(e => e.userRole !== UserRole.ADMIN);
        const subordinateIds = getSubordinateIds(currentUser.id, employees);
        return employees.filter(e => subordinateIds.includes(e.id));
    }, [currentUser, userRole, employees]);

    const teamLearningData = useMemo(() => {
        return teamMembers.map(member => {
            const assignments = learningAssignments.filter(la => la.employeeId === member.id);
            const completedCount = assignments.filter(la => la.status === LearningStatus.COMPLETED).length;
            const assignedCount = assignments.length - completedCount;
            return {
                employee: member,
                assignments,
                completedCount,
                assignedCount,
            };
        });
    }, [teamMembers, learningAssignments]);

    return (
        <PageWrapper
            title="Team Learning Progress"
            actions={<Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={16} />}>Assign Learning</Button>}
        >
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold w-min"></th>
                                <th className="p-4 font-semibold">Employee</th>
                                <th className="p-4 font-semibold">Assigned</th>
                                <th className="p-4 font-semibold">Completed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamLearningData.map(data => {
                                const isExpanded = expandedEmployeeId === data.employee.id;
                                return (
                                <React.Fragment key={data.employee.id}>
                                    <tr className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedEmployeeId(isExpanded ? null : data.employee.id)}>
                                        <td className="p-4">
                                            {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={data.employee.name} size="md" />
                                                <div>
                                                    <p className="font-semibold text-slate-800">{data.employee.name}</p>
                                                    <p className="text-xs text-slate-500">{data.employee.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-blue-700">{data.assignedCount}</td>
                                        <td className="p-4 font-medium text-green-700">{data.completedCount}</td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-slate-50">
                                            <td colSpan={4} className="p-4">
                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-sm mb-2">Assigned Courses</h4>
                                                    {data.assignments.length > 0 ? data.assignments.map(a => (
                                                         <div key={a.id} className="p-2 border bg-white rounded-md flex justify-between items-center">
                                                            <span>{a.title}</span>
                                                             <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${a.status === LearningStatus.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{a.status}</span>
                                                         </div>
                                                    )) : <p className="text-xs text-slate-500">No courses assigned.</p>}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )})}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AssignLearningModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                teamMembers={teamMembers}
            />
        </PageWrapper>
    );
};

export default TeamLearningPage;
