
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, CheckCircle, Clock, XCircle, Paperclip } from 'lucide-react';
import { ExpenseStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const MyExpensesPage: React.FC = () => {
    const { currentUser, expenseRequests } = useAuth();
    const navigate = useNavigate();

    const myRequests = useMemo(() => {
        if (!currentUser) return [];
        return expenseRequests
            .filter(req => req.employeeId === currentUser.id)
            .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
    }, [currentUser, expenseRequests]);

    const getStatusInfo = (status: ExpenseStatus) => {
        switch (status) {
            case ExpenseStatus.APPROVED:
                return { text: 'Approved', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> };
            case ExpenseStatus.PENDING:
                return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> };
            case ExpenseStatus.REJECTED:
                return { text: 'Rejected', color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> };
        }
    };

    return (
        <PageWrapper
            title="My Expenses"
            actions={
                <Button onClick={() => navigate('/expenses/apply')} leftIcon={<Plus size={18} />}>
                    New Claim
                </Button>
            }
        >
            <Card title="My Expense Claims History">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold">Expense Date</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold text-right">Amount</th>
                                <th className="p-4 font-semibold">Reason</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myRequests.map(request => {
                                const statusInfo = getStatusInfo(request.status);
                                return (
                                    <tr key={request.id} className="border-b border-slate-200 hover:bg-slate-50">
                                        <td className="p-4 text-slate-700">{new Date(request.expenseDate + 'T00:00:00Z').toLocaleDateString('en-IN')}</td>
                                        <td className="p-4 text-slate-700">{request.category}</td>
                                        <td className="p-4 text-slate-700 text-right font-mono">₹{new Intl.NumberFormat('en-IN').format(request.amount)}</td>
                                        <td className="p-4 text-slate-600 text-sm max-w-xs truncate" title={request.reason}>
                                            <div className="flex items-center gap-2">
                                                {request.receiptAttached && <Paperclip size={14} className="text-slate-400" />}
                                                <span>{request.reason}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                                                {statusInfo.icon}
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {myRequests.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <p>You have not submitted any expense claims yet.</p>
                        </div>
                    )}
                </div>
            </Card>
        </PageWrapper>
    );
};

export default MyExpensesPage;