import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Calendar } from 'lucide-react';

const MyAttendancePage: React.FC = () => {
  const { currentUser, addPunch, punchRecords } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  
  const todayPunch = punchRecords.find(r => r.employeeId === currentUser?.id && r.date === today);

  return (
    <PageWrapper title="My Attendance">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Mark Attendance">
            <div className="flex flex-col items-center justify-center py-6 gap-6">
                <div className="text-center">
                    <p className="text-slate-500 mb-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <h2 className="text-4xl font-bold text-slate-800">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</h2>
                </div>
                
                <div className="flex gap-4">
                    <Button 
                        size="lg" 
                        onClick={() => addPunch('in')} 
                        disabled={!!todayPunch?.punchIn}
                        className={todayPunch?.punchIn ? "opacity-50 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
                    >
                        <Clock className="mr-2" size={20} />
                        Punch In
                    </Button>
                    <Button 
                        size="lg" 
                        variant="danger"
                        onClick={() => addPunch('out')}
                        disabled={!todayPunch?.punchIn || !!todayPunch?.punchOut}
                        className={(!todayPunch?.punchIn || !!todayPunch?.punchOut) ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        <Clock className="mr-2" size={20} />
                        Punch Out
                    </Button>
                </div>

                <div className="w-full bg-slate-50 p-4 rounded-lg mt-4">
                    <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2 mb-2">
                        <span className="text-slate-500">Check In</span>
                        <span className="font-mono font-semibold">{todayPunch?.punchIn ? new Date(todayPunch.punchIn).toLocaleTimeString() : '--:--'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Check Out</span>
                        <span className="font-mono font-semibold">{todayPunch?.punchOut ? new Date(todayPunch.punchOut).toLocaleTimeString() : '--:--'}</span>
                    </div>
                </div>
            </div>
        </Card>

        <Card title="Attendance History">
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {punchRecords.filter(r => r.employeeId === currentUser?.id).map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded text-blue-600">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">{new Date(record.date).toLocaleDateString()}</p>
                                <p className="text-xs text-slate-500">Regular Shift</p>
                            </div>
                        </div>
                        <div className="text-right text-sm">
                            <p className="text-green-600 font-mono">{record.punchIn ? new Date(record.punchIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</p>
                            <p className="text-red-600 font-mono">{record.punchOut ? new Date(record.punchOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</p>
                        </div>
                    </div>
                ))}
                {punchRecords.filter(r => r.employeeId === currentUser?.id).length === 0 && (
                    <p className="text-center text-slate-500 py-4">No records found.</p>
                )}
            </div>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default MyAttendancePage;