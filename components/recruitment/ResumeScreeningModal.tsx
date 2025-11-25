
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Candidate } from '../../types';
import { screenResume } from '../../services/geminiService';
import { Bot, Loader, Percent, FileText, CheckCircle, XCircle } from 'lucide-react';

interface ResumeScreeningModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate;
}

interface ScreeningResult {
    matchScore: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    error?: string;
}

const ResumeScreeningModal: React.FC<ResumeScreeningModalProps> = ({ isOpen, onClose, candidate }) => {
    const [resumeText, setResumeText] = useState('');
    const [result, setResult] = useState<ScreeningResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!resumeText.trim()) return;
        setIsLoading(true);
        setResult(null);
        const analysis = await screenResume(resumeText, candidate.applyingForRole);
        setResult(analysis);
        setIsLoading(false);
    };

    const handleClose = () => {
        setResult(null);
        setResumeText('');
        onClose();
    };
    
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`AI Resume Screening for ${candidate.name}`} size="lg">
            <div className="space-y-4">
                <p className="text-sm text-slate-600">
                    Paste the candidate's resume text below to analyze its suitability for the <span className="font-semibold">{candidate.applyingForRole}</span> role.
                </p>
                
                <textarea
                    rows={8}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Paste resume content here..."
                />

                <Button onClick={handleAnalyze} disabled={isLoading || !resumeText.trim()} className="w-full">
                    {isLoading ? <><Loader size={16} className="animate-spin mr-2"/>Analyzing...</> : <><Bot size={16} className="mr-2"/>Analyze Resume</>}
                </Button>

                {result && (
                    <div className="mt-6 pt-4 border-t animate-fade-in">
                         <style>{`
                            @keyframes fade-in {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                            .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
                        `}</style>
                        {result.error ? (
                            <p className="text-red-600">{result.error}</p>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg text-slate-800">Screening Result</h3>
                                    <div className={`flex items-center gap-2 font-bold text-3xl ${getScoreColor(result.matchScore)}`}>
                                        <Percent size={24}/>
                                        <span>{result.matchScore}</span>
                                    </div>
                                </div>
                                
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold text-slate-700 flex items-center gap-2"><FileText size={16}/> Summary</h4>
                                    <p className="text-sm text-slate-600 mt-2">{result.summary}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 border rounded-lg bg-green-50">
                                        <h4 className="font-semibold text-green-800 flex items-center gap-2"><CheckCircle size={16}/> Strengths</h4>
                                        <ul className="list-disc list-inside mt-2 text-sm text-green-700 space-y-1">
                                            {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-red-50">
                                        <h4 className="font-semibold text-red-800 flex items-center gap-2"><XCircle size={16}/> Weaknesses</h4>
                                        <ul className="list-disc list-inside mt-2 text-sm text-red-700 space-y-1">
                                            {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ResumeScreeningModal;