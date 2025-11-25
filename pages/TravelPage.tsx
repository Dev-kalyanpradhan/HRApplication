
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plane, Check, X } from 'lucide-react';
import { TravelRequest, TravelStatus, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getSubordinateIds } from '../utils/hierarchyUtils';

const TravelPage: React.FC = () => {
    const { currentUser, userRole, employees, travelRequests, updateTravelRequestStatus } = useAuth();
    const navigate = useNavigate();

    const subordinateIds = useMemo(() => {
        if (userRole === UserRole.MANAGER && currentUser) {
            return getSubordinateIds(currentUser.id, employees);
        }
        return [];
    }, [currentUser, userRole, employees]);

    const visibleRequests = useMemo(() => {
        if (!currentUser) return [];
        switch (userRole) {
            case UserRole.ADMIN:
                return travelRequests;
            case UserRole.MANAGER:
                const teamIds = [currentUser.id, ...subordinateIds];
                return travelRequests.filter(req => teamIds.includes(req.employeeId));
            case UserRole.EMPLOYEE:
                return travelRequests.filter(req => req.employeeId === currentUser.id);
            default:
                return [];
        }
    }, [currentUser, userRole, travelRequests, subordinateIds]);

    const getStatusChip = (status: TravelStatus) => {
        const colors: Record<TravelStatus, string> = {
            [TravelStatus.APPROVED]: 'bg-green-100 text-green-800',
            [TravelStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
            [TravelStatus.REJECTED]: 'bg-red-100 text-red-800',
            [TravelStatus.BOOKED]: 'bg-blue-100 text-blue-800',
        };
        return colors[status];
    };

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
            <Card title="My Travel Requests">
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
                                    <td className="p-4 text-slate-700">{`${new Date(request.startDate).toLocaleDateString('en-IN')} - ${new Date(request.endDate).toLocaleDateString('en-IN')}`}</td>
                                    <td className="p-4 text-slate-700">{new Date(request.submissionDate).toLocaleDateString('en-IN')}</td>
                                    <td className="p-4 text-slate-700 font-mono">₹{request.estimatedCost.toLocaleString('en-IN')}</td>
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
                            <p>No travel requests to display.</p>
                        </div>
                    )}
                </div>
            </Card>
        </PageWrapper>
    );
};

export default TravelPage;
