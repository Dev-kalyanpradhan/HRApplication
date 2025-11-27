import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Download } from 'lucide-react';

const RunPayrollPage: React.FC = () => {
  const { employees } = useAuth();
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  return (
    <PageWrapper title="Run Payroll">
      <Card className="mb-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-slate-800">{currentMonth} {currentYear}</h2>
                <p className="text-slate-500">Payroll Cycle: 1st - 30th</p>
            </div>
            <div className="flex gap-3">
                <Button variant="secondary" leftIcon={<Download size={16}/>}>Export Data</Button>
                <Button leftIcon={<Send size={16}/>}>Process Payroll</Button>
            </div>
        </div>
      </Card>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Employee</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">CTC</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Paid Days</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Deductions</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Net Pay</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <Avatar name={emp.name} size="sm" />
                                <div>
                                    <p className="font-medium text-slate-900">{emp.name}</p>
                                    <p className="text-xs text-slate-500">{emp.role}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono">₹{(emp.ctc || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">30</td>
                        <td className="px-6 py-4 text-sm text-red-600 font-mono">- ₹2,500</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800 font-mono">
                            ₹{Math.round(((emp.ctc || 0) / 12) - 2500).toLocaleString()}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </PageWrapper>
  );
};

export default RunPayrollPage;