import React, { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { InterviewResult, InterviewStatus } from '../../types';
import Avatar from '../../components/ui/Avatar';
import InterviewFeedbackModal from '../../components/recruitment/InterviewFeedbackModal';

const MyInterviewsPage: React.FC = () => {
    const { currentUser, candidates, submitInterviewFeedback } = useAuth();
    
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<{ candidateId: string; interviewId: string; } | null>(null);

    const myAssignedInterviews = useMemo(() => {
        if (!currentUser) return [];
        return candidates.flatMap(c => 
            c.interviews
             .filter(i => i.interviewerId === currentUser.id)
             .map(i => ({ candidate: c, interview: i }))
        ).sort((a,b) => new Date(b.interview.scheduledAt).getTime() - new Date(a.interview.scheduledAt).getTime());
    }, [candidates, currentUser]);

    const handleFeedbackSubmit = (feedback: string, result: InterviewResult) => {
        if (selectedInterview) {
            submitInterviewFeedback(selectedInterview.candidateId, selectedInterview.interviewId, feedback, result);
        }
        setIsFeedbackModalOpen(false);
        setSelectedInterview(null);
    };
    
    return (
        <PageWrapper
            title="My Interviews"
        >
            <Card>
                {myAssignedInterviews.length > 0 ? (
                    <div className="space-y-4">
                        {myAssignedInterviews.map(({ candidate, interview }) => (
                            <div key={interview.id} className="p-4 border rounded-lg bg-white hover:border-blue-200">
                                <div className="flex flex-wrap justify-between items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar name={candidate.name} size="lg" />
                                        <div>
                                            <p className="font-bold text-lg text-slate-800">{candidate.name}</p>
                                            <p className="text-sm text-slate-600">Applying for: <span className="font-medium">{candidate.applyingForRole}</span></p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {new Date(interview.scheduledAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {interview.status === InterviewStatus.SCHEDULED && new Date(interview.scheduledAt) > new Date() && (
                                            <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                                                <Button variant="secondary" size="sm">Join Meeting</Button>
                                            </a>
                                        )}
                                        <Button 
                                            onClick={() => {
                                                setSelectedInterview({ candidateId: candidate.id, interviewId: interview.id });
                                                setIsFeedbackModalOpen(true);
                                            }}
                                            disabled={interview.status === InterviewStatus.COMPLETED}
                                            size="sm"
                                        >
                                            {interview.status === InterviewStatus.COMPLETED ? 'Feedback Submitted' : 'Submit Feedback'}
                                        </Button>
                                    </div>
                                </div>
                                {interview.status === InterviewStatus.COMPLETED && interview.feedback && (
                                    <div className="mt-4 p-3 bg-slate-50 rounded-md border text-sm">
                                        <p className="font-semibold text-slate-700">My Feedback:</p>
                                        <p className="text-slate-600 whitespace-pre-wrap mt-1">{interview.feedback}</p>
                                        <p className="mt-2"><span className="font-semibold">Result:</span> <span className="font-medium text-purple-700">{interview.result}</span></p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-10 text-slate-500">You have no interviews assigned.</p>
                )}
            </Card>
             {selectedInterview && (
                <InterviewFeedbackModal 
                    isOpen={isFeedbackModalOpen}
                    onClose={() => setIsFeedbackModalOpen(false)}
                    onSubmit={handleFeedbackSubmit}
                />
            )}
        </PageWrapper>
    );
};

export default MyInterviewsPage;