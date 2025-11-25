
import React, { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Gift, ArrowDownCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AddVariablePayModal from '../../components/payroll/AddVariablePayModal';
import Avatar from '../../components/ui/Avatar';

const VariablePayPage: React.FC = () => {
    const { employees, variablePayments, addVariablePayment } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // Show payments for the upcoming payroll run
    const upcomingPayments = useMemo(() => {
        return variablePayments
            .filter(p => p.year === currentYear && p.month === currentMonth)
            .sort((a,b) => a.type.localeCompare(b.type));
    }, [variablePayments, currentYear, currentMonth]);

    return (
        <PageWrapper
            title="One-Time Payments & Deductions"
            actions={
                <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
                    Add New Entry
                </Button>
            }
        >
            <Card>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Entries for {today.toLocaleString('default', { month: 'long' })} {currentYear} Payroll</h3>
                    <p className="text-sm text-slate-500">These one-time adjustments will be included in the next payroll run.</p>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold">Employee</th>
                                <th className="p-4 font-semibold">Description</th>
                                <th className="p-4 font-semibold">Type</th>
                                <th className="p-4 font-semibold text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingPayments.map(payment => {
                                const employee = employees.find(e => e.id === payment.employeeId);
                                const isEarning = payment.type === 'earning';
                                return (
                                <tr key={payment.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={employee?.name || ''} size="md" />
                                            <div>
                                                <p className="font-semibold text-slate-800">{employee?.name}</p>
                                                <p className="text-xs text-slate-500">{employee?.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-700">{payment.description}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${isEarning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {isEarning ? <Gift size={14}/> : <ArrowDownCircle size={14}/>}
                                            {isEarning ? 'Earning' : 'Deduction'}
                                        </span>
                                    </td>
                                    <td className={`p-4 font-mono text-right ${isEarning ? 'text-green-700' : 'text-red-700'}`}>
                                       {isEarning ? '+' : '-'} ₹{new Intl.NumberFormat('en-IN').format(payment.amount)}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                     {upcomingPayments.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <p>No variable payments scheduled for this month's payroll.</p>
                        </div>
                    )}
                </div>
            </Card>
            <AddVariablePayModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addVariablePayment}
                employees={employees}
            />
        </PageWrapper>
    );
};

export default VariablePayPage;