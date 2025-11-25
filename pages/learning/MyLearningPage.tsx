import React, { useMemo, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { LearningStatus } from '../../types';
import LearningCard from '../../components/learning/LearningCard';

const MyLearningPage: React.FC = () => {
    const { currentUser, learningAssignments } = useAuth();
    const [activeTab, setActiveTab] = useState<'assigned' | 'completed'>('assigned');
    
    const myAssignments = useMemo(() => {
        if (!currentUser) return { assigned: [], completed: [] };
        
        const assigned = learningAssignments.filter(la => la.employeeId === currentUser.id && la.status === LearningStatus.ASSIGNED)
            .sort((a,b) => new Date(a.assignedAt).getTime() - new Date(b.assignedAt).getTime());
            
        const completed = learningAssignments.filter(la => la.employeeId === currentUser.id && la.status === LearningStatus.COMPLETED)
            .sort((a,b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
            
        return { assigned, completed };
    }, [currentUser, learningAssignments]);

    return (
        <PageWrapper title="My Learning">
            <Card>
                 <div className="flex border-b border-slate-200 mb-6">
                    <button onClick={() => setActiveTab('assigned')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'assigned' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                        Assigned ({myAssignments.assigned.length})
                    </button>
                    <button onClick={() => setActiveTab('completed')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'completed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                        Completed ({myAssignments.completed.length})
                    </button>
                </div>

                <div className="space-y-4">
                    {activeTab === 'assigned' && (
                        myAssignments.assigned.length > 0 ? (
                            myAssignments.assigned.map(assignment => <LearningCard key={assignment.id} assignment={assignment} />)
                        ) : (
                            <p className="text-center py-10 text-slate-500">You have no pending learning items. Great job!</p>
                        )
                    )}
                     {activeTab === 'completed' && (
                        myAssignments.completed.length > 0 ? (
                            myAssignments.completed.map(assignment => <LearningCard key={assignment.id} assignment={assignment} />)
                        ) : (
                            <p className="text-center py-10 text-slate-500">You have not completed any learning items yet.</p>
                        )
                    )}
                </div>
            </Card>
        </PageWrapper>
    );
};

export default MyLearningPage;
