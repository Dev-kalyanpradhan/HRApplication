
import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { PayrollRecord } from '../../types';
import { calculateProRataPayrollForEmployee } from '../../utils/payrollUtils';
import { Loader, AlertTriangle, ChevronDown, ChevronRight, Download } from 'lucide-react';
import Avatar from '../ui/Avatar';

interface PostSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostSalary: (newRecords: PayrollRecord[], year: number, month: number) => void;
}

const PostSalaryModal: React.FC<PostSalaryModalProps> = ({ isOpen, onClose, onPostSalary }) => {
    const { employees, attendance, payrollHistory, leaveRequests, salaryComponents, declarations, loans, variablePayments } = useAuth();

    const today = new Date();
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [previewData, setPreviewData] = useState<PayrollRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'config' | 'preview'>('config');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const monthNames = useMemo(() => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], []);

    const isAlreadyPosted = useMemo(() => {
        return payrollHistory.some(p => p.year === selectedYear && p.month === selectedMonth);
    }, [selectedYear, selectedMonth, payrollHistory]);

    const handlePreview = () => {
        setIsLoading(true);
        setTimeout(() => {
            const calculatedPayroll = employees.map(emp => 
                calculateProRataPayrollForEmployee(emp, selectedYear, selectedMonth, attendance, leaveRequests, declarations, loans, variablePayments, salaryComponents)
            );
            setPreviewData(calculatedPayroll);
            setStep('preview');
            setIsLoading(false);
        }, 500);
    };

    const handlePost = () => {
        onPostSalary(previewData, selectedYear, selectedMonth);
        handleClose();
    };
    
    const handleDownloadCsv = () => {
        const headers = [
            'Employee ID', 'Employee Name', 'Paid Days', 'Total Days', 'Gross Pay', 'Deductions', 'Net Pay',
            'Present', 'Absent', 'On Leave', 'Holiday/Weekoff',
            'Basic', 'HRA', 'Special Allowance', 'Provident Fund', 'Professional Tax', 'Income Tax (TDS)',
            'Loan Deduction', ...Object.keys(previewData[0]?.variablePayments || {})
        ];

        const rows = previewData.map(record => {
            const emp = employees.find(e => e.id === record.employeeId);
            return [
                record.employeeId,
                `"${emp ? emp.name.replace(/"/g, '""') : 'N/A'}"`,
                record.paidDays,
                record.totalDaysInMonth,
                record.grossEarnings,
                record.totalDeductions,
                record.netSalary,
                record.attendanceSummary?.present || 0,
                record.attendanceSummary?.absent || 0,
                record.attendanceSummary?.onLeave || 0,
                (record.attendanceSummary?.holiday || 0) + (record.attendanceSummary?.weekOff || 0),
                record.basic,
                record.hra,
                record.specialAllowance,
                record.providentFund,
                record.professionalTax,
                record.incomeTax,
                record.loanDeduction || 0,
                ...Object.values(record.variablePayments || {}).map(String)
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Payroll_Report_${monthNames[selectedMonth - 1]}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClose = () => {
        setStep('config');
        setPreviewData([]);
        setExpandedRow(null);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Run Monthly Payroll" size="xl">
            {step === 'config' && (
                <div className="space-y-6">
                    <p className="text-sm text-slate-600">Select the month and year to calculate payroll. This will fetch all relevant data including attendance, leaves, loans, and one-time payments to generate a comprehensive salary preview.</p>
                     <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label htmlFor="month" className="block text-sm font-medium text-slate-700 mb-1">Month</label>
                            <select id="month" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                {monthNames.map((name, index) => <option key={name} value={index+1}>{name}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label htmlFor="year" className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                             <select id="year" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                {[...new Set(payrollHistory.map(p => p.year).concat(today.getFullYear()))].sort((a,b)=>b-a).map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </div>
                    </div>
                     {isAlreadyPosted && (
                        <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm border border-yellow-200">
                            <AlertTriangle size={20} />
                            <span>Payroll for {monthNames[selectedMonth-1]} {selectedYear} has already been posted. Proceeding will overwrite the existing data.</span>
                        </div>
                     )}
                     <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                        <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                        <Button type="button" onClick={handlePreview} disabled={isLoading}>
                            {isLoading ? <><Loader size={16} className="animate-spin mr-2"/> Calculating...</> : 'Calculate & Preview'}
                        </Button>
                    </div>
                </div>
            )}
            {step === 'preview' && (
                 <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Payroll Preview for {monthNames[selectedMonth-1]} {selectedYear}</h3>
                      <Button onClick={handleDownloadCsv} variant="secondary" size="sm" leftIcon={<Download size={16}/>}>Download Report (CSV)</Button>
                    </div>
                    <div className="overflow-y-auto max-h-[50vh] border rounded-lg">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100 text-slate-500 text-sm sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 font-semibold w-min"></th>
                                    <th className="p-3 font-semibold">Employee</th>
                                    <th className="p-3 font-semibold text-center">Paid Days</th>
                                    <th className="p-3 font-semibold text-right">Gross Pay</th>
                                    <th className="p-3 font-semibold text-right">Deductions</th>
                                    <th className="p-3 font-semibold text-right">Net Pay</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {previewData.map(record => {
                                    const employee = employees.find(e => e.id === record.employeeId);
                                    if (!employee) return null;
                                    const isExpanded = expandedRow === record.id;
                                    return (
                                        <React.Fragment key={record.id}>
                                            <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedRow(isExpanded ? null : record.id)}>
                                                <td className="p-3 text-center">
                                                    {isExpanded ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-400" />}
                                                </td>
                                                <td className="p-3">
                                                   <div className="flex items-center gap-3">
                                                        <Avatar name={employee.name} size="md" />
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{employee.name}</p>
                                                            <p className="text-xs text-slate-500">{employee.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center text-slate-700">{record.paidDays}/{record.totalDaysInMonth}</td>
                                                <td className="p-3 text-right font-mono text-slate-700">₹{new Intl.NumberFormat('en-IN').format(record.grossEarnings)}</td>
                                                <td className="p-3 text-right font-mono text-red-600">₹{new Intl.NumberFormat('en-IN').format(record.totalDeductions)}</td>
                                                <td className="p-3 text-right font-mono font-bold text-green-600">₹{new Intl.NumberFormat('en-IN').format(record.netSalary)}</td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-slate-50">
                                                    <td colSpan={6} className="p-0">
                                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                            <div>
                                                                <h4 className="font-semibold text-sm text-slate-600 mb-2 border-b pb-1">Financials</h4>
                                                                <ul className="text-xs space-y-1 font-mono">
                                                                    {record.componentBreakdown && Object.entries(record.componentBreakdown).map(([key, value]) => {
                                                                        const comp = salaryComponents.find(c => c.name === key);
                                                                        const isDeduction = comp?.type === 'deduction';
                                                                        return (<li key={key} className={`flex justify-between ${isDeduction ? 'text-red-700' : 'text-green-700'}`}><span>{key}:</span> <span>₹{new Intl.NumberFormat('en-IN').format(Math.round(value as number))}</span></li>)
                                                                    })}
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-sm text-slate-600 mb-2 border-b pb-1">Adjustments</h4>
                                                                <ul className="text-xs space-y-1 font-mono">
                                                                    {record.loanDeduction && record.loanDeduction > 0 && <li className="flex justify-between text-red-700"><span>Loan EMI:</span> <span>₹{new Intl.NumberFormat('en-IN').format(Math.round(record.loanDeduction))}</span></li>}
                                                                    {record.variablePayments && Object.entries(record.variablePayments).map(([key, value]) => (
                                                                         <li key={key} className={`flex justify-between ${key.includes('deduction') ? 'text-red-700' : 'text-green-700'}`}>
                                                                            <span>{key.replace(/\s\((earning|deduction)\)/, '')}:</span> 
                                                                            <span>₹{new Intl.NumberFormat('en-IN').format(Math.round(value as number))}</span>
                                                                         </li>
                                                                    ))}
                                                                    {(!record.loanDeduction || record.loanDeduction === 0) && (!record.variablePayments || Object.keys(record.variablePayments).length === 0) && <li className="text-slate-500 italic">No adjustments</li>}
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-sm text-slate-600 mb-2 border-b pb-1">Attendance</h4>
                                                                <ul className="text-xs space-y-1 text-slate-700">
                                                                    <li className="flex justify-between"><span>Present:</span> <span className="font-medium">{record.attendanceSummary?.present || 0} days</span></li>
                                                                    <li className="flex justify-between"><span>Absent:</span> <span className="font-medium">{record.attendanceSummary?.absent || 0} days</span></li>
                                                                    <li className="flex justify-between"><span>On Leave:</span> <span className="font-medium">{record.attendanceSummary?.onLeave || 0} days</span></li>
                                                                    <li className="flex justify-between"><span>Holiday/Off:</span> <span className="font-medium">{(record.attendanceSummary?.holiday || 0) + (record.attendanceSummary?.weekOff || 0)} days</span></li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                        <Button type="button" variant="secondary" onClick={() => setStep('config')}>Back</Button>
                        <Button type="button" onClick={handlePost}>Confirm & Post to History</Button>
                    </div>
                 </div>
            )}
        </Modal>
    )
}

export default PostSalaryModal;