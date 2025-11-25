import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AttendanceStatus } from '../../types';

interface EditAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (status: AttendanceStatus) => void;
    date: string;
    currentStatus?: AttendanceStatus;
}

const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({ isOpen, onClose, onUpdate, date, currentStatus }) => {
    const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | undefined>(currentStatus);

    useEffect(() => {
        setSelectedStatus(currentStatus);
    }, [currentStatus, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStatus) {
            onUpdate(selectedStatus);
            onClose();
        }
    };

    const statusOptions = [
        { id: AttendanceStatus.PRESENT, label: 'Present' },
        { id: AttendanceStatus.ABSENT, label: 'Absent' },
        { id: AttendanceStatus.ON_LEAVE, label: 'On Leave' },
        { id: AttendanceStatus.HOLIDAY, label: 'Holiday / Week Off' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Update Attendance for ${new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric'})}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm text-slate-600">Select the new status for this day.</p>
                <div className="space-y-3">
                    {statusOptions.map(option => (
                        <label key={option.id} className="flex items-center space-x-3 p-3 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300">
                             <input
                                type="radio"
                                name="attendanceStatus"
                                value={option.id}
                                checked={selectedStatus === option.id}
                                onChange={() => setSelectedStatus(option.id)}
                                className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700">{option.label}</span>
                        </label>
                    ))}
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={!selectedStatus}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditAttendanceModal;
