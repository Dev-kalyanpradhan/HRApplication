
import React, { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { PerformanceCycle, Employee, Goal, PerformanceReview, UserRole, ReviewStatus } from '../../types';
import Select from '../../components/ui/Select';
import { Plus, Star, MessageSquare } from 'lucide-react';
import AddGoalModal from '../../components/performance/AddGoalModal';
import GoalCard from '../../components/performance/GoalCard';
import ReviewForm from '../../components/performance/ReviewForm';

const MyGoalsPage: React.FC = () => {
    const { currentUser, userRole, employees, performanceCycles, goals, reviews, addGoal, updateGoal, submitReview } = useAuth();
    const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('goals');

    // Determine the active cycle
    const activeCycle = useMemo(() => {
        return performanceCycles.find(c => c.status === 'Active') || performanceCycles[0];
    }, [performanceCycles]);

    const [selectedCycleId, setSelectedCycleId] = useState<string>(activeCycle?.id || '');

    // Manager-specific state
    const [isManagerView, setIsManagerView] = useState(false);
    
    const myDirectReports = useMemo(() => {
        if (!currentUser || userRole !== UserRole.MANAGER) return [];
        return employees.filter(e => e.reportingManagerId === currentUser.id);
    }, [currentUser, userRole, employees]);

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    
    // Determine whose data to show
    const displayEmployee = useMemo(() => {
        if (isManagerView && selectedEmployeeId) {
            return employees.find(e => e.id === selectedEmployeeId);
        }
        return currentUser;
    }, [isManagerView, selectedEmployeeId, currentUser, employees]);
    
    const displayGoals = useMemo(() => {
        if (!displayEmployee) return [];
        return goals.filter(g => g.employeeId === displayEmployee.id && g.cycleId === selectedCycleId);
    }, [displayEmployee, goals, selectedCycleId]);

    const displayReview = useMemo(() => {
        if (!displayEmployee) return null;
        return reviews.find(r => r.employeeId === displayEmployee.id && r.cycleId === selectedCycleId) || null;
    }, [displayEmployee, reviews, selectedCycleId]);

    const handleAddGoal = (goalData: Omit<Goal, 'id' | 'employeeId' | 'cycleId'>) => {
        if (!displayEmployee) return;
        addGoal({ ...goalData, employeeId: displayEmployee.id, cycleId: selectedCycleId });
        setIsAddGoalModalOpen(false);
    };

    const handleReviewSubmit = (assessment: string) => {
        if (!displayEmployee || !currentUser) return;
        const reviewData = {
            employeeId: displayEmployee.id,
            cycleId: selectedCycleId,
            ...(isManagerView ? { managerAssessment: assessment } : { selfAssessment: assessment }),
        };
        // @ts-ignore
        submitReview(reviewData, isManagerView);
    };

    const canEditGoals = !isManagerView && displayReview?.status !== ReviewStatus.SELF_ASSESSMENT_COMPLETE;

    return (
        <PageWrapper
            title={isManagerView ? `Review for ${displayEmployee?.name}` : "My Goals & Reviews"}
            actions={
                <div className="flex items-center gap-4">
                    {userRole === UserRole.MANAGER && (
                         <div className="flex items-center gap-2">
                             <span className="text-sm font-medium">My View</span>
                             <div 
                                onClick={() => {
                                    setIsManagerView(prev => !prev)
                                    if(myDirectReports.length > 0) setSelectedEmployeeId(myDirectReports[0].id)
                                }} 
                                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isManagerView ? 'bg-blue-600' : 'bg-slate-300'}`}
                             >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isManagerView ? 'translate-x-6' : ''}`}></div>
                            </div>
                            <span className="text-sm font-medium">Manager View</span>
                        </div>
                    )}
                    <Select id="cycle" label="" value={selectedCycleId} onChange={(e) => setSelectedCycleId(e.target.value)}>
                        {performanceCycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                </div>
            }
        >
            <div className="space-y-6">
                {isManagerView && (
                    <Card>
                        <Select id="employee" label="Select Team Member to Review" value={selectedEmployeeId || ''} onChange={e => setSelectedEmployeeId(e.target.value)}>
                            <option value="" disabled>--Select Employee--</option>
                            {myDirectReports.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </Select>
                    </Card>
                )}
                
                {displayEmployee ? (
                    <>
                        <div className="flex border-b border-slate-200">
                            <button onClick={() => setActiveTab('goals')} className={`flex items-center gap-2 px-4 py-3 font-medium text-sm ${activeTab === 'goals' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><Star size={16}/> Goals</button>
                            <button onClick={() => setActiveTab('review')} className={`flex items-center gap-2 px-4 py-3 font-medium text-sm ${activeTab === 'review' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><MessageSquare size={16}/> Review</button>
                        </div>
                        
                        {activeTab === 'goals' && (
                            <Card
                                title={`${displayGoals.length} Goals for ${selectedCycleId ? performanceCycles.find(c => c.id === selectedCycleId)?.name : ''}`}
                                actions={canEditGoals ? <Button onClick={() => setIsAddGoalModalOpen(true)} leftIcon={<Plus size={16}/>}>Add Goal</Button> : null}
                            >
                                {displayGoals.length > 0 ? (
                                    <div className="space-y-4">
                                        {displayGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
                                    </div>
                                ) : (
                                    <p className="text-center py-10 text-slate-500">No goals set for this period yet.</p>
                                )}
                            </Card>
                        )}

                        {activeTab === 'review' && (
                            <Card title="Performance Review">
                                 <ReviewForm 
                                    review={displayReview}
                                    isManagerView={isManagerView}
                                    onSubmit={handleReviewSubmit}
                                    isSubmitted={ isManagerView ? displayReview?.status === ReviewStatus.MANAGER_REVIEW_COMPLETE : displayReview?.status === ReviewStatus.SELF_ASSESSMENT_COMPLETE}
                                 />
                            </Card>
                        )}
                    </>
                ) : (
                    <Card>
                        <p className="text-center py-10 text-slate-500">
                            {isManagerView ? "Please select an employee to review." : "Loading..."}
                        </p>
                    </Card>
                )}
            </div>

            {isAddGoalModalOpen && (
                <AddGoalModal
                    isOpen={isAddGoalModalOpen}
                    onClose={() => setIsAddGoalModalOpen(false)}
                    onAdd={handleAddGoal}
                />
            )}
        </PageWrapper>
    );
};

export default MyGoalsPage;
