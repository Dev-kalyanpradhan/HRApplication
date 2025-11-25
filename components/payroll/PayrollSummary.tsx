
import React, { useMemo } from 'react';
import Card from '../ui/Card';
import { PayrollRecord, Employee } from '../../types';

interface PayrollSummaryProps {
    payrollData: PayrollRecord[];
    employees: Employee[];
}

const PayrollSummary: React.FC<PayrollSummaryProps> = ({ payrollData, employees }) => {
    const summary = useMemo(() => {
        const totalCost = payrollData.reduce((acc, p) => acc + p.grossEarnings, 0);
        const totalDeductions = payrollData.reduce((acc, p) => acc + p.totalDeductions, 0);
        const netPay = totalCost - totalDeductions;
        return { totalCost, totalDeductions, netPay, employeesPaid: payrollData.length };
    }, [payrollData]);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const period = payrollData.length > 0 ? `${monthNames[payrollData[0].month - 1]} ${payrollData[0].year}` : 'N/A';

    return (
        <div>
            <h4 className="text-md font-semibold text-slate-600 mb-4">Summary for Last Payroll Run ({period})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="!p-4 bg-blue-50 border-blue-200 border">
                    <p className="text-slate-500 text-sm">Total Payroll Cost</p>
                    <p className="text-xl font-bold mt-1 text-blue-800">₹{summary.totalCost.toLocaleString('en-IN')}</p>
                </Card>
                <Card className="!p-4 bg-green-50 border-green-200 border">
                    <p className="text-slate-500 text-sm">Total Net Pay</p>
                    <p className="text-xl font-bold mt-1 text-green-800">₹{summary.netPay.toLocaleString('en-IN')}</p>
                </Card>
                <Card className="!p-4 bg-red-50 border-red-200 border">
                    <p className="text-slate-500 text-sm">Total Deductions</p>
                    <p className="text-xl font-bold mt-1 text-red-800">₹{summary.totalDeductions.toLocaleString('en-IN')}</p>
                </Card>
                <Card className="!p-4 bg-slate-50 border-slate-200 border">
                    <p className="text-slate-500 text-sm">Employees Paid</p>
                    <p className="text-xl font-bold mt-1 text-slate-800">{summary.employeesPaid} / {employees.length}</p>
                </Card>
            </div>
        </div>
    );
}

export default PayrollSummary;
