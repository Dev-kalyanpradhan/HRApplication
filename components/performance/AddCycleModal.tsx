
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { PerformanceCycle } from '../../types';

interface AddCycleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (cycle: Omit<PerformanceCycle, 'id' | 'status'>) => void;
}

const AddCycleModal: React.FC<AddCycleModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ name, startDate, endDate });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Performance Cycle">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    id="name"
                    label="Cycle Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Annual Review 2025"
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        id="startDate"
                        label="Start Date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                    <Input
                        id="endDate"
                        label="End Date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Create Cycle</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddCycleModal;
