
import { Employee, PayrollRecord, AttendanceRecord, AttendanceStatus, LeaveRequest, LeaveStatus, LeaveSummary, AttendanceSummary, LeaveType, SalaryComponent, InvestmentDeclaration, DeclarationStatus, EmployeeLoan, LoanStatus, VariablePayment } from '../types';
import { calculateSalaryBreakdown } from './salaryCalculator';

/**
 * Calculates a simplified annual income tax based on Indian tax slabs.
 * This is a mock-up for demonstration.
 * @param annualTaxableIncome The income subject to tax.
 * @returns The calculated annual tax.
 */
const calculateAnnualTax = (annualTaxableIncome: number): number => {
    if (annualTaxableIncome <= 300000) {
        return 0;
    }
    if (annualTaxableIncome <= 600000) {
        return (annualTaxableIncome - 300000) * 0.05;
    }
    if (annualTaxableIncome <= 900000) {
        return 15000 + (annualTaxableIncome - 600000) * 0.10;
    }
    if (annualTaxableIncome <= 1200000) {
        return 45000 + (annualTaxableIncome - 900000) * 0.15;
    }
    if (annualTaxableIncome <= 1500000) {
        return 90000 + (annualTaxableIncome - 1200000) * 0.20;
    }
    return 150000 + (annualTaxableIncome - 1500000) * 0.30;
};


/**
 * Calculates the pro-rata payroll for a single employee for a given month using dynamic salary components and other financial data.
 */
export const calculateProRataPayrollForEmployee = (
    employee: Employee,
    year: number,
    month: number, // 1-12
    allAttendance: AttendanceRecord[],
    allLeaveRequests: LeaveRequest[],
    allDeclarations: InvestmentDeclaration[],
    allLoans: EmployeeLoan[],
    allVariablePayments: VariablePayment[],
    globalSalaryComponents: SalaryComponent[]
): PayrollRecord => {
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const employeeAttendance = allAttendance.filter(a =>
        a.employeeId === employee.id &&
        new Date(a.date).getFullYear() === year &&
        new Date(a.date).getMonth() + 1 === month
    );
    
    // 1. Calculate Attendance & Leave Summaries
    const attendanceSummary: AttendanceSummary = { present: 0, absent: 0, onLeave: 0, holiday: 0, weekOff: 0, halfDayLeave: 0, halfDayPresentAbsent: 0 };
    employeeAttendance.forEach(a => {
        switch (a.status) {
            case AttendanceStatus.PRESENT: attendanceSummary.present++; break;
            case AttendanceStatus.ABSENT: attendanceSummary.absent++; break;
            case AttendanceStatus.ON_LEAVE: attendanceSummary.onLeave++; break;
            case AttendanceStatus.HOLIDAY: attendanceSummary.holiday++; break;
            case AttendanceStatus.WEEK_OFF: attendanceSummary.weekOff++; break;
            case AttendanceStatus.HALF_DAY_LEAVE: attendanceSummary.halfDayLeave = (attendanceSummary.halfDayLeave || 0) + 1; break;
            case AttendanceStatus.HALF_DAY_PRESENT_ABSENT: attendanceSummary.halfDayPresentAbsent = (attendanceSummary.halfDayPresentAbsent || 0) + 1; break;
        }
    });

    const leaveSummary: LeaveSummary = { [LeaveType.CASUAL]: 0, [LeaveType.SICK]: 0, [LeaveType.EARNED]: 0, [LeaveType.ON_DUTY]: 0 };
    allLeaveRequests.filter(lr => lr.employeeId === employee.id && lr.status === LeaveStatus.APPROVED).forEach(lr => {
        // Simplified: assumes leave is within the month for summary
        leaveSummary[lr.leaveType] = (leaveSummary[lr.leaveType] || 0) + 1;
    });

    const paidDays = (attendanceSummary.present || 0) + (attendanceSummary.onLeave || 0) + (attendanceSummary.holiday || 0) + (attendanceSummary.weekOff || 0) + 
                     ((attendanceSummary.halfDayLeave || 0) * 0.5) + ((attendanceSummary.halfDayPresentAbsent || 0) * 0.5);

    // 2. Initial Salary Breakdown based on pro-rata CTC
    const salaryComponents = employee.salaryStructure || globalSalaryComponents;
    const ctc = employee.ctc || 0;
    const monthlyCTC = ctc / 12;
    const proRataMonthlyCTC = totalDaysInMonth > 0 ? (monthlyCTC / totalDaysInMonth) * paidDays : 0;
    
    const initialBreakdown = calculateSalaryBreakdown(proRataMonthlyCTC, salaryComponents);
    let { components: breakdown, gross: grossEarnings, deductions: totalDeductions, net: netSalary } = initialBreakdown;
    
    // 3. Handle Variable Payments
    const variablePaymentsBreakdown: Record<string, number> = {};
    const employeeVariablePayments = allVariablePayments.filter(p => p.employeeId === employee.id && p.year === year && p.month === month);
    employeeVariablePayments.forEach(p => {
        const key = `${p.description} (${p.type})`;
        variablePaymentsBreakdown[key] = p.amount;
        if (p.type === 'earning') {
            grossEarnings += p.amount;
        } else {
            totalDeductions += p.amount;
        }
    });

    // 4. Handle Loan Repayments
    let loanDeductionAmount = 0;
    const activeLoan = allLoans.find(l => l.employeeId === employee.id && l.status === LoanStatus.ACTIVE);
    if (activeLoan) {
        const loanStartDate = new Date(activeLoan.startDate);
        const payrollDate = new Date(year, month - 1, 1);
        if (payrollDate >= loanStartDate) {
            loanDeductionAmount = activeLoan.emi;
            totalDeductions += loanDeductionAmount;
        }
    }
    
    // 5. Advanced Income Tax (TDS) Calculation
    const employeeDeclarations = allDeclarations.filter(d => d.employeeId === employee.id && d.status === DeclarationStatus.APPROVED && d.financialYear === `${year}-${year+1}`);
    const totalDeclaredInvestment = employeeDeclarations.reduce((acc, d) => acc + d.declaredAmount, 0);
    const standardDeduction = 50000;
    const professionalTaxAnnual = (breakdown['Professional Tax'] || 0) * 12;

    const annualGross = ctc; // Base TDS calculation on full annual CTC
    let annualTaxableIncome = annualGross - standardDeduction - professionalTaxAnnual - totalDeclaredInvestment;
    if (annualTaxableIncome < 0) annualTaxableIncome = 0;
    
    const annualTax = calculateAnnualTax(annualTaxableIncome);
    const monthlyTDS = annualTax > 0 ? annualTax / 12 : 0;
    
    // Update TDS in components and total deductions
    const originalTDS = breakdown['Income Tax (TDS)'] || 0;
    totalDeductions = totalDeductions - originalTDS + monthlyTDS;
    breakdown['Income Tax (TDS)'] = monthlyTDS;

    // 6. Recalculate Final Net Salary
    netSalary = grossEarnings - totalDeductions;
    
    // 7. Consolidate into final record
    return {
      id: `${employee.id}-${year}-${month}`,
      employeeId: employee.id,
      year,
      month,
      basic: Math.round(breakdown['Basic'] || 0),
      hra: Math.round(breakdown['HRA'] || 0),
      specialAllowance: Math.round(breakdown['Special Allowance'] || 0),
      providentFund: Math.round(breakdown['Provident Fund'] || 0),
      professionalTax: Math.round(breakdown['Professional Tax'] || 0),
      incomeTax: Math.round(breakdown['Income Tax (TDS)'] || 0),
      grossEarnings: Math.round(grossEarnings),
      totalDeductions: Math.round(totalDeductions),
      netSalary: Math.round(netSalary),
      paidDays: paidDays,
      totalDaysInMonth: totalDaysInMonth,
      attendanceSummary,
      leaveSummary,
      componentBreakdown: breakdown,
      loanDeduction: loanDeductionAmount,
      variablePayments: variablePaymentsBreakdown,
    };
};
