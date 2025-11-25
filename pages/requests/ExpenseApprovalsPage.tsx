import React, { useMemo, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { ExpenseStatus, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { Check, X, Clock, Paperclip, Search, Download } from 'lucide-react';
import { getSubordinateIds } from '../../utils/hierarchyUtils';
import { downloadCsv } from '../../utils/csvUtils';

const ExpenseApprovalsPage: React.FC = () => {
    const { currentUser, userRole, employees, expenseRequests, updateExpenseRequestStatus } = useAuth();
    const [filterStatus, setFilterStatus] = useState<ExpenseStatus | 'all'>(ExpenseStatus.PENDING);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRequests = useMemo(() => {
        if (!currentUser) return [];

        let requests = expenseRequests;

        // Role-based filtering
        if (userRole === UserRole.MANAGER) {
            const subordinateIds = getSubordinateIds(currentUser.id, employees);
            const teamIds = [currentUser.id, ...subordinateIds];
            requests = requests.filter(req => teamIds.includes(req.employeeId));
        }
        // Admin sees all

        // Status filter
        if (filterStatus !== 'all') {
            requests = requests.filter(req => req.status === filterStatus);
        }

        // Search filter
        if (searchTerm.trim() !== '') {
            requests = requests.filter(req => 
                req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                req.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return requests.sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
    }, [expenseRequests, currentUser, userRole, employees, filterStatus, searchTerm]);
    
    const handleDownload = () => {
        const headers = ['Request ID', 'Employee Name', 'Employee ID', 'Expense Date', 'Category', 'Amount', 'Reason', 'Receipt Attached', 'Status', 'Submission Date'];
        const rows = filteredRequests.map(req => [
            req.id,
            req.employeeName,
            req.employeeId,
            req.expenseDate,
            req.category,
            req.amount,
            req.reason,
            req.receiptAttached || false,
            req.status,
            req.submissionDate
        ]);
        downloadCsv(`expense_requests_${filterStatus.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    };

    const getStatusInfo = (status: ExpenseStatus) => {
        switch (status) {
            case ExpenseStatus.APPROVED: return { text: 'Approved', color: 'bg-green-100 text-green-800' };
            case ExpenseStatus.PENDING: return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
            case ExpenseStatus.REJECTED: return { text: 'Rejected', color: 'bg-red-100 text-red-800' };
        }
    };

    const statusFilters: (ExpenseStatus | 'all')[] = [ExpenseStatus.PENDING, ExpenseStatus.APPROVED, ExpenseStatus.REJECTED, 'all'];

    return (
        <PageWrapper title="Expense Approvals & History" actions={
            (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && (
                <Button onClick={handleDownload} variant="secondary" leftIcon={<Download size={16}/>}>
                    Download List
                </Button>
            )
        }>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                     <div className="flex border-b border-slate-200">
                        {statusFilters.map(status => (
                             <button 
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${filterStatus === status ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-slate-300 rounded-md py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold">Employee</th>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold text-right">Amount</th>
                                <th className="p-4 font-semibold">Reason</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(req => {
                                const employee = employees.find(e => e.id === req.employeeId);
                                if (!employee) return null;
                                const statusInfo = getStatusInfo(req.status);
                                return (
                                    <tr key={req.id} className="border-b border-slate-200 hover:bg-slate-50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={employee.name} size="md" />
                                                <div>
                                                    <p className="font-semibold text-slate-800">{employee.name}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{employee.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-700">{new Date(req.expenseDate + 'T00:00:00Z').toLocaleDateString('en-IN')}</td>
                                        <td className="p-4 text-slate-700">{req.category}</td>
                                        <td className="p-4 text-slate-700 font-mono text-right">₹{new Intl.NumberFormat('en-IN').format(req.amount)}</td>
                                        <td className="p-4 text-slate-600 text-sm max-w-xs truncate" title={req.reason}>
                                            <div className="flex items-center gap-2">
                                                {req.receiptAttached && <Paperclip size={14} className="text-slate-400" />}
                                                <span>{req.reason}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {req.status === ExpenseStatus.PENDING && (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button size="sm" variant="secondary" onClick={() => updateExpenseRequestStatus(req.id, ExpenseStatus.APPROVED)}>
                                                        <Check size={16} className="text-green-600"/>
                                                    </Button>
                                                    <Button size="sm" variant="secondary" onClick={() => updateExpenseRequestStatus(req.id, ExpenseStatus.REJECTED)}>
                                                        <X size={16} className="text-red-600"/>
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredRequests.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <Clock size={24} className="mx-auto mb-2 text-slate-400"/>
                            <p>No expense requests match the current filters.</p>
                        </div>
                    )}
                </div>
            </Card>
        </PageWrapper>
    );
};

export default ExpenseApprovalsPage;