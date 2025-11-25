
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { TravelRequest } from '../../types';

interface ApplyTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (request: Omit<TravelRequest, 'id' | 'employeeName' | 'status' | 'employeeId' | 'submissionDate'>) => void;
}

const ApplyTravelModal: React.FC<ApplyTravelModalProps> = ({ isOpen, onClose, onApply }) => {
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
    onApply({ destination, purpose, startDate, endDate, estimatedCost: Number(estimatedCost) });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for Travel">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input id="destination" label="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} required />
            <Input id="estimatedCost" label="Estimated Cost (INR)" type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} required />
        </div>
        <Input id="purpose" label="Purpose of Travel" value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input id="startDate" label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <Input id="endDate" label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Submit Request</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyTravelModal;
