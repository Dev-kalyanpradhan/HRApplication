import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Check, X, Send, Search, Download } from 'lucide-react';
import { LeaveRequest, LeaveStatus, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getSubordinateIds } from '../../utils/hierarchyUtils';
import { downloadCsv } from '../../utils/csvUtils';

const LeavePage: React.FC = () => {
  const { currentUser, userRole, employees, leaveRequests, updateLeaveRequestStatus } = useAuth();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState<LeaveStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const visibleRequests = useMemo(() => {
    if (!currentUser) return [];
    
    let filtered = leaveRequests;

    if (userRole === UserRole.EMPLOYEE) {
        // Employees see only their own requests
        filtered = leaveRequests.filter(req => req.employeeId === currentUser.id);
    }
    
    if (userRole === UserRole.MANAGER) {
      // Managers see requests for their entire reporting line (including themselves)
      const subordinateIds = getSubordinateIds(currentUser.id, employees);
      const teamIds = new Set([currentUser.id, ...subordinateIds]);
      filtered = leaveRequests.filter(req => teamIds.has(req.employeeId));
    }
    // Admin sees all by default

    // Apply status filter to the role-filtered list
    if (filterStatus !== 'all') {
        filtered = filtered.filter(req => req.status === filterStatus);
    }
    
    // Apply search term filter to the role-and-status-filtered list
    if (searchTerm.trim() && userRole !== UserRole.EMPLOYEE) {
        filtered = filtered.filter(req => 
            req.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return filtered.sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());

  }, [currentUser, userRole, leaveRequests, employees, filterStatus, searchTerm]);

  const handleReportingManagerApprove = (id: string) => {
    updateLeaveRequestStatus(id, LeaveStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL);
  }

  const handleFunctionalManagerApprove = (id: string) => {
    updateLeaveRequestStatus(id, LeaveStatus.APPROVED);
  }

  const handleReject = (id: string) => {
    updateLeaveRequestStatus(id, LeaveStatus.REJECTED);
  };
  
  const handleDownload = () => {
    const headers = ['Request ID', 'Employee Name', 'Employee ID', 'Leave Type', 'Start Date', 'End Date', 'Reason', 'Status', 'Submission Date'];
    const rows = visibleRequests.map(req => [
        req.id,
        req.employeeName,
        req.employeeId,
        req.leaveType,
        req.startDate,
        req.endDate,
        req.reason,
        req.status,
        req.submissionDate
    ]);
    downloadCsv(`leave_requests_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const getStatusChip = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED: return 'bg-green-100 text-green-800';
      case LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL: return 'bg-yellow-100 text-yellow-800';
      case LeaveStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL: return 'bg-blue-100 text-blue-800';
      case LeaveStatus.REJECTED: return 'bg-red-100 text-red-800';
    }
  };
  
  const leaveBalances = currentUser?.leaveBalance || { casual: 0, sick: 0, earned: 0 };

  const statusFilters: (LeaveStatus|'all')[] = ['all', LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL, LeaveStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL, LeaveStatus.APPROVED, LeaveStatus.REJECTED];


  return (
    <PageWrapper
      title="Leave Requests & Balances"
      actions={
        (userRole === UserRole.EMPLOYEE || userRole === UserRole.MANAGER || userRole === UserRole.ADMIN) && (
          <Button onClick={() => navigate('/leave/apply')} leftIcon={<Send size={18} />}>
            Apply for Leave
          </Button>
        )
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
            <p className="text-slate-500">Casual Leave</p>
            <p className="text-3xl font-bold mt-1">{leaveBalances.casual} <span className="text-lg font-normal">days left</span></p>
        </Card>
        <Card>
            <p className="text-slate-500">Sick Leave</p>
            <p className="text-3xl font-bold mt-1">{leaveBalances.sick} <span className="text-lg font-normal">days left</span></p>
        </Card>
        <Card>
            <p className="text-slate-500">Earned Leave</p>
            <p className="text-3xl font-bold mt-1">{leaveBalances.earned} <span className="text-lg font-normal">days left</span></p>
        </Card>
      </div>
      
      <Card title="Leave Requests History" actions={
        (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && (
            <Button onClick={handleDownload} variant="secondary" size="sm" leftIcon={<Download size={16}/>}>
                Download
            </Button>
        )
      }>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 p-2 rounded-lg bg-slate-50 border">
            <div className="flex flex-wrap items-center">
                <span className="text-sm font-medium mr-2">Status:</span>
                {statusFilters.map(status => (
                    <button 
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-colors ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-600 border'}`}
                    >
                        {status === 'all' ? 'All' : status.replace('Pending ', '').replace(' Approval', '')}
                    </button>
                ))}
            </div>
             {userRole !== UserRole.EMPLOYEE && (
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by employee..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white border border-slate-300 rounded-md py-2 pl-10 pr-4 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            )}
        </div>
      <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Dates</th>
                <th className="p-4 font-semibold">Submitted On</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRequests.map(request => {
                const requestEmployee = employees.find(e => e.id === request.employeeId);
                if (!requestEmployee || !currentUser) return null;

                const isReportingManager = currentUser.id === requestEmployee.reportingManagerId;
                const isFunctionalManager = currentUser.id === requestEmployee.functionalManagerId;

                const showReportingManagerActions = isReportingManager && request.status === LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL;
                const showFunctionalManagerActions = isFunctionalManager && request.status === LeaveStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL;
                const isAdminAndPending = userRole === UserRole.ADMIN && (request.status === LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL || request.status === LeaveStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL);

                return (
                  <tr key={request.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{request.employeeName}</td>
                    <td className="p-4 text-slate-700">{request.leaveType}</td>
                    <td className="p-4 text-slate-700">{`${new Date(request.startDate + 'T00:00:00').toLocaleDateString('en-IN')} - ${new Date(request.endDate + 'T00:00:00').toLocaleDateString('en-IN')}`}</td>
                    <td className="p-4 text-slate-700">{new Date(request.submissionDate + 'T00:00:00').toLocaleDateString('en-IN')}</td>
                    <td className="p-4 text-slate-700 max-w-xs truncate" title={request.reason}>{request.reason}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusChip(request.status)}`}>
                          {request.status}
                        </span>
                    </td>
                    <td className="p-4 text-center">
                      {(showReportingManagerActions || showFunctionalManagerActions || isAdminAndPending) && (
                        <div className="flex gap-2 justify-center">
                           {(showReportingManagerActions || (userRole === UserRole.ADMIN && request.status === LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL)) &&
                            <Button size="sm" variant="secondary" onClick={() => handleReportingManagerApprove(request.id)}><Check size={16} className="text-green-600"/></Button>
                          }
                          {(showFunctionalManagerActions || (userRole === UserRole.ADMIN && request.status === LeaveStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL)) &&
                            <Button size="sm" variant="secondary" onClick={() => handleFunctionalManagerApprove(request.id)}><Check size={16} className="text-green-600"/></Button>
                          }
                          <Button size="sm" variant="secondary" onClick={() => handleReject(request.id)}><X size={16} className="text-red-600"/></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {visibleRequests.length === 0 && (
            <div className="text-center py-10 text-slate-500">
                <p>No leave requests match the current filters.</p>
            </div>
           )}
        </div>
      </Card>
    </PageWrapper>
  );
};

export default LeavePage;
