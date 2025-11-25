
import React, { useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Printer, Zap, PlusCircle, MinusCircle } from 'lucide-react';
import { Employee, PayrollRecord } from '../../types';

interface PayslipModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee;
    payrollRecord: PayrollRecord;
}

const PayslipModal: React.FC<PayslipModalProps> = ({ isOpen, onClose, employee, payrollRecord }) => {
    const payslipRef = useRef<HTMLDivElement>(null);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handlePrint = () => {
        const printContent = payslipRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Payslip</title>');
                printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
                printWindow.document.write('<style>body { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; font-family: sans-serif; } @page { size: A4; margin: 0; } .payslip-container { padding: 2rem; } </style>');
                printWindow.document.write('</head><body><div class="payslip-container">');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</div></body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => { // Timeout to ensure content is loaded
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
    };

    const variableEarnings = payrollRecord.variablePayments ? Object.entries(payrollRecord.variablePayments).filter(([key]) => key.includes('(earning)')) : [];
    const variableDeductions = payrollRecord.variablePayments ? Object.entries(payrollRecord.variablePayments).filter(([key]) => key.includes('(deduction)')) : [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Employee Payslip" size="lg">
            <div>
                <div ref={payslipRef} className="p-2">
                    <div className="border-b-2 border-slate-200 pb-4 mb-4">
                         <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <Zap className="text-blue-500" size={28} />
                                <h1 className="text-3xl font-bold ml-2 text-slate-800">AI4S Smart HR</h1>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-700">Payslip</h2>
                                <p className="text-slate-500 text-right">{monthNames[payrollRecord.month - 1]} {payrollRecord.year}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                        <div>
                            <p className="font-bold text-base text-slate-800">{employee.name}</p>
                            <p className="text-slate-600">{employee.role}</p>
                            <p className="text-slate-600">{employee.department}</p>
                        </div>
                        <div className="text-right text-slate-600">
                             <p><span className="font-semibold text-slate-700">Paid Days:</span> {payrollRecord.paidDays} / {payrollRecord.totalDaysInMonth}</p>
                            <p><span className="font-semibold text-slate-700">Employee ID:</span> {employee.id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-lg font-semibold text-green-700 border-b pb-1 mb-2">Earnings</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><p className="text-slate-600">Basic Salary</p><p className="font-mono text-slate-800">₹{new Intl.NumberFormat('en-IN').format(payrollRecord.basic)}</p></div>
                                <div className="flex justify-between"><p className="text-slate-600">House Rent Allowance (HRA)</p><p className="font-mono text-slate-800">₹{new Intl.NumberFormat('en-IN').format(payrollRecord.hra)}</p></div>
                                <div className="flex justify-between"><p className="text-slate-600">Special Allowance</p><p className="font-mono text-slate-800">₹{new Intl.NumberFormat('en-IN').format(payrollRecord.specialAllowance)}</p></div>
                                {variableEarnings.map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-green-600">
                                        <p className="italic flex items-center gap-1"><PlusCircle size={12}/> {key.replace(' (earning)', '')}</p>
                                        {/* Fix: Explicitly cast `value` to number for formatting. */}
                                        <p className="font-mono">₹{new Intl.NumberFormat('en-IN').format(value as number)}</p>
                                    </div>
                                ))}
                            </div>
                             <div className="flex justify-between font-bold text-sm border-t mt-2 pt-2">
                                <p className="text-slate-800">Gross Earnings</p>
                                <p className="font-mono text-slate-900">₹{new Intl.NumberFormat('en-IN').format(payrollRecord.grossEarnings)}</p>
                            </div>
                        </div>
                         <div>
                            <h4 className="text-lg font-semibold text-red-700 border-b pb-1 mb-2">Deductions</h4>
                             <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><p className="text-slate-600">Provident Fund (PF)</p><p className="font-mono text-slate-800">₹{new Intl.NumberFormat('en-IN').format(payrollRecord.providentFund)}</p></div>
                                <div className="flex justify-between"><p className="text-slate-600">Professional Tax</p><p className="font-mono text-slate-800">₹{new Intl.NumberFormat('en-IN').format(payrollRecord.professionalTax)}</p></div>
                                <div className="flex justify-between"><p className="text-slate-600">Income Tax (TDS)</p><p className="font-mono text-slate-800">₹{new Intl.NumberFormat('en-IN').format(payrollRecord.incomeTax)}</p></div>
                                {payrollRecord.loanDeduction && payrollRecord.loanDeduction > 0 && (
                                     <div className="flex justify-between text-red-600">
                                        <p className="italic">Loan Repayment (EMI)</p>
                                        <p className="font-mono">₹{new Intl.NumberFormat('en-IN').format(payrollRecord.loanDeduction)}</p>
                                     </div>
                                )}
                                 {variableDeductions.map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-red-600">
                                        <p className="italic flex items-center gap-1"><MinusCircle size={12}/> {key.replace(' (deduction)', '')}</p>
                                        {/* Fix: Explicitly cast `value` to number for formatting. */}
                                        <p className="font-mono">₹{new Intl.NumberFormat('en-IN').format(value as number)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between font-bold text-sm border-t mt-2 pt-2">
                                <p className="text-slate-800">Total Deductions</p>
                                <p className="font-mono text-slate-900">₹{new Intl.NumberFormat('en-IN').format(payrollRecord.totalDeductions)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center">
                            <p className="text-lg font-bold text-blue-800">Net Salary</p>
                            <p className="text-2xl font-bold text-blue-800 font-mono">₹{new Intl.NumberFormat('en-IN').format(payrollRecord.netSalary)}</p>
                        </div>
                         <p className="text-xs text-blue-700 mt-1 text-right">**Amount in words:** Rupees {numberToWords(payrollRecord.netSalary)} Only</p>
                    </div>
                </div>
                <div className="flex justify-end gap-4 p-4 border-t mt-4">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button onClick={handlePrint} leftIcon={<Printer size={18} />}>Print</Button>
                </div>
            </div>
        </Modal>
    );
};


// Helper function to convert number to words
function numberToWords(num: number): string {
    if (num === 0) return 'Zero';
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != '00') ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != '00') ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != '00') ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != '0') ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != '00') ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim().replace(/\s\s+/g, ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

export default PayslipModal;