
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, VariablePayment } from '../../types';

interface AddVariablePayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (payment: Omit<VariablePayment, 'id'>) => void;
    employees: Employee[];
}

const AddVariablePayModal: React.FC<AddVariablePayModalProps> = ({ isOpen, onClose, onAdd, employees }) => {
    const today = new Date();
    const [employeeId, setEmployeeId] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'earning'|'deduction'>('earning');
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            employeeId,
            description,
            amount: Number(amount),
            type,
            month: Number(month),
            year: Number(year)
        });
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Variable Payment/Deduction">
            <form onSubmit={handleSubmit} className="space-y-6">
                 <Select id="employeeId" label="Select Employee" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required>
                    <option value="" disabled>-- Select an employee --</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                    ))}
                </Select>
                <Input id="description" label="Description (e.g., Performance Bonus)" value={description} onChange={e => setDescription(e.target.value)} required />
                <div className="grid grid-cols-2 gap-4">
                    <Input id="amount" label="Amount (INR)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                    <Select id="type" label="Type" value={type} onChange={e => setType(e.target.value as 'earning'|'deduction')}>
                        <option value="earning">Earning (adds to salary)</option>
                        <option value="deduction">Deduction (subtracts from salary)</option>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">For Payroll Period</label>
                    <div className="grid grid-cols-2 gap-4">
                        <Select id="month" label="" value={month} onChange={e => setMonth(Number(e.target.value))}>
                            {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(0, m-1).toLocaleString('default', { month: 'long' })}</option>)}
                        </Select>
                         <Select id="year" label="" value={year} onChange={e => setYear(Number(e.target.value))}>
                            {[today.getFullYear(), today.getFullYear()+1].map(y => <option key={y} value={y}>{y}</option>)}
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Add Entry</Button>
                </div>
            </form>
        </Modal>
    );
}

export default AddVariablePayModal;
