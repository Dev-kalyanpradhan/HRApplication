import React from 'react';
import { LearningAssignment, LearningStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Calendar, CheckCircle, Link as LinkIcon } from 'lucide-react';

interface LearningCardProps {
    assignment: LearningAssignment;
}

const LearningCard: React.FC<LearningCardProps> = ({ assignment }) => {
    const { employees, updateLearningStatus } = useAuth();
    const assigner = employees.find(e => e.id === assignment.assignedById);
    const isCompleted = assignment.status === LearningStatus.COMPLETED;

    const handleMarkComplete = () => {
        if (!isCompleted) {
            updateLearningStatus(assignment.id, LearningStatus.COMPLETED);
        }
    };

    return (
        <div className={`p-5 border rounded-lg bg-white transition-all ${isCompleted ? 'bg-slate-50' : 'hover:border-blue-300'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                    <h3 className={`font-bold text-lg text-slate-800 ${isCompleted ? 'line-through text-slate-500' : ''}`}>{assignment.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{assignment.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-3">
                        <span>Assigned by: <span className="font-medium">{assigner?.name || 'Manager'}</span></span>
                        {assignment.dueDate && (
                            <span className="flex items-center gap-1">
                                <Calendar size={12}/> Due by: <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString('en-IN')}</span>
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                     <a href={assignment.link} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                        <Button variant="secondary" size="sm" className="w-full" leftIcon={<LinkIcon size={14}/>}>
                            View Material
                        </Button>
                    </a>
                    <Button
                        size="sm"
                        onClick={handleMarkComplete}
                        disabled={isCompleted}
                        className="w-full sm:w-auto"
                        leftIcon={isCompleted ? <CheckCircle size={14}/> : null}
                    >
                        {isCompleted ? 'Completed' : 'Mark as Complete'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LearningCard;
