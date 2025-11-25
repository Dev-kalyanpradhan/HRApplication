import React, { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import { Send } from 'lucide-react';
import PayrollSummary from '../../components/payroll/PayrollSummary';
import PostSalaryModal from '../../components/payroll/PostSalaryModal';
import { Link } from 'react-router-dom';

const RunPayrollPage: React.FC = () => {
    const { employees, payrollHistory, postNewPayrollBatch } = useAuth();
    const [isPostSalaryModalOpen, setIsPostSalaryModalOpen] = useState(false);
    
    const lastPayrollRun = useMemo(() => {
        const sorted = [...payrollHistory].sort((a,b) => new Date(b.year, b.month -1).getTime() - new Date(a.year, a.month - 1).getTime());
        if (sorted.length === 0) return [];
        const lastRunYear = sorted[0].year;
        const lastRunMonth = sorted[0].month;
        return payrollHistory.filter(p => p.year === lastRunYear && p.month === lastRunMonth);
    }, [payrollHistory]);

    return (
        <PageWrapper title="Run Payroll">
            <Card>
                <div className="mb-6">
                    <PayrollSummary payrollData={lastPayrollRun} employees={employees}/>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h4 className="font-semibold text-slate-800">Ready to Process Payroll?</h4>
                            <p className="text-sm text-slate-600 mt-1">
                                Before running payroll, ensure all employee CTCs are up-to-date.
                                You can assign salaries on the <Link to="/payroll/assignment" className="text-blue-600 font-medium hover:underline">Salary Assignment</Link> page and model scenarios with the <Link to="/payroll/calculator" className="text-blue-600 font-medium hover:underline">CTC Calculator</Link>.
                            </p>
                        </div>
                         <Button onClick={() => setIsPostSalaryModalOpen(true)} leftIcon={<Send size={16} />} className="w-full md:w-auto flex-shrink-0">
                            Run New Payroll
                        </Button>
                    </div>
                </div>

                {isPostSalaryModalOpen && (
                    <PostSalaryModal 
                        isOpen={isPostSalaryModalOpen}
                        onClose={() => setIsPostSalaryModalOpen(false)}
                        onPostSalary={postNewPayrollBatch}
                    />
                )}
            </Card>
        </PageWrapper>
    );
};

export default RunPayrollPage;