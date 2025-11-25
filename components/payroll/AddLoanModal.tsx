
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, EmployeeLoan } from '../../types';

interface AddLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (loan: Omit<EmployeeLoan, 'id'|'status'|'repayments'|'endDate'>) => void;
    employees: Employee[];
}

const AddLoanModal: React.FC<AddLoanModalProps> = ({ isOpen, onClose, onAdd, employees }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [emi, setEmi] = useState('');
    const [startDate, setStartDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            employeeId,
            loanAmount: Number(loanAmount),
            emi: Number(emi),
            startDate,
        });
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Employee Loan">
            <form onSubmit={handleSubmit} className="space-y-6">
                 <Select id="employeeId" label="Select Employee" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required>
                    <option value="" disabled>-- Select an employee --</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                    ))}
                </Select>
                <Input id="loanAmount" label="Loan Amount (Principal)" type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} required />
                <Input id="emi" label="Monthly EMI Amount" type="number" value={emi} onChange={e => setEmi(e.target.value)} required />
                <Input id="startDate" label="First Repayment Month (Start Date)" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Add Loan</Button>
                </div>
            </form>
        </Modal>
    );
}

export default AddLoanModal;
