
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { LeaveRequest, LeaveType } from '../../types';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (request: Omit<LeaveRequest, 'id' | 'employeeName' | 'status' | 'employeeId' | 'submissionDate'>) => void;
}

const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose, onApply }) => {
  const [leaveType, setLeaveType] = useState<LeaveType>(LeaveType.CASUAL);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
        alert("Please fill all fields.");
        return;
    }
    onApply({ leaveType, startDate, endDate, reason });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for Leave">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Select id="leaveType" label="Leave Type" value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)}>
          {Object.values(LeaveType)
            .filter(type => type !== LeaveType.ON_DUTY)
            .map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Select>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input id="startDate" label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <Input id="endDate" label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>
        <Input id="reason" label="Reason for Leave" value={reason} onChange={(e) => setReason(e.target.value)} required />
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Submit Request</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyLeaveModal;
