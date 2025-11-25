
import React, { useMemo, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { WorkflowStatus, WorkflowType } from '../../types';
import Avatar from '../../components/ui/Avatar';
import { ChevronDown, ChevronRight, LogOut, Plus } from 'lucide-react';
import WorkflowTracker from '../../components/lifecycle/WorkflowTracker';
import Button from '../../components/ui/Button';
import InitiateOffboardingModal from '../../components/lifecycle/InitiateOffboardingModal';

const OffboardingPage: React.FC = () => {
    const { employees, workflows, initiateOffboarding } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedWorkflowId, setExpandedWorkflowId] = useState<string | null>(null);

    const offboardingWorkflows = useMemo(() => {
        return workflows
            .filter(wf => wf.type === WorkflowType.OFFBOARDING)
            .map(wf => {
                const employee = employees.find(e => e.id === wf.employeeId);
                const completedTasks = wf.tasks.filter(t => t.status === 'Completed').length;
                const progress = (completedTasks / wf.tasks.length) * 100;
                return {
                    ...wf,
                    employee,
                    progress,
                    completedTasks,
                };
            })
            .filter(wf => wf.employee); // Filter out if employee not found
    }, [workflows, employees]);

    return (
        <PageWrapper
            title="Offboarding Dashboard"
            actions={<Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={16}/>}>Initiate Exit</Button>}
        >
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold w-min"></th>
                                <th className="p-4 font-semibold">Departing Employee</th>
                                <th className="p-4 font-semibold">Last Working Day</th>
                                <th className="p-4 font-semibold">Clearance Progress</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                           {offboardingWorkflows.map(wf => {
                               const isExpanded = expandedWorkflowId === wf.id;
                               return (
                                   <React.Fragment key={wf.id}>
                                       <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedWorkflowId(isExpanded ? null : wf.id)}>
                                           <td className="p-4 text-center">
                                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                           </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={wf.employee!.name} size="md" />
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{wf.employee!.name}</p>
                                                        <p className="text-xs text-slate-500">{wf.employee!.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-700 font-medium">{new Date(wf.startDate).toLocaleDateString('en-IN')}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${wf.progress}%` }}></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-600">{wf.progress.toFixed(0)}%</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">{wf.completedTasks}/{wf.tasks.length} tasks complete</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    wf.status === WorkflowStatus.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {wf.status}
                                                </span>
                                            </td>
                                       </tr>
                                       {isExpanded && (
                                           <tr className="bg-slate-50">
                                               <td colSpan={5} className="p-4">
                                                   <WorkflowTracker workflow={wf} />
                                               </td>
                                           </tr>
                                       )}
                                   </React.Fragment>
                               )
                           })}
                        </tbody>
                    </table>
                     {offboardingWorkflows.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                             <LogOut size={24} className="mx-auto mb-2 text-slate-400"/>
                            <p>No active offboarding processes found.</p>
                        </div>
                    )}
                </div>
            </Card>
            <InitiateOffboardingModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onInitiate={(employeeId, lastWorkingDay, reason) => {
                    initiateOffboarding(employeeId, lastWorkingDay, reason);
                    setIsModalOpen(false);
                }}
            />
        </PageWrapper>
    );
};

export default OffboardingPage;