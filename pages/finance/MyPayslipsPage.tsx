import React, { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { PayrollRecord } from '../../types';
import PayslipModal from '../../components/payroll/PayslipModal';
import { useAuth } from '../../contexts/AuthContext';

const MyPayslipsPage: React.FC = () => {
  const { currentUser, employees, payrollHistory } = useAuth();
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedPayrollRecord, setSelectedPayrollRecord] = useState<PayrollRecord | null>(null);

  const filteredPayroll = useMemo(() => {
    if (!currentUser) return [];
    return payrollHistory.filter(p => 
        p.employeeId === currentUser.id &&
        p.year === selectedYear && 
        p.month === selectedMonth
    );
  }, [selectedYear, selectedMonth, currentUser, payrollHistory]);


  const handleViewPayslip = (payrollRecord: PayrollRecord) => {
    setSelectedPayrollRecord(payrollRecord);
    setIsPayslipModalOpen(true);
  };
  
  const selectedEmployee = useMemo(() => {
      if (!selectedPayrollRecord || !currentUser) return null;
      // In this page, the employee viewing the payslip is always the current user.
      return currentUser;
  }, [selectedPayrollRecord, currentUser]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const availableYears = useMemo(() => {
      if (!currentUser) return [];
      const userPayrollYears = payrollHistory
          .filter(p => p.employeeId === currentUser.id)
          .map(p => p.year);
      return [...new Set(userPayrollYears)].sort((a,b) => b-a);
  }, [currentUser, payrollHistory]);


  return (
    <PageWrapper
      title="My Payslips"
    >
      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h3 className="text-lg font-semibold">Displaying records for {monthNames[selectedMonth-1]} {selectedYear}</h3>
            <div className="flex gap-2">
                <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="bg-white border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    {monthNames.map((name, index) => <option key={name} value={index+1}>{name}</option>)}
                </select>
                <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-white border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-semibold">Pay Period</th>
                <th className="p-4 font-semibold text-right">Gross Earnings</th>
                <th className="p-4 font-semibold text-right">Deductions</th>
                <th className="p-4 font-semibold text-right">Net Salary</th>
                <th className="p-4 font-semibold text-center">Payslip</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayroll.map(record => {
                return (
                    <tr key={record.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-800">{monthNames[record.month-1]} {record.year}</td>
                        <td className="p-4 text-slate-700 text-right font-mono">₹{new Intl.NumberFormat('en-IN').format(record.grossEarnings)}</td>
                        <td className="p-4 text-red-600 text-right font-mono">₹{new Intl.NumberFormat('en-IN').format(record.totalDeductions)}</td>
                        <td className="p-4 text-green-600 font-bold text-right font-mono">₹{new Intl.NumberFormat('en-IN').format(record.netSalary)}</td>
                        <td className="p-4 text-center">
                            <Button size="sm" variant="ghost" onClick={() => handleViewPayslip(record)}>View Payslip</Button>
                        </td>
                    </tr>
                );
              })}
               {filteredPayroll.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500">
                        No payslip data found for this period.
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

export default MyPayslipsPage;