import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const AttendanceDashboardPage: React.FC = () => {
  const { employees, attendance } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const todayStats = {
      present: attendance.filter(r => r.date === today && r.status === 'Present').length,
      absent: attendance.filter(r => r.date === today && r.status === 'Absent').length,
      onLeave: attendance.filter(r => r.date === today && r.status === 'On Leave').length,
      total: employees.length
  };

  return (
    <PageWrapper title="Attendance Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-500 text-sm">Total Employees</p>
                    <p className="text-2xl font-bold text-slate-800">{todayStats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                    <Users size={24} />
                </div>
            </div>
        </Card>
        <Card className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-500 text-sm">Present Today</p>
                    <p className="text-2xl font-bold text-slate-800">{todayStats.present}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                    <CheckCircle size={24} />
                </div>
            </div>
        </Card>
        <Card className="border-l-4 border-red-500">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-500 text-sm">Absent Today</p>
                    <p className="text-2xl font-bold text-slate-800">{todayStats.absent}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full text-red-600">
                    <AlertTriangle size={24} />
                </div>
            </div>
        </Card>
        <Card className="border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-500 text-sm">On Leave</p>
                    <p className="text-2xl font-bold text-slate-800">{todayStats.onLeave}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                    <Clock size={24} />
                </div>
            </div>
        </Card>
      </div>

      <Card title="Recent Activity">
          <div className="text-center py-10 text-slate-500">
              <p>Real-time punch logs will appear here.</p>
          </div>
      </Card>
    </PageWrapper>
  );
};

export default AttendanceDashboardPage;