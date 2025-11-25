

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { LeaveType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const ApplyODPage: React.FC = () => {
  const { addLeaveRequest } = useAuth();
  const navigate = useNavigate();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
        alert("Please fill all fields.");
        return;
    }
    addLeaveRequest({ 
        leaveType: LeaveType.ON_DUTY, 
        startDate, 
        endDate, 
        reason 
    });
    navigate('/leave/requests'); // Redirect to leave page to see the status
  };

  return (
    <PageWrapper title="Apply for On-Duty (OD)">
        <Card>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                <p className="text-sm text-slate-600">
                    Use this form to request for 'On-Duty' attendance for days when you were working outside the office, such as for client meetings or field work. Your request will be sent for approval. You can check the status on the <Link to="/leave/requests" className="text-blue-600 hover:underline font-medium">Leave Management</Link> page.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="startDate" label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                <Input id="endDate" label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">
                        Purpose / Reason
                    </label>
                    <textarea
                        id="reason"
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., Client visit to XYZ Corp in Pune"
                        required
                    />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit">Submit Request</Button>
                </div>
            </form>
        </Card>
    </PageWrapper>
  );
};

export default ApplyODPage;
