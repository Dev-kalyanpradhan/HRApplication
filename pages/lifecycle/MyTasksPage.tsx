
import React, { useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Task, TaskStatus, Workflow, WorkflowType } from '../../types';
import { ClipboardList, UserPlus, LogOut } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';

interface TaskItemProps {
    task: Task;
    workflow: Workflow;
    onUpdateStatus: (workflowId: string, taskId: string, status: TaskStatus) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, workflow, onUpdateStatus }) => {
    const { employees, currentUser } = useAuth();
    const employee = employees.find(e => e.id === workflow.employeeId);
    
    const canComplete = currentUser?.id === task.assigneeId || 
                        (task.assigneeRole === 'HR' && currentUser?.functionAccess.includes('Lifecycle')) ||
                        (task.assigneeRole === 'IT' && currentUser?.functionAccess.includes('Lifecycle')) ||
                        (currentUser?.userRole === 'Admin');

    const handleToggle = () => {
        if(task.status === TaskStatus.PENDING && canComplete) {
            onUpdateStatus(workflow.id, task.id, TaskStatus.COMPLETED);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <input
                    type="checkbox"
                    checked={task.status === TaskStatus.COMPLETED}
                    onChange={handleToggle}
                    disabled={!canComplete}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <div>
                    <p className={`font-semibold text-slate-800 ${task.status === TaskStatus.COMPLETED ? 'line-through text-slate-500' : ''}`}>
                        {task.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>For:</span>
                        <Avatar name={employee?.name || ''} size="sm" />
                        <span className="font-medium">{employee?.name}</span>
                    </div>
                </div>
            </div>
            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
                {task.status}
            </div>
        </div>
    );
};

const MyTasksPage: React.FC = () => {
    const { currentUser, workflows, updateTaskStatus } = useAuth();

    const myTasks = useMemo(() => {
        if (!currentUser) return { onboarding: [], offboarding: [] };
        
        const tasks: { task: Task, workflow: Workflow }[] = [];
        
        workflows.forEach(wf => {
            wf.tasks.forEach(t => {
                if (t.assigneeId === currentUser.id) {
                    tasks.push({ task: t, workflow: wf });
                }
            });
        });
        
        return {
            onboarding: tasks.filter(t => t.workflow.type === WorkflowType.ONBOARDING && t.task.status === TaskStatus.PENDING),
            offboarding: tasks.filter(t => t.workflow.type === WorkflowType.OFFBOARDING && t.task.status === TaskStatus.PENDING),
            completed: tasks.filter(t => t.task.status === TaskStatus.COMPLETED).sort((a,b) => new Date(b.task.completedAt!).getTime() - new Date(a.task.completedAt!).getTime()),
        };
    }, [currentUser, workflows]);

    return (
        <PageWrapper title="My Assigned Tasks">
            <div className="space-y-6">
                <Card title="Pending Onboarding Tasks" actions={<UserPlus size={20} className="text-blue-500"/>}>
                    {myTasks.onboarding.length > 0 ? (
                        <div className="space-y-3">
                            {myTasks.onboarding.map(({task, workflow}) => (
                                <TaskItem key={task.id} task={task} workflow={workflow} onUpdateStatus={updateTaskStatus} />
                            ))}
                        </div>
                    ) : <p className="text-center py-6 text-slate-500">No pending onboarding tasks.</p>}
                </Card>
                
                 <Card title="Pending Offboarding Tasks" actions={<LogOut size={20} className="text-red-500"/>}>
                    {myTasks.offboarding.length > 0 ? (
                        <div className="space-y-3">
                            {myTasks.offboarding.map(({task, workflow}) => (
                                <TaskItem key={task.id} task={task} workflow={workflow} onUpdateStatus={updateTaskStatus} />
                            ))}
                        </div>
                    ) : <p className="text-center py-6 text-slate-500">No pending offboarding tasks.</p>}
                </Card>
                
                 <Card title="Completed Tasks">
                    {myTasks.completed.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {myTasks.completed.slice(0, 10).map(({task, workflow}) => ( // Show last 10
                                <TaskItem key={task.id} task={task} workflow={workflow} onUpdateStatus={updateTaskStatus} />
                            ))}
                        </div>
                    ) : <p className="text-center py-6 text-slate-500">No completed tasks yet.</p>}
                </Card>
            </div>
        </PageWrapper>
    );
};

export default MyTasksPage;
