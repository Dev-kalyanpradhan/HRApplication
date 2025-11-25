
import React, { useMemo, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { WorkflowStatus, WorkflowType } from '../../types';
import Avatar from '../../components/ui/Avatar';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import WorkflowTracker from '../../components/lifecycle/WorkflowTracker';

const OnboardingPage: React.FC = () => {
    const { employees, workflows } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedWorkflowId, setExpandedWorkflowId] = useState<string | null>(null);

    const onboardingWorkflows = useMemo(() => {
        return workflows
            .filter(wf => wf.type === WorkflowType.ONBOARDING)
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
            .filter(wf => wf.employee) // Filter out if employee not found
            .filter(wf => wf.employee?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [workflows, employees, searchTerm]);

    return (
        <PageWrapper title="Onboarding Dashboard">
            <Card>
                 <div className="flex items-center justify-between mb-4 flex-wrap gap-y-4">
                    <h3 className="text-lg font-semibold">Active Onboarding Employees ({onboardingWorkflows.length})</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-slate-300 rounded-md py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold w-min"></th>
                                <th className="p-4 font-semibold">New Hire</th>
                                <th className="p-4 font-semibold">Joining Date</th>
                                <th className="p-4 font-semibold">Progress</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                           {onboardingWorkflows.map(wf => {
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
                                            <td className="p-4 text-slate-700">{new Date(wf.startDate).toLocaleDateString('en-IN')}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${wf.progress}%` }}></div>
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
                     {onboardingWorkflows.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <p>No active onboarding workflows found.</p>
                        </div>
                    )}
                </div>
            </Card>
        </PageWrapper>
    );
};

export default OnboardingPage;
