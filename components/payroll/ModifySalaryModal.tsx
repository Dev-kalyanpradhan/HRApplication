import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Employee } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { calculateSalaryBreakdown } from '../../utils/salaryCalculator';
import { AlertTriangle, Send, Loader } from 'lucide-react';

interface ModifySalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onApprovalSent: (employeeId: string) => void;
}

const currencyFormat = (value: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat('en-IN', options).format(value);
}

const BreakdownRow: React.FC<{ label: string; current: number; new: number; isDeduction?: boolean }> = ({ label, current, new: newValue, isDeduction }) => {
    const change = newValue - current;
    const changeColor = isDeduction ? (change > 0 ? 'text-red-500' : 'text-green-500') : (change > 0 ? 'text-green-500' : 'text-red-500');
    
    return (
        <tr className="text-sm">
            <td className="py-1 pr-2 text-slate-600">{label}</td>
            <td className="py-1 px-2 font-mono text-slate-700 text-right">{currencyFormat(current, {maximumFractionDigits: 0})}</td>
            <td className="py-1 pl-2 font-mono text-blue-700 font-semibold text-right">{currencyFormat(newValue, {maximumFractionDigits: 0})}</td>
            <td className={`py-1 pl-2 font-mono text-right ${changeColor}`}>{change.toFixed(0) !== '0' ? `${change > 0 ? '+' : ''}${currencyFormat(change, {maximumFractionDigits: 0})}` : '-'}</td>
        </tr>
    )
}

const ModifySalaryModal: React.FC<ModifySalaryModalProps> = ({ isOpen, onClose, employee, onApprovalSent }) => {
    const { salaryComponents, requestSalaryChange } = useAuth();
    const [newCtc, setNewCtc] = useState<string>(String(employee.ctc || ''));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const componentsToUse = useMemo(() => employee.salaryStructure || salaryComponents, [employee, salaryComponents]);

    const currentBreakdown = useMemo(() => {
        const monthlyCtc = (employee.ctc || 0) / 12;
        return calculateSalaryBreakdown(monthlyCtc, componentsToUse);
    }, [employee.ctc, componentsToUse]);

    const newBreakdown = useMemo(() => {
        const newCtcValue = Number(newCtc);
        if (isNaN(newCtcValue) || newCtcValue < 0) return null;
        const monthlyCtc = newCtcValue / 12;
        return calculateSalaryBreakdown(monthlyCtc, componentsToUse);
    }, [newCtc, componentsToUse]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const newCtcValue = Number(newCtc);
        if (isNaN(newCtcValue) || newCtcValue <= 0) {
            setError('Please enter a valid CTC amount.');
            return;
        }
        if (newCtcValue === employee.ctc) {
            setError('The new CTC is the same as the current CTC.');
            return;
        }
        
        setIsLoading(true);
        try {
            await requestSalaryChange(employee.id, newCtcValue);
            onApprovalSent(employee.id);
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const isReadyForComparison = newBreakdown && newCtc && Number(newCtc) > 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Modify Salary for ${employee.name}`} size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Input
                        id="newCtc"
                        label="New Annual CTC (₹)"
                        type="number"
                        value={newCtc}
                        onChange={(e) => setNewCtc(e.target.value)}
                        required
                    />
                </div>

                {isReadyForComparison && (
                    <div className="p-4 bg-slate-50 rounded-lg border">
                        <h4 className="font-semibold text-slate-800 mb-2">Impact Analysis</h4>
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-slate-500">
                                    <th className="font-medium text-left">Metric</th>
                                    <th className="font-medium text-right">Current Monthly</th>
                                    <th className="font-medium text-right">New Monthly</th>
                                    <th className="font-medium text-right">Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                <BreakdownRow label="Gross Earnings" current={currentBreakdown.gross} new={newBreakdown!.gross} />
                                <BreakdownRow label="Deductions" current={currentBreakdown.deductions} new={newBreakdown!.deductions} isDeduction />
                                <tr className="border-t font-semibold">
                                    <td className="py-1 pr-2 text-slate-800">Net Pay</td>
                                    <td className="py-1 px-2 font-mono text-slate-800 text-right">{currencyFormat(currentBreakdown.net, {maximumFractionDigits: 0})}</td>
                                    <td className="py-1 pl-2 font-mono text-blue-800 text-right">{currencyFormat(newBreakdown!.net, {maximumFractionDigits: 0})}</td>
                                    <td className={`py-1 pl-2 font-mono text-right ${newBreakdown!.net > currentBreakdown.net ? 'text-green-500' : 'text-red-500'}`}>{`${(newBreakdown!.net - currentBreakdown.net) > 0 ? '+' : ''}${currencyFormat(newBreakdown!.net - currentBreakdown.net, {maximumFractionDigits: 0})}`}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
                
                 {error && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
                        <AlertTriangle size={20} />
                        <span>{error}</span>
                    </div>
                 )}

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button type="submit" disabled={isLoading || !isReadyForComparison}>
                        {isLoading ? <><Loader size={16} className="animate-spin mr-2"/> Sending...</> : <><Send size={16} className="mr-2"/> Send for Approval</>}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ModifySalaryModal;