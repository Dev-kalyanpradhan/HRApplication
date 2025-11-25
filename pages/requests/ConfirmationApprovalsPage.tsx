import React, { useMemo, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { ConfirmationStatus, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { Check, X, Clock, Search, Download } from 'lucide-react';
import { downloadCsv } from '../../utils/csvUtils';

const ConfirmationApprovalsPage: React.FC = () => {
    const { currentUser, userRole, employees, confirmationRequests, updateConfirmationRequestStatus } = useAuth();
    const [filterStatus, setFilterStatus] = useState<ConfirmationStatus | 'all'>(ConfirmationStatus.PENDING_REPORTING_MANAGER_APPROVAL);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRequests = useMemo(() => {
        if (!currentUser) return [];
        let requests = confirmationRequests;
        
        // Role-based filtering
        if (userRole === UserRole.MANAGER) {
            requests = requests.filter(req => {
                const employee = employees.find(e => e.id === req.employeeId);
                return employee?.reportingManagerId === currentUser.id || employee?.functionalManagerId === currentUser.id;
            });
        }
        // Admin sees all

        // Status filter
        if (filterStatus !== 'all') {
            requests = requests.filter(req => req.status === filterStatus);
        }

        // Search filter
        if (searchTerm.trim() !== '') {
            requests = requests.filter(req =>
                req.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return requests.sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    }, [confirmationRequests, currentUser, userRole, employees, filterStatus, searchTerm]);

    const handleApprove = (requestId: string) => {
        updateConfirmationRequestStatus(requestId, 'approve');
    };

    const handleReject = (requestId: string) => {
        updateConfirmationRequestStatus(requestId, 'reject');
    };
    
    const handleDownload = () => {
        const headers = ['Request ID', 'Employee Name', 'Employee ID', 'Request Date', 'Status', 'Approval Date'];
        const rows = filteredRequests.map(req => [
            req.id,
            req.employeeName,
            req.employeeId,
            req.requestDate,
            req.status,
            req.approvalDate || ''
        ]);
        downloadCsv(`confirmation_requests_${filterStatus.toString().toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    };
    
    const getStatusChip = (status: ConfirmationStatus) => {
        switch (status) {
            case ConfirmationStatus.PENDING_REPORTING_MANAGER_APPROVAL: return 'bg-yellow-100 text-yellow-800';
            case ConfirmationStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL: return 'bg-blue-100 text-blue-800';
            case ConfirmationStatus.APPROVED: return 'bg-green-100 text-green-800';
            case ConfirmationStatus.REJECTED: return 'bg-red-100 text-red-800';
            case ConfirmationStatus.CONFIRMED: return 'bg-green-100 text-green-800 font-semibold';
            default: return 'bg-slate-100 text-slate-800';
        }
    };
    
    const statusFilters: (ConfirmationStatus | 'all')[] = ['all', ConfirmationStatus.PENDING_REPORTING_MANAGER_APPROVAL, ConfirmationStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL, ConfirmationStatus.APPROVED, ConfirmationStatus.REJECTED];


    return (
        <PageWrapper title="Confirmation Approvals & History" actions={
            (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && (
                <Button onClick={handleDownload} variant="secondary" leftIcon={<Download size={16}/>}>
                    Download List
                </Button>
            )
        }>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                     <div className="flex border-b border-slate-200 flex-wrap">
                        {statusFilters.map(status => (
                             <button 
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 font-medium text-sm text-center transition-colors ${filterStatus === status ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {status === 'all' ? 'All' : status.replace(' Approval','').replace('Pending ','')}
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
                                <th className="p-4 font-semibold">Requested On</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(req => {
                                const employee = employees.find(e => e.id === req.employeeId);
                                if (!employee) return null;
                                
                                const isActionable = (
                                    (req.status === ConfirmationStatus.PENDING_REPORTING_MANAGER_APPROVAL && (userRole === UserRole.ADMIN || employee.reportingManagerId === currentUser?.id)) ||
                                    (req.status === ConfirmationStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL && (userRole === UserRole.ADMIN || employee.functionalManagerId === currentUser?.id))
                                );

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
                                        <td className="p-4 text-slate-700">{new Date(req.requestDate).toLocaleDateString('en-IN')}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {isActionable && (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button size="sm" variant="secondary" onClick={() => handleApprove(req.id)}>
                                                        <Check size={16} className="text-green-600 mr-1"/> Approve
                                                    </Button>
                                                    <Button size="sm" variant="secondary" onClick={() => handleReject(req.id)}>
                                                        <X size={16} className="text-red-600 mr-1"/> Reject
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
                            <p>No confirmation requests match the current filters.</p>
                        </div>
                    )}
                </div>
            </Card>
        </PageWrapper>
    );
};

export default ConfirmationApprovalsPage;