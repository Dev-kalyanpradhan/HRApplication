
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';

interface InitiateOffboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInitiate: (employeeId: string, lastWorkingDay: string, reason: string) => void;
}

const InitiateOffboardingModal: React.FC<InitiateOffboardingModalProps> = ({ isOpen, onClose, onInitiate }) => {
    const { employees } = useAuth();
    const [employeeId, setEmployeeId] = useState('');
    const [lastWorkingDay, setLastWorkingDay] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onInitiate(employeeId, lastWorkingDay, reason);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Initiate Employee Exit">
            <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm text-slate-600">
                    Select an employee to begin the offboarding process. This will create and assign all necessary clearance tasks.
                </p>
                <Select id="employeeId" label="Select Employee" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required>
                    <option value="" disabled>-- Select an employee --</option>
                    {employees.filter(e => !e.exitDetails).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </Select>
                <Input id="lastWorkingDay" label="Last Working Day" type="date" value={lastWorkingDay} onChange={e => setLastWorkingDay(e.target.value)} required />
                <div>
                     <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">
                        Reason for Leaving
                    </label>
                    <textarea
                        id="reason"
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., Resignation, Termination"
                        required
                    />
                </div>
                 <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Initiate Process</Button>
                </div>
            </form>
        </Modal>
    );
};

export default InitiateOffboardingModal;
