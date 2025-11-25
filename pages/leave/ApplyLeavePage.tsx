

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { LeaveType, Employee } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getLeaveDurationInDays } from '../../utils/dateUtils';
import { AlertTriangle } from 'lucide-react';

const leaveTypeToBalanceKey = (leaveType: LeaveType): keyof Employee['leaveBalance'] | null => {
    switch (leaveType) {
        case LeaveType.CASUAL: return 'casual';
        case LeaveType.SICK: return 'sick';
        case LeaveType.EARNED: return 'earned';
        default: return null;
    }
};

const ApplyLeavePage: React.FC = () => {
  const { currentUser, addLeaveRequest } = useAuth();
  const navigate = useNavigate();

  const [leaveType, setLeaveType] = useState<LeaveType>(LeaveType.CASUAL);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const currentBalance = useMemo(() => {
    if (!currentUser) return 0;
    const key = leaveTypeToBalanceKey(leaveType);
    return key ? currentUser.leaveBalance[key] : 0;
  }, [leaveType, currentUser]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate || !reason) {
        setError("Please fill all fields.");
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        setError("Start date cannot be after end date.");
        return;
    }

    const duration = getLeaveDurationInDays(startDate, endDate);
    if (duration <= 0) {
        setError("Please select a valid date range.");
        return;
    }

    const balanceKey = leaveTypeToBalanceKey(leaveType);
    if (balanceKey) {
        if (currentUser && currentUser.leaveBalance[balanceKey] < duration) {
            setError(`Insufficient leave balance. You have ${currentUser.leaveBalance[balanceKey]} day(s) but are requesting ${duration}.`);
            return;
        }
    }

    try {
        addLeaveRequest({ leaveType, startDate, endDate, reason });
        navigate('/leave/requests'); // Navigate to the requests list
    } catch (err: any) {
        setError(err.message);
    }
  };

  return (
    <PageWrapper title="Apply for Leave">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <p className="text-sm text-slate-600">
                Fill out the form to request time off. Your request will be sent to your manager for approval.
            </p>
            <div>
                <Select id="leaveType" label="Leave Type" value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)}>
                {Object.values(LeaveType)
                    .filter(type => type !== LeaveType.ON_DUTY)
                    .map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
                </Select>
                 <p className="text-sm text-slate-500 mt-2">
                    Available Balance: <span className="font-bold text-blue-600">{currentBalance}</span> days
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input id="startDate" label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            <Input id="endDate" label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            <div>
                <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">
                    Reason for Leave
                </label>
                <textarea
                    id="reason"
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Please provide a brief reason for your leave request."
                    required
                />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  <AlertTriangle size={20} />
                  <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit">Submit Request</Button>
            </div>
        </form>
      </Card>
    </PageWrapper>
  );
};

export default ApplyLeavePage;