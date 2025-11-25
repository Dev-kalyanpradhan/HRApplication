
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { Kudos, LeaveRequest } from '../../types';
import { getEngagementInsights } from '../../services/geminiService';
import { Bot, Loader } from 'lucide-react';

interface AiEngagementCardProps {
    kudosData: Kudos[];
    leaveData: LeaveRequest[];
}

const AiEngagementCard: React.FC<AiEngagementCardProps> = ({ kudosData, leaveData }) => {
    const [insights, setInsights] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            setIsLoading(true);
            // Prepare a simplified string of data to send to the AI
            const kudosSummary = `Total kudos given in last 30 days: ${kudosData.filter(k => new Date(k.timestamp) > new Date(Date.now() - 30 * 24*60*60*1000)).length}`;
            const leaveSummary = `Total sick leaves in last 30 days: ${leaveData.filter(l => l.leaveType === 'Sick Leave' && new Date(l.startDate) > new Date(Date.now() - 30 * 24*60*60*1000)).length}`;
            
            const result = await getEngagementInsights(kudosSummary, leaveSummary);
            setInsights(result);
            setIsLoading(false);
        };

        fetchInsights();
    }, [kudosData, leaveData]);

    return (
        <Card title="AI Engagement Insights" actions={<Bot size={20} className="text-purple-500" />}>
            {isLoading ? (
                <div className="flex items-center justify-center p-6">
                    <Loader size={24} className="animate-spin text-purple-500" />
                    <p className="ml-3 text-slate-500">Analyzing engagement data...</p>
                </div>
            ) : (
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{insights}</p>
            )}
        </Card>
    );
};

export default AiEngagementCard;