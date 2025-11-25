
import React from 'react';
import { Goal, GoalStatus } from '../../types';
import { Target, CheckCircle, AlertTriangle, PlayCircle } from 'lucide-react';

interface GoalCardProps {
    goal: Goal;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
    
    const getStatusInfo = (status: GoalStatus): { icon: React.ReactNode, color: string, text: string } => {
        switch(status) {
            case GoalStatus.ACHIEVED:
                return { icon: <CheckCircle size={16}/>, color: 'text-green-600 bg-green-100', text: 'Achieved' };
            case GoalStatus.AT_RISK:
                return { icon: <AlertTriangle size={16}/>, color: 'text-red-600 bg-red-100', text: 'At Risk' };
            case GoalStatus.ON_TRACK:
                return { icon: <PlayCircle size={16}/>, color: 'text-blue-600 bg-blue-100', text: 'On Track' };
            default:
                return { icon: <Target size={16}/>, color: 'text-slate-600 bg-slate-100', text: 'Not Started' };
        }
    }
    
    const statusInfo = getStatusInfo(goal.status);

    return (
        <div className="border border-slate-200 rounded-lg p-4 bg-white hover:border-blue-300 transition-colors">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{goal.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{goal.description}</p>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.text}</span>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-1">Success Metrics:</p>
                <p className="text-sm text-slate-700 italic">"{goal.metrics}"</p>
            </div>
        </div>
    );
};

export default GoalCard;
