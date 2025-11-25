
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Check, X, Send } from 'lucide-react';
import { LeaveRequest, LeaveStatus, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

const LeavePage: React.FC = () => {
  const { currentUser, userRole, employees, leaveRequests, updateLeaveRequestStatus } = useAuth();
  const navigate = useNavigate();

  const visibleRequests = useMemo(() => {
    if (!currentUser) return [];
    
    if (userRole === UserRole.ADMIN) {
        // Admins see all requests
        return leaveRequests;
    }

    if (userRole === UserRole.EMPLOYEE) {
        // Employees see only their own requests
        return leaveRequests.filter(req => req.employeeId === currentUser.id);
    }
    
    if (userRole === UserRole.MANAGER) {
      // Managers see requests for which they are either the reporting or functional manager
      return leaveRequests.filter(req => {
        const requestEmployee = employees.find(e => e.id === req.employeeId);
        return requestEmployee && (requestEmployee.reportingManagerId === currentUser.id || requestEmployee.functionalManagerId === currentUser.id);
      });
    }

    return [];
  }, [currentUser, userRole, leaveRequests, employees]);

  const handleReportingManagerApprove = (id: string) => {
    updateLeaveRequestStatus(id, LeaveStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL);
  }

  const handleFunctionalManagerApprove = (id: string) => {
    updateLeaveRequestStatus(id, LeaveStatus.APPROVED);
  }

  const handleReject = (id: string) => {
    updateLeaveRequestStatus(id, LeaveStatus.REJECTED);
  };

  const getStatusChip = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL:
        return 'bg-yellow-100 text-yellow-800';
      case LeaveStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL:
        return 'bg-blue-100 text-blue-800';
      case LeaveStatus.REJECTED:
        return 'bg-red-100 text-red-800';
    }
  };
  
  const leaveBalances = currentUser?.leaveBalance || { casual: 0, sick: 0, earned: 0 };

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
      
      <Card title="Leave Requests History">
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
                    <td className="p-4 text-slate-700">{`${new Date(request.startDate).toLocaleDateString('en-IN')} - ${new Date(request.endDate).toLocaleDateString('en-IN')}`}</td>
                    <td className="p-4 text-slate-700">{new Date(request.submissionDate).toLocaleDateString('en-IN')}</td>
                    <td className="p-4 text-slate-700 max-w-xs truncate">{request.reason}</td>
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
                <p>No leave requests to display.</p>
            </div>
           )}
        </div>
      </Card>
    </PageWrapper>
  );
};

export default LeavePage;
