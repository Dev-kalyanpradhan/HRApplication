
import React, { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoanStatus } from '../../types';
import AddLoanModal from '../../components/payroll/AddLoanModal';
import Avatar from '../../components/ui/Avatar';

const LoanManagementPage: React.FC = () => {
    const { employees, loans, addLoan } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getStatusChip = (status: LoanStatus) => {
        const colors: Record<LoanStatus, string> = {
            [LoanStatus.ACTIVE]: 'bg-green-100 text-green-800',
            [LoanStatus.PAID_OFF]: 'bg-slate-100 text-slate-800',
        };
        return colors[status];
    };

    const loanDetails = useMemo(() => {
        return loans.map(loan => {
            const employee = employees.find(e => e.id === loan.employeeId);
            const totalRepaid = loan.repayments.reduce((acc, r) => acc + r.amount, 0);
            const balance = loan.loanAmount - totalRepaid;
            return {
                ...loan,
                employeeName: employee?.name || 'N/A',
                employeeRole: employee?.role || 'N/A',
                totalRepaid,
                balance,
            };
        }).sort((a,b) => (a.status > b.status) ? 1 : ((b.status > a.status) ? -1 : 0));
    }, [loans, employees]);

    return (
        <PageWrapper
            title="Loan & Advance Management"
            actions={
                <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
                    Add New Loan
                </Button>
            }
        >
            <Card>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold">Employee</th>
                                <th className="p-4 font-semibold text-right">Loan Amount</th>
                                <th className="p-4 font-semibold text-right">EMI</th>
                                <th className="p-4 font-semibold text-right">Balance</th>
                                <th className="p-4 font-semibold">Period</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loanDetails.map(loan => (
                                <tr key={loan.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={loan.employeeName} size="md" />
                                            <div>
                                                <p className="font-semibold text-slate-800">{loan.employeeName}</p>
                                                <p className="text-xs text-slate-500">{loan.employeeRole}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-right text-slate-700">₹{new Intl.NumberFormat('en-IN').format(loan.loanAmount)}</td>
                                    <td className="p-4 font-mono text-right text-slate-700">₹{new Intl.NumberFormat('en-IN').format(loan.emi)}</td>
                                    <td className="p-4 font-mono text-right font-semibold text-blue-700">₹{new Intl.NumberFormat('en-IN').format(loan.balance)}</td>
                                    <td className="p-4 text-sm text-slate-600">{new Date(loan.startDate).toLocaleDateString('en-IN')} to {new Date(loan.endDate).toLocaleDateString('en-IN')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(loan.status)}`}>
                                            {loan.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {loanDetails.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <p>No loan records found.</p>
                        </div>
                    )}
                </div>
            </Card>
            <AddLoanModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addLoan}
                employees={employees}
            />
        </PageWrapper>
    );
};

export default LoanManagementPage;