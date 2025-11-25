import React, { useMemo, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { SalaryChangeStatus, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { Check, X, ArrowRight, Clock, Search, Download } from 'lucide-react';
import { downloadCsv } from '../../utils/csvUtils';

const SalaryApprovalsPage: React.FC = () => {
    const { currentUser, userRole, employees, salaryChangeRequests, updateSalaryChangeStatus } = useAuth();
    const [filterStatus, setFilterStatus] = useState<SalaryChangeStatus | 'all'>(SalaryChangeStatus.PENDING);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRequests = useMemo(() => {
        if (!currentUser) return [];
        let requests = salaryChangeRequests;

        // Role-based filtering
        if (userRole === UserRole.MANAGER) {
            requests = requests.filter(req => req.approverId === currentUser.id);
        }
        // Admin sees all

        // Status filter
        if (filterStatus !== 'all') {
            requests = requests.filter(req => req.status === filterStatus);
        }

        // Search filter
        if (searchTerm.trim() !== '') {
            const employeeIds = employees
                .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(e => e.id);
            requests = requests.filter(req => employeeIds.includes(req.employeeId));
        }
        
        return requests.sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    }, [salaryChangeRequests, currentUser, userRole, employees, filterStatus, searchTerm]);
    
     const getStatusChip = (status: SalaryChangeStatus) => {
        switch (status) {
            case SalaryChangeStatus.APPROVED: return 'bg-green-100 text-green-800';
            case SalaryChangeStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
            case SalaryChangeStatus.REJECTED: return 'bg-red-100 text-red-800';
        }
    };

    const statusFilters: (SalaryChangeStatus | 'all')[] = [SalaryChangeStatus.PENDING, SalaryChangeStatus.APPROVED, SalaryChangeStatus.REJECTED, 'all'];
    
    const handleDownload = () => {
        const headers = ['Request ID', 'Employee Name', 'Employee ID', 'Requested By', 'Request Date', 'Old CTC', 'New CTC', 'Status', 'Approval Date'];
        const rows = filteredRequests.map(req => {
            const employee = employees.find(e => e.id === req.employeeId);
            const requester = employees.find(e => e.id === req.requesterId);
            return [
                req.id,
                employee?.name || req.employeeId,
                req.employeeId,
                requester?.name || req.requesterId,
                req.requestDate,
                req.oldCtc,
                req.newCtc,
                req.status,
                req.approvalDate || ''
            ];
        });
        downloadCsv(`salary_requests_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    };

    return (
        <PageWrapper title="Salary Approvals & History">
            <Card actions={
                 (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && (
                    <Button onClick={handleDownload} variant="secondary" size="sm" leftIcon={<Download size={16}/>}>
                        Download
                    </Button>
                )
            }>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                     <div className="flex border-b border-slate-200">
                        {statusFilters.map(status => (
                             <button 
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${filterStatus === status ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {status.replace(' Approval', '')}
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
                                <th className="p-4 font-semibold">Requested By</th>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">CTC Change (₹)</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(req => {
                                const employee = employees.find(e => e.id === req.employeeId);
                                const requester = employees.find(e => e.id === req.requesterId);
                                if (!employee) return null;

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
                                        <td className="p-4 text-slate-700">{requester?.name || 'N/A'}</td>
                                        <td className="p-4 text-slate-700">{new Date(req.requestDate).toLocaleDateString('en-IN')}</td>
                                        <td className="p-4">
                                             <div className="flex items-center gap-2 font-mono text-sm">
                                                <span className="text-slate-600">{new Intl.NumberFormat('en-IN').format(req.oldCtc)}</span>
                                                <ArrowRight size={14} className="text-slate-500"/>
                                                <span className="font-bold text-blue-800">{new Intl.NumberFormat('en-IN').format(req.newCtc)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {req.status === SalaryChangeStatus.PENDING && (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button size="sm" variant="secondary" onClick={() => updateSalaryChangeStatus(req.id, SalaryChangeStatus.APPROVED)}>
                                                        <Check size={16} className="text-green-600"/>
                                                    </Button>
                                                    <Button size="sm" variant="secondary" onClick={() => updateSalaryChangeStatus(req.id, SalaryChangeStatus.REJECTED)}>
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
                            <p>No salary requests match the current filters.</p>
                        </div>
                    )}
                </div>
            </Card>
        </PageWrapper>
    );
};

export default SalaryApprovalsPage;