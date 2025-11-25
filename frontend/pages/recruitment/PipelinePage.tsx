import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, ChevronDown, ChevronRight, Link as LinkIcon, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Candidate, InterviewResult, InterviewStatus } from '../../types';
import Avatar from '../../components/ui/Avatar';

const PipelinePage: React.FC = () => {
    const { candidates } = useAuth();
    const navigate = useNavigate();
    
    const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

    const getOverallStatus = (candidate: Candidate): { text: string; color: string } => {
        const latestInterview = [...candidate.interviews].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0];
        if (!latestInterview) return { text: 'New', color: 'bg-slate-100 text-slate-800' };

        if (latestInterview.status === InterviewStatus.COMPLETED) {
            switch(latestInterview.result) {
                case InterviewResult.PROCEED: return { text: 'Proceed', color: 'bg-green-100 text-green-800' };
                case InterviewResult.HOLD: return { text: 'On Hold', color: 'bg-yellow-100 text-yellow-800' };
                case InterviewResult.REJECT: return { text: 'Rejected', color: 'bg-red-100 text-red-800' };
                default: return { text: 'Feedback Pending', color: 'bg-purple-100 text-purple-800' };
            }
        }
        return { text: `Round ${candidate.interviews.length} Scheduled`, color: 'bg-blue-100 text-blue-800' };
    };

    return (
        <PageWrapper
            title="Candidate Pipeline"
            actions={
                <Button onClick={() => navigate('/recruitment/add')} leftIcon={<Plus size={18} />}>
                    Add Candidate
                </Button>
            }
        >
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold w-min"></th>
                                <th className="p-4 font-semibold">Candidate</th>
                                <th className="p-4 font-semibold">Applied For</th>
                                <th className="p-4 font-semibold">Rounds</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {candidates.map(candidate => {
                                const status = getOverallStatus(candidate);
                                const isExpanded = expandedCandidate === candidate.id;
                                return (
                                    <React.Fragment key={candidate.id}>
                                        <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedCandidate(isExpanded ? null : candidate.id)}>
                                            <td className="p-4 text-center">
                                                {isExpanded ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-400" />}
                                            </td>
                                            <td className="p-4 font-medium text-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={candidate.name} />
                                                    <div>
                                                        <p className="font-semibold">{candidate.name}</p>
                                                        <p className="text-xs text-slate-500">{candidate.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-700">{candidate.applyingForRole}</td>
                                            <td className="p-4 text-slate-700 font-medium text-center">{candidate.interviews.length}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>{status.text}</span>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-slate-50">
                                                <td colSpan={5} className="p-4">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="font-semibold text-slate-700">Interview History</h4>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {candidate.interviews.map((interview, index) => (
                                                            <div key={interview.id} className="p-3 border rounded-md bg-white">
                                                                <p className="font-semibold text-blue-700">Round {index + 1}: Interview</p>
                                                                <div className="text-xs text-slate-500 grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                                                    <div className="flex items-center gap-1.5"><CalendarIcon size={14} /><span>{new Date(interview.scheduledAt).toLocaleDateString('en-IN')}</span></div>
                                                                    <div className="flex items-center gap-1.5"><Clock size={14} /><span>{new Date(interview.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
                                                                    <div className="flex items-center gap-1.5"><Avatar name={interview.interviewerName} size="sm" /><span className="font-medium text-slate-600">{interview.interviewerName}</span></div>
                                                                    <div className="flex items-center gap-1.5"><LinkIcon size={14} /><a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Meeting Link</a></div>
                                                                </div>
                                                                {interview.status === InterviewStatus.COMPLETED && interview.feedback && (
                                                                    <div className="mt-3 pt-3 border-t">
                                                                        <p className="font-semibold text-xs text-slate-600">Feedback from {interview.interviewerName}:</p>
                                                                        <p className="text-sm text-slate-700 whitespace-pre-wrap mt-1">{interview.feedback}</p>
                                                                        <p className="text-sm mt-1"><span className="font-semibold">Result: </span><span className="font-bold text-purple-700">{interview.result}</span></p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default PipelinePage;