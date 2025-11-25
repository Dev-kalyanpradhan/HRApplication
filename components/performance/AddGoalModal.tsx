

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Goal, GoalStatus } from '../../types';
import { suggestSmartGoal } from '../../services/geminiService';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Loader } from 'lucide-react';

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (goal: Omit<Goal, 'id' | 'employeeId' | 'cycleId'>) => void;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onAdd }) => {
    const { currentUser } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [metrics, setMetrics] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);

    const handleAiSuggest = async () => {
        if (!title.trim() || !currentUser) return;
        setIsSuggesting(true);
        try {
            const result = await suggestSmartGoal(currentUser.role, title);
            if (result && !result.error) {
                setTitle(result.suggestedTitle);
                setDescription(result.suggestedDescription);
                setMetrics(result.suggestedMetrics);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            title,
            description,
            metrics,
            status: GoalStatus.NOT_STARTED,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Goal">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <Input
                        id="title"
                        label="Goal Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Improve API Response Time"
                        required
                    />
                     <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={handleAiSuggest}
                        disabled={!title.trim() || isSuggesting}
                        className="!absolute right-1 bottom-1"
                    >
                         {isSuggesting ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} className="text-purple-500"/>}
                         <span className="ml-1">{isSuggesting ? "Generating..." : "AI Suggestion"}</span>
                    </Button>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Provide a brief description of what this goal entails."
                        required
                    />
                </div>
                <div>
                    <label htmlFor="metrics" className="block text-sm font-medium text-slate-700 mb-1">
                        Success Metrics
                    </label>
                    <textarea
                        id="metrics"
                        rows={2}
                        value={metrics}
                        onChange={(e) => setMetrics(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="How will success be measured? e.g., Reduce P95 latency to <200ms."
                        required
                    />
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Add Goal</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddGoalModal;