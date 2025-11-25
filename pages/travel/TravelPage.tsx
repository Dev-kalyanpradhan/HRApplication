import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plane, Check, X, Search, Download } from 'lucide-react';
import { TravelRequest, TravelStatus, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getSubordinateIds } from '../../utils/hierarchyUtils';
import { downloadCsv } from '../../utils/csvUtils';

const TravelPage: React.FC = () => {
    const { currentUser, userRole, employees, travelRequests, updateTravelRequestStatus } = useAuth();
    const navigate = useNavigate();

    const [filterStatus, setFilterStatus] = useState<TravelStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const subordinateIds = useMemo(() => {
        if (userRole === UserRole.MANAGER && currentUser) {
            return getSubordinateIds(currentUser.id, employees);
        }
        return [];
    }, [currentUser, userRole, employees]);

    const visibleRequests = useMemo(() => {
        if (!currentUser) return [];
        let filteredRequests = travelRequests;

        switch (userRole) {
            case UserRole.MANAGER:
                const teamIds = [currentUser.id, ...subordinateIds];
                filteredRequests = travelRequests.filter(req => teamIds.includes(req.employeeId));
                break;
            case UserRole.EMPLOYEE:
                filteredRequests = travelRequests.filter(req => req.employeeId === currentUser.id);
                break;
        }
        // Admin sees all

        if (filterStatus !== 'all') {
            filteredRequests = filteredRequests.filter(req => req.status === filterStatus);
        }

        if (searchTerm.trim() && userRole !== UserRole.EMPLOYEE) {
            filteredRequests = filteredRequests.filter(req =>
                req.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return filteredRequests.sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());

    }, [currentUser, userRole, travelRequests, subordinateIds, filterStatus, searchTerm]);
    
    const handleDownload = () => {
        const headers = ['Request ID', 'Employee Name', 'Employee ID', 'Destination', 'Purpose', 'Start Date', 'End Date', 'Estimated Cost', 'Status', 'Submission Date'];
        const rows = visibleRequests.map(req => [
            req.id,
            req.employeeName,
            req.employeeId,
            req.destination,
            req.purpose,
            req.startDate,
            req.endDate,
            req.estimatedCost,
            req.status,
            req.submissionDate
        ]);
        downloadCsv(`travel_requests_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    };

    const getStatusChip = (status: TravelStatus) => {
        const colors: Record<TravelStatus, string> = {
            [TravelStatus.APPROVED]: 'bg-green-100 text-green-800',
            [TravelStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
            [TravelStatus.REJECTED]: 'bg-red-100 text-red-800',
            [TravelStatus.BOOKED]: 'bg-blue-100 text-blue-800',
        };
        return colors[status];
    };
    
    const statusFilters: (TravelStatus | 'all')[] = ['all', TravelStatus.PENDING, TravelStatus.APPROVED, TravelStatus.BOOKED, TravelStatus.REJECTED];

    return (
        <PageWrapper
            title="Travel Requests"
            actions={
                (userRole === UserRole.EMPLOYEE || userRole === UserRole.MANAGER || userRole === UserRole.ADMIN) && (
                    <Button onClick={() => navigate('/travel/apply')} leftIcon={<Plane size={18} />}>
                        Apply for Travel
                    </Button>
                )
            }
        >
            <Card title="Travel Requests History" actions={
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
                                {status}
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
                                <th className="p-4 font-semibold">Destination</th>
                                <th className="p-4 font-semibold">Dates</th>
                                <th className="p-4 font-semibold">Submitted On</th>
                                <th className="p-4 font-semibold">Cost</th>
                                <th className="p-4 font-semibold">Status</th>
                                {(userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && (
                                    <th className="p-4 font-semibold text-center">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRequests.map(request => (
                                <tr key={request.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-800">{request.employeeName}</td>
                                    <td className="p-4 text-slate-700">{request.destination}</td>
                                    <td className="p-4 text-slate-700">{`${new Date(request.startDate + 'T00:00:00').toLocaleDateString('en-IN')} - ${new Date(request.endDate + 'T00:00:00').toLocaleDateString('en-IN')}`}</td>
                                    <td className="p-4 text-slate-700">{new Date(request.submissionDate + 'T00:00:00').toLocaleDateString('en-IN')}</td>
                                    <td className="p-4 text-slate-700 font-mono">₹{new Intl.NumberFormat('en-IN').format(request.estimatedCost)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                     {(userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && (
                                        <td className="p-4 text-center">
                                            {request.status === TravelStatus.PENDING && (
                                                <div className="flex gap-2 justify-center">
                                                    <Button size="sm" variant="secondary" onClick={() => updateTravelRequestStatus(request.id, TravelStatus.APPROVED)}><Check size={16} className="text-green-600"/></Button>
                                                    <Button size="sm" variant="secondary" onClick={() => updateTravelRequestStatus(request.id, TravelStatus.REJECTED)}><X size={16} className="text-red-600"/></Button>
                                                </div>
                                            )}
                                        </td>
                                     )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {visibleRequests.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <p>No travel requests match the current filters.</p>
                        </div>
                    )}
                </div>
            </Card>
        </PageWrapper>
    );
};

export default TravelPage;
