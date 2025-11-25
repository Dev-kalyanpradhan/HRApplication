
import React, { useState } from 'react';
import { PerformanceReview } from '../../types';
import Button from '../ui/Button';

interface ReviewFormProps {
    review: PerformanceReview | null;
    isManagerView: boolean;
    isSubmitted: boolean;
    onSubmit: (assessment: string) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ review, isManagerView, isSubmitted, onSubmit }) => {
    const [assessment, setAssessment] = useState('');

    const title = isManagerView ? "Manager's Evaluation" : "My Self-Assessment";
    const placeholder = isManagerView 
        ? "Provide your evaluation of the employee's performance for this cycle..."
        : "Summarize your achievements, challenges, and overall performance for this cycle...";

    const existingAssessment = isManagerView ? review?.managerAssessment : review?.selfAssessment;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(assessment);
    };

    if (isSubmitted && existingAssessment) {
        return (
             <div>
                <h4 className="font-semibold text-lg text-slate-800">{title}</h4>
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{existingAssessment}</p>
                </div>
                <p className="text-center mt-4 text-sm text-green-700 font-medium">Your assessment has been submitted.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h4 className="font-semibold text-lg text-slate-800">{title}</h4>
                <p className="text-sm text-slate-500 mt-1">
                    {isManagerView 
                        ? "Your comments will be shared with the employee upon completion." 
                        : "Your assessment will be shared with your manager."
                    }
                </p>
            </div>
             <div>
                <label htmlFor="assessment" className="block text-sm font-medium text-slate-700 mb-1">
                    Overall Summary
                </label>
                <textarea
                    id="assessment"
                    rows={8}
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={placeholder}
                    required
                />
            </div>
             <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="submit">Submit Assessment</Button>
            </div>
        </form>
    );
};

export default ReviewForm;
