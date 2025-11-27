import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Target, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AddGoalModal from '../../components/performance/AddGoalModal';
import { GoalStatus } from '../../types';

const MyGoalsPage: React.FC = () => {
  const { goals, addGoal, currentUser, updateGoal } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const myGoals = goals.filter(g => g.employeeId === currentUser?.id);

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.ACHIEVED: return 'bg-green-100 text-green-800';
      case GoalStatus.ON_TRACK: return 'bg-blue-100 text-blue-800';
      case GoalStatus.AT_RISK: return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <PageWrapper 
      title="My Goals" 
      actions={
        <Button onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus size={16} />}>
          Add Goal
        </Button>
      }
    >
      <div className="grid gap-6">
        {myGoals.length === 0 ? (
          <Card>
            <div className="text-center py-10">
              <Target className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-900">No Goals Yet</h3>
              <p className="text-slate-500 mt-1">Set goals to track your performance and growth.</p>
              <Button variant="secondary" className="mt-4" onClick={() => setIsAddModalOpen(true)}>
                Create First Goal
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myGoals.map(goal => (
              <Card key={goal.id} className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status}
                  </span>
                  {goal.status !== GoalStatus.ACHIEVED && (
                      <button 
                        onClick={() => updateGoal(goal.id, { status: GoalStatus.ACHIEVED })}
                        className="text-slate-400 hover:text-green-600 transition-colors"
                        title="Mark as Achieved"
                      >
                          <CheckCircle size={20} />
                      </button>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{goal.title}</h3>
                <p className="text-slate-600 text-sm mb-4 flex-grow">{goal.description}</p>
                
                <div className="border-t pt-4 mt-auto">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Success Metrics</p>
                    <p className="text-sm text-slate-700">{goal.metrics}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddGoalModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={(goalData) => {
            if (currentUser) {
                addGoal({ ...goalData, employeeId: currentUser.id, cycleId: 'current' });
                setIsAddModalOpen(false);
            }
        }} 
      />
    </PageWrapper>
  );
};

export default MyGoalsPage;