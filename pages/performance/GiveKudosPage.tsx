

import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { Award, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GiveKudosPage: React.FC = () => {
    const { currentUser, employees, giveKudos } = useAuth();
    const navigate = useNavigate();
    
    const [receiverId, setReceiverId] = useState('');
    const [message, setMessage] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const otherEmployees = employees.filter(e => e.id !== currentUser?.id);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!receiverId || !message) {
            alert("Please select an employee and write a message.");
            return;
        }
        giveKudos({ receiverId, message, isPublic });
        setIsSubmitted(true);
        setTimeout(() => navigate('/performance/feed'), 1500);
    };
    
    if(isSubmitted) {
        return (
            <PageWrapper title="Give Kudos">
                <Card>
                    <div className="text-center py-20">
                        <Award size={48} className="mx-auto mb-4 text-green-500"/>
                        <h2 className="text-2xl font-bold text-slate-800">Kudos Sent!</h2>
                        <p className="text-slate-600 mt-2">Thank you for recognizing your colleague's hard work.</p>
                    </div>
                </Card>
            </PageWrapper>
        );
    }
    
    return (
        <PageWrapper title="Give Kudos">
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                    <p className="text-sm text-slate-600">
                        Recognize a colleague for their great work! Your message will be shared with them and their manager. 
                        Public kudos will also appear on the company feed.
                    </p>
                    <Select id="receiverId" label="Select Colleague" value={receiverId} onChange={e => setReceiverId(e.target.value)} required>
                        <option value="" disabled>-- Select an employee --</option>
                        {otherEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </Select>
                     <div>
                        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                            Your Message
                        </label>
                        <textarea
                            id="message"
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g., Thanks for your help on the project, your insights were invaluable!"
                            required
                        />
                    </div>
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="isPublic"
                                name="isPublic"
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isPublic" className="font-medium text-slate-700">Make this kudos public</label>
                            <p className="text-slate-500">Visible to everyone on the Company Feed.</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="submit" leftIcon={<Send size={16}/>}>Send Kudos</Button>
                    </div>
                </form>
            </Card>
        </PageWrapper>
    );
};

export default GiveKudosPage;
