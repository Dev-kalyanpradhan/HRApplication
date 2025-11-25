
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const ApplyTravelPage: React.FC = () => {
    const { addTravelRequest } = useAuth();
    const navigate = useNavigate();

    const [destination, setDestination] = useState('');
    const [purpose, setPurpose] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [estimatedCost, setEstimatedCost] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!destination || !purpose || !startDate || !endDate || !estimatedCost) {
            alert("Please fill all fields.");
            return;
        }
        addTravelRequest({ destination, purpose, startDate, endDate, estimatedCost: Number(estimatedCost) });
        navigate('/travel/requests');
    };

    return (
        <PageWrapper title="Apply for Travel">
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                     <p className="text-sm text-slate-600">
                        Complete the details below to submit a business travel request for approval.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input id="destination" label="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                        <Input id="estimatedCost" label="Estimated Cost (INR)" type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} required />
                    </div>
                     <div>
                        <label htmlFor="purpose" className="block text-sm font-medium text-slate-700 mb-1">
                            Purpose of Travel
                        </label>
                        <textarea
                            id="purpose"
                            rows={4}
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g., Client meeting, conference, etc."
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input id="startDate" label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                    <Input id="endDate" label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="submit">Submit Request</Button>
                    </div>
                </form>
            </Card>
        </PageWrapper>
    );
};

export default ApplyTravelPage;
