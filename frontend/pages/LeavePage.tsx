import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { LeaveStatus, UserRole } from '../types';
import { Check, X, Clock, Calendar } from 'lucide-react';
import { getLeaveDurationInDays } from '../utils/dateUtils';

const LeavePage: React.FC = () => {
  const { leaveRequests, updateLeaveRequestStatus, userRole, currentUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'pending' | 'history'>('pending');

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case LeaveStatus.REJECTED:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  const filteredRequests = leaveRequests.filter(req => {
      // Role based filtering
      if (userRole === UserRole.EMPLOYEE) {
          if (req.employeeId !== currentUser?.id) return false;
      }
      
      // Status filtering
      if (filter === 'pending') {
          return req.status.startsWith('Pending');
      }
      if (filter === 'history') {
          return !req.status.startsWith('Pending');
      }
      return true;
  });

  const canApprove = (reqEmployeeId: string) => {
      if (userRole === UserRole.ADMIN) return true;
      if (userRole === UserRole.MANAGER && currentUser?.id !== reqEmployeeId) return true;
      return false;
  };

  return (
    <PageWrapper title="Leave Requests">
       <div className="flex gap-2 mb-6">
            <Button 
                variant={filter === 'pending' ? 'primary' : 'secondary'} 
                onClick={() => setFilter('pending')}
                size="sm"
            >
                Pending
            </Button>
            <Button 
                variant={filter === 'history' ? 'primary' : 'secondary'} 
                onClick={() => setFilter('history')}
                size="sm"
            >
                History
            </Button>
            <Button 
                variant={filter === 'all' ? 'primary' : 'secondary'} 
                onClick={() => setFilter('all')}
                size="sm"
            >
                All
            </Button>
       </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
            <Card>
                <div className="text-center py-8 text-slate-500">
                    No requests found.
                </div>
            </Card>
        ) : (
            filteredRequests.map(request => (
            <Card key={request.id} className="transition-shadow hover:shadow-lg">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Avatar name={request.employeeName} />
                    <div>
                        <h3 className="font-semibold text-slate-800">{request.employeeName}</h3>
                        <p className="text-sm text-slate-500 mb-2">{request.leaveType}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>{request.startDate} to {request.endDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={16} />
                                <span>{getLeaveDurationInDays(request.startDate, request.endDate)} Days</span>
                            </div>
                        </div>
                        {request.reason && (
                            <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                                "{request.reason}"
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(request.status)}
                    
                    {request.status.startsWith('Pending') && canApprove(request.employeeId) && (
                        <div className="flex gap-2 mt-2">
                            <Button 
                                size="sm" 
                                variant="danger" 
                                onClick={() => updateLeaveRequestStatus(request.id, LeaveStatus.REJECTED)}
                                leftIcon={<X size={14}/>}
                            >
                                Reject
                            </Button>
                            <Button 
                                size="sm" 
                                onClick={() => updateLeaveRequestStatus(request.id, LeaveStatus.APPROVED)}
                                className="bg-green-600 hover:bg-green-700"
                                leftIcon={<Check size={14}/>}
                            >
                                Approve
                            </Button>
                        </div>
                    )}
                     <div className="text-xs text-slate-400 mt-auto">
                        Applied on {request.submissionDate}
                    </div>
                </div>
                </div>
            </Card>
            ))
        )}
      </div>
    </PageWrapper>
  );
};

export default LeavePage;