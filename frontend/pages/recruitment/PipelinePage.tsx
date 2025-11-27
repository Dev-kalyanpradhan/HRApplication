import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { InterviewStatus } from '../../types';

const PipelinePage: React.FC = () => {
  const { candidates } = useAuth();

  const stages = [
      { id: 'applied', label: 'Applied' },
      { id: 'screening', label: 'Screening' },
      { id: 'interview', label: 'Interview' },
      { id: 'offer', label: 'Offer' },
      { id: 'hired', label: 'Hired' }
  ];

  const getStage = (candidate: any) => {
      const lastInterview = candidate.interviews[candidate.interviews.length - 1];
      if (!lastInterview) return 'applied';
      if (lastInterview.status === InterviewStatus.COMPLETED) return 'offer';
      return 'interview';
  };

  return (
    <PageWrapper title="Recruitment Pipeline">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => {
             const stageCandidates = candidates.filter(c => getStage(c) === stage.id);
             return (
                <div key={stage.id} className="min-w-[280px] w-full max-w-xs flex flex-col">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="font-semibold text-slate-700">{stage.label}</h3>
                        <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{stageCandidates.length}</span>
                    </div>
                    <div className="bg-slate-100 p-3 rounded-lg flex-1 min-h-[500px] space-y-3">
                        {stageCandidates.map(candidate => (
                            <div key={candidate.id} className="bg-white p-3 rounded shadow-sm border border-slate-200 cursor-grab hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <Avatar name={candidate.name} size="sm" />
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">{candidate.name}</p>
                                        <p className="text-xs text-slate-500">{candidate.applyingForRole}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 flex justify-between mt-2 pt-2 border-t border-slate-50">
                                    <span>{new Date(candidate.submittedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                         {stageCandidates.length === 0 && (
                            <div className="text-center py-10 text-slate-400 text-sm italic">
                                No candidates
                            </div>
                         )}
                    </div>
                </div>
             );
        })}
      </div>
    </PageWrapper>
  );
};

export default PipelinePage;