import React from 'react';
import { Workflow, TaskStatus, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, Circle } from 'lucide-react';

interface WorkflowTrackerProps {
    workflow: Workflow;
}

const WorkflowTracker: React.FC<WorkflowTrackerProps> = ({ workflow }) => {
    const { employees, updateTaskStatus, currentUser } = useAuth();

    const handleUpdate = (taskId: string) => {
        updateTaskStatus(workflow.id, taskId, TaskStatus.COMPLETED);
    }
    
    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-slate-700">Task Checklist</h4>
            {workflow.tasks.map(task => {
                const isCompleted = task.status === TaskStatus.COMPLETED;
                let assigneeName: string = task.assigneeRole;
                
                if (task.assigneeId) {
                    assigneeName = employees.find(e => e.id === task.assigneeId)?.name || task.assigneeId;
                } else if (task.assigneeRole === UserRole.MANAGER) {
                     const manager = employees.find(e => e.id === workflow.employeeId)?.reportingManagerId;
                     assigneeName = employees.find(e => e.id === manager)?.name || 'Manager';
                }
                
                const canComplete = !isCompleted && (
                    currentUser?.id === task.assigneeId || 
                    (task.assigneeRole === 'HR' && currentUser?.functionAccess.includes('Lifecycle')) ||
                    (task.assigneeRole === 'IT' && currentUser?.functionAccess.includes('Lifecycle')) ||
                    currentUser?.userRole === 'Admin'
                );

                return (
                    <div key={task.id} className="flex items-start gap-4 p-3 rounded-lg bg-white border">
                        <div className="pt-1">
                           {isCompleted ? (
                                <CheckCircle size={20} className="text-green-500"/>
                           ) : (
                                <Circle size={20} className="text-slate-300"/>
                           )}
                        </div>
                        <div className="flex-1">
                             <p className={`font-medium ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{task.name}</p>
                             <p className="text-xs text-slate-500">Assigned to: <span className="font-semibold">{assigneeName}</span></p>
                        </div>
                        {canComplete && (
                             <button onClick={() => handleUpdate(task.id)} className="text-xs font-semibold text-blue-600 hover:underline">
                                Mark as Done
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default WorkflowTracker;