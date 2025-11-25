import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, LogIn, LogOut, History } from 'lucide-react';

const MyAttendancePage: React.FC = () => {
    const { currentUser, punchRecords, addPunch } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    const todayRecord = useMemo(() => {
        if (!currentUser) return null;
        return punchRecords.find(r => r.employeeId === currentUser.id && r.date === todayStr);
    }, [punchRecords, currentUser, todayStr]);

    const punchHistory = useMemo(() => {
        if (!currentUser) return [];
        return punchRecords
            .filter(r => r.employeeId === currentUser.id && r.date !== todayStr)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [punchRecords, currentUser, todayStr]);

    const hasPunchedIn = !!todayRecord?.punchIn;
    const hasPunchedOut = !!todayRecord?.punchOut;

    const handlePunchIn = () => {
        addPunch('in');
    };

    const handlePunchOut = () => {
        addPunch('out');
    };
    
    const formatPunchTime = (isoString: string | null) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const calculateDuration = (punchIn: string | null, punchOut: string | null): string => {
        if (!punchIn || !punchOut) return '-';
        const inTime = new Date(punchIn).getTime();
        const outTime = new Date(punchOut).getTime();
        const diffMs = outTime - inTime;
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    };

    return (
        <PageWrapper title="My Attendance">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card>
                        <div className="text-center">
                            <h3 className="font-semibold text-slate-700">{currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                            <div className="my-4 text-5xl font-bold font-mono text-slate-800 bg-slate-100 p-4 rounded-lg">
                                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center my-6">
                                <div>
                                    <p className="text-sm text-slate-500">Punch In</p>
                                    <p className={`text-2xl font-semibold ${hasPunchedIn ? 'text-green-600' : 'text-slate-400'}`}>
                                        {formatPunchTime(todayRecord?.punchIn || null)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Punch Out</p>
                                    <p className={`text-2xl font-semibold ${hasPunchedOut ? 'text-red-600' : 'text-slate-400'}`}>
                                        {formatPunchTime(todayRecord?.punchOut || null)}
                                    </p>
                                </div>
                            </div>
                            
                            {!hasPunchedIn && (
                                <Button size="lg" className="w-full" onClick={handlePunchIn} leftIcon={<LogIn size={20} />}>
                                    Punch In
                                </Button>
                            )}

                            {hasPunchedIn && !hasPunchedOut && (
                                <Button size="lg" variant="danger" className="w-full" onClick={handlePunchOut} leftIcon={<LogOut size={20} />}>
                                    Punch Out
                                </Button>
                            )}

                            {hasPunchedIn && hasPunchedOut && (
                                <div className="p-3 text-center bg-green-50 text-green-800 rounded-lg font-semibold">
                                    Attendance for today is complete!
                                </div>
                            )}

                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card title="Punch History" actions={<History size={20} className="text-slate-400" />}>
                        <div className="overflow-x-auto max-h-[60vh]">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-sm sticky top-0">
                                    <tr>
                                        <th className="p-3 font-semibold">Date</th>
                                        <th className="p-3 font-semibold text-center">Punch In</th>
                                        <th className="p-3 font-semibold text-center">Punch Out</th>
                                        <th className="p-3 font-semibold text-center">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {punchHistory.map(record => (
                                        <tr key={record.id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-800">
                                                {new Date(record.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </td>
                                            <td className="p-3 text-center text-green-700 font-mono">{formatPunchTime(record.punchIn)}</td>
                                            <td className="p-3 text-center text-red-700 font-mono">{formatPunchTime(record.punchOut)}</td>
                                            <td className="p-3 text-center font-semibold text-slate-700">{calculateDuration(record.punchIn, record.punchOut)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {punchHistory.length === 0 && (
                                <div className="text-center py-10 text-slate-500">
                                    <p>No previous punch records found.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </PageWrapper>
    );
};

export default MyAttendancePage;