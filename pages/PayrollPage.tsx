
import React, { useState, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { IndianRupee, Edit, Send } from 'lucide-react';
import { PayrollRecord } from '../types';
import Avatar from '../components/ui/Avatar';
import PayslipModal from '../components/payroll/PayslipModal';
import { useAuth } from '../contexts/AuthContext';
import PayrollSummary from '../components/payroll/PayrollSummary';

const PayrollPage: React.FC = () => {
  const { employees, payrollHistory } = useAuth();
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedPayrollRecord, setSelectedPayrollRecord] = useState<PayrollRecord | null>(null);

  const filteredPayroll = useMemo(() => {
    return payrollHistory.filter(p => p.year === selectedYear && p.month === selectedMonth);
  }, [selectedYear, selectedMonth, payrollHistory]);

  const handleViewPayslip = (payrollRecord: PayrollRecord) => {
    setSelectedPayrollRecord(payrollRecord);
    setIsPayslipModalOpen(true);
  };
  
  const selectedEmployee = useMemo(() => {
      if (!selectedPayrollRecord) return null;
      return employees.find(e => e.id === selectedPayrollRecord.employeeId) || null;
  }, [selectedPayrollRecord, employees]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const lastPayrollRun = useMemo(() => {
        const sorted = [...payrollHistory].sort((a,b) => new Date(b.year, b.month -1).getTime() - new Date(a.year, a.month - 1).getTime());
        if (sorted.length === 0) return [];
        const lastRunYear = sorted[0].year;
        const lastRunMonth = sorted[0].month;
        return payrollHistory.filter(p => p.year === lastRunYear && p.month === lastRunMonth);
    }, [payrollHistory]);

  return (
    <PageWrapper title="Payroll Management">
         <Card className="mb-6">
            <PayrollSummary payrollData={lastPayrollRun} employees={employees}/>
         </Card>

      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h3 className="text-lg font-semibold">Payroll History for {monthNames[selectedMonth-1]} {selectedYear}</h3>
            <div className="flex gap-2">
                <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="bg-white border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    {monthNames.map((name, index) => <option key={name} value={index+1}>{name}</option>)}
                </select>
                <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-white border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    {[...new Set(payrollHistory.map(p => p.year))].sort((a,b) => b-a).map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold text-right">Gross Earnings</th>
                <th className="p-4 font-semibold text-right">Deductions</th>
                <th className="p-4 font-semibold text-right">Net Salary</th>
                <th className="p-4 font-semibold text-center">Payslip</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayroll.map(record => {
                const employee = employees.find(e => e.id === record.employeeId);
                if (!employee) return null;
                return (
                    <tr key={record.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <Avatar name={employee.name} size="md" />
                                <div>
                                    <p className="font-semibold text-slate-800">{employee.name}</p>
                                    <p className="text-sm text-slate-500">{employee.role}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-4 text-slate-700 text-right font-mono">₹{record.grossEarnings.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-red-600 text-right font-mono">₹{record.totalDeductions.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-green-600 font-bold text-right font-mono">₹{record.netSalary.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-center">
                            <Button size="sm" variant="ghost" onClick={() => handleViewPayslip(record)}>View Payslip</Button>
                        </td>
                    </tr>
                );
              })}
               {filteredPayroll.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500">
                        No payroll data found for this period.
                    </td>
                </tr>
               )}
            </tbody>
          </table>
        </div>
      </Card>
      {selectedPayrollRecord && selectedEmployee && (
        <PayslipModal
            isOpen={isPayslipModalOpen}
            onClose={() => setIsPayslipModalOpen(false)}
            payrollRecord={selectedPayrollRecord}
            employee={selectedEmployee}
        />
      )}
    </PageWrapper>
  );
};

export default PayrollPage;
