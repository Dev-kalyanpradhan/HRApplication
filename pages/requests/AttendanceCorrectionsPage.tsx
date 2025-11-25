import React, { useMemo, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { AttendanceCorrectionStatus, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { Check, X, Clock, Search, Download } from 'lucide-react';
import { getSubordinateIds } from '../../utils/hierarchyUtils';
import { downloadCsv } from '../../utils/csvUtils';

const AttendanceCorrectionsPage: React.FC = () => {
    const { currentUser, userRole, employees, attendanceCorrectionRequests, punchRecords, updateAttendanceCorrectionRequestStatus } = useAuth();
    const [filterStatus, setFilterStatus] = useState<AttendanceCorrectionStatus | 'all'>(AttendanceCorrectionStatus.PENDING);
    const [searchTerm, setSearchTerm] = useState('');

    const formatTime = (isoString: string | null): string | null => {
        if (!isoString) return null;
        return new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    const filteredRequests = useMemo(() => {
        if (!currentUser) return [];
        let requests = attendanceCorrectionRequests;

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
                req.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return requests.map(req => {
            const originalPunch = punchRecords.find(p => p.employeeId === req.employeeId && p.date === req.date);
            return {
                ...req,
                originalPunchIn: formatTime(originalPunch?.punchIn || null),
                originalPunchOut: formatTime(originalPunch?.punchOut || null),
            };
        }).sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
    }, [attendanceCorrectionRequests, currentUser, userRole, employees, punchRecords, filterStatus, searchTerm]);


    const myRequests = useMemo(() => {
        if (!currentUser) return [];
        return attendanceCorrectionRequests
            .filter(req => req.employeeId === currentUser.id)
            .map(req => {
                const originalPunch = punchRecords.find(p => p.employeeId === req.employeeId && p.date === req.date);
                return {
                    ...req,
                    originalPunchIn: formatTime(originalPunch?.punchIn || null),
                    originalPunchOut: formatTime(originalPunch?.punchOut || null),
                };
            })
            .sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
    }, [attendanceCorrectionRequests, currentUser, punchRecords]);
    
    const handleDownload = () => {
        const headers = ['Request ID', 'Employee Name', 'Employee ID', 'Date', 'Original In', 'Requested In', 'Original Out', 'Requested Out', 'Reason', 'Status', 'Submission Date'];
        const rows = filteredRequests.map(req => [
            req.id,
            req.employeeName,
            req.employeeId,
            req.date,
            req.originalPunchIn || '',
            req.requestedPunchIn || '',
            req.originalPunchOut || '',
            req.requestedPunchOut || '',
            req.reason,
            req.status,
            req.submissionDate
        ]);
        downloadCsv(`attendance_corrections_${filterStatus.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    };

    const statusFilters: (AttendanceCorrectionStatus | 'all')[] = [AttendanceCorrectionStatus.PENDING, AttendanceCorrectionStatus.APPROVED, AttendanceCorrectionStatus.REJECTED, 'all'];

    return (
        <PageWrapper title="Attendance Correction Requests" actions={
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
                                <th className="p-4 font-semibold text-center">Recorded In</th>
                                <th className="p-4 font-semibold text-center">Requested In</th>
                                <th className="p-4 font-semibold text-center">Recorded Out</th>
                                <th className="p-4 font-semibold text-center">Requested Out</th>
                                <th className="p-4 font-semibold">Reason</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(req => (
                                <tr key={req.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={req.employeeName} size="md" />
                                            <div>
                                                <p className="font-semibold text-slate-800">{req.employeeName}</p>
                                                <p className="text-xs text-slate-500 font-mono">{req.employeeId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-700">{new Date(req.date + 'T00:00:00Z').toLocaleDateString('en-IN')}</td>
                                    <td className="p-4 font-mono text-sm text-center text-slate-500">{req.originalPunchIn || '--:--'}</td>
                                    <td className="p-4 font-mono text-sm text-center font-semibold text-blue-700">
                                        {req.requestedPunchIn || <span className="font-normal text-slate-400 italic text-xs">No Change</span>}
                                    </td>
                                    <td className="p-4 font-mono text-sm text-center text-slate-500">{req.originalPunchOut || '--:--'}</td>
                                    <td className="p-4 font-mono text-sm text-center font-semibold text-blue-700">
                                        {req.requestedPunchOut || <span className="font-normal text-slate-400 italic text-xs">No Change</span>}
                                    </td>
                                    <td className="p-4 text-slate-600 text-sm max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                    <td className="p-4 text-center">
                                       {req.status === AttendanceCorrectionStatus.PENDING && (
                                            <div className="flex items-center justify-center gap-2">
                                                <Button size="sm" variant="secondary" onClick={() => updateAttendanceCorrectionRequestStatus(req.id, AttendanceCorrectionStatus.APPROVED)}>
                                                    <Check size={16} className="text-green-600"/>
                                                </Button>
                                                <Button size="sm" variant="secondary" onClick={() => updateAttendanceCorrectionRequestStatus(req.id, AttendanceCorrectionStatus.REJECTED)}>
                                                    <X size={16} className="text-red-600"/>
                                                </Button>
                                            </div>
                                       )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRequests.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <Clock size={24} className="mx-auto mb-2 text-slate-400"/>
                            <p>No correction requests match the current filters.</p>
                        </div>
                    )}
                </div>
            </Card>

            <div className="mt-6">
                 <Card title="My Request History">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-sm">
                                <tr>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold text-center">Recorded In</th>
                                    <th className="p-4 font-semibold text-center">Requested In</th>
                                    <th className="p-4 font-semibold text-center">Recorded Out</th>
                                    <th className="p-4 font-semibold text-center">Requested Out</th>
                                    <th className="p-4 font-semibold">Reason</th>
                                    <th className="p-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                             <tbody>
                                {myRequests.map(req => {
                                    const statusColor = {
                                        [AttendanceCorrectionStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
                                        [AttendanceCorrectionStatus.APPROVED]: 'bg-green-100 text-green-800',
                                        [AttendanceCorrectionStatus.REJECTED]: 'bg-red-100 text-red-800',
                                    }[req.status];
                                    return (
                                     <tr key={req.id} className="border-b border-slate-200">
                                        <td className="p-4 text-slate-700">{new Date(req.date + 'T00:00:00Z').toLocaleDateString('en-IN')}</td>
                                        <td className="p-4 font-mono text-sm text-center text-slate-500">{req.originalPunchIn || '--:--'}</td>
                                        <td className="p-4 font-mono text-sm text-center font-semibold text-slate-700">
                                            {req.requestedPunchIn || <span className="font-normal text-slate-400 italic text-xs">No Change</span>}
                                        </td>
                                        <td className="p-4 font-mono text-sm text-center text-slate-500">{req.originalPunchOut || '--:--'}</td>
                                        <td className="p-4 font-mono text-sm text-center font-semibold text-slate-700">
                                            {req.requestedPunchOut || <span className="font-normal text-slate-400 italic text-xs">No Change</span>}
                                        </td>
                                        <td className="p-4 text-slate-600 text-sm">{req.reason}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                        {myRequests.length === 0 && (
                            <div className="text-center py-10 text-slate-500">
                                <p>You have not submitted any correction requests.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </PageWrapper>
    );
};

export default AttendanceCorrectionsPage;