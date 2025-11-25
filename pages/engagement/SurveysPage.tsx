
import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { analyzeSurveyFeedback } from '../../services/geminiService';
import { Loader, Lightbulb, BarChart, ThumbsUp } from 'lucide-react';

interface SurveyResult {
    themes: string[];
    sentiment: string;
    suggestions: string[];
    error?: string;
}

const SurveysPage: React.FC = () => {
    const [feedbackText, setFeedbackText] = useState('');
    const [result, setResult] = useState<SurveyResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!feedbackText.trim()) return;
        setIsLoading(true);
        setResult(null);
        const analysis = await analyzeSurveyFeedback(feedbackText);
        setResult(analysis);
        setIsLoading(false);
    };

    return (
        <PageWrapper title="AI Survey Analysis">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <Card>
                    <h3 className="text-lg font-semibold text-slate-800">Paste Survey Feedback</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-4">
                        Paste anonymous, open-ended feedback from your surveys (e.g., Google Forms, etc.). The AI will analyze the text to identify themes, sentiment, and suggestions.
                    </p>
                    <textarea
                        rows={15}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g.,&#10;- The new project management tool is great!&#10;- I wish we had more opportunities for cross-team collaboration.&#10;- Communication from leadership has improved this quarter."
                    />
                    <Button onClick={handleAnalyze} disabled={isLoading || !feedbackText.trim()} className="w-full mt-4">
                        {isLoading ? <><Loader size={16} className="animate-spin mr-2"/>Analyzing Feedback...</> : 'Analyze with AI'}
                    </Button>
                </Card>

                <Card>
                     <h3 className="text-lg font-semibold text-slate-800">Analysis & Insights</h3>
                     {isLoading ? (
                         <div className="flex items-center justify-center p-20">
                            <Loader size={32} className="animate-spin text-blue-500" />
                         </div>
                     ) : result ? (
                        <div className="space-y-6 mt-4 animate-fade-in">
                             <style>{`
                                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                                .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
                            `}</style>
                            {result.error ? (
                                 <p className="text-red-600 text-center p-10">{result.error}</p>
                            ) : (
                                <>
                                <div className="p-4 border rounded-lg bg-purple-50">
                                    <h4 className="font-semibold text-purple-800 flex items-center gap-2"><ThumbsUp size={16}/> Overall Sentiment</h4>
                                    <p className="text-2xl font-bold text-purple-700 mt-1">{result.sentiment}</p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold text-slate-700 flex items-center gap-2"><BarChart size={16}/> Key Themes</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {result.themes.map((theme, i) => (
                                            <span key={i} className="px-2.5 py-1 text-sm bg-slate-100 text-slate-800 rounded-full">{theme}</span>
                                        ))}
                                    </div>
                                </div>
                                 <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold text-slate-700 flex items-center gap-2"><Lightbulb size={16}/> Actionable Suggestions</h4>
                                    <ul className="list-disc list-inside mt-2 text-sm text-slate-600 space-y-2">
                                        {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                </>
                            )}
                        </div>
                     ) : (
                         <div className="text-center p-20 text-slate-500">
                            <p>Your analysis results will appear here.</p>
                        </div>
                     )}
                </Card>
            </div>
        </PageWrapper>
    );
};

export default SurveysPage;