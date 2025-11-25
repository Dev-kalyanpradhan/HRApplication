import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, LearningAssignment } from '../../types';

interface AssignLearningModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamMembers: Employee[];
}

const AssignLearningModal: React.FC<AssignLearningModalProps> = ({ isOpen, onClose, teamMembers }) => {
    const { assignLearning } = useAuth();
    const [employeeId, setEmployeeId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId || !title || !link) {
            alert('Please select an employee and provide a title and link.');
            return;
        }

        const assignmentData: Omit<LearningAssignment, 'id'|'assignedById'|'assignedAt'|'status'|'completedAt'> = {
            employeeId,
            title,
            description,
            link,
            dueDate: dueDate || undefined,
        };
        
        assignLearning(assignmentData);
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assign Learning Material" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                 <Select id="employeeId" label="Assign To" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required>
                    <option value="" disabled>-- Select an employee --</option>
                    {teamMembers.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                </Select>
                <Input id="title" label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Advanced React Patterns" required/>
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Provide a brief summary of the learning material."
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input id="link" label="URL/Link" type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://example.com/course" required/>
                    <Input id="dueDate" label="Due Date (Optional)" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Assign</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AssignLearningModal;
