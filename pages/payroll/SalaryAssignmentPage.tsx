import React, { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Search, Edit, Clock, CheckCircle } from 'lucide-react';
import { Employee, SalaryChangeStatus } from '../../types';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import ModifySalaryModal from '../../components/payroll/ModifySalaryModal';

const SalaryAssignmentPage: React.FC = () => {
    const { employees, salaryChangeRequests } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [justSentRequestId, setJustSentRequestId] = useState<string | null>(null);

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);
    
    const requestStatusMap = useMemo(() => {
        const map = new Map<string, SalaryChangeStatus>();
        salaryChangeRequests.forEach(req => {
            map.set(req.employeeId, req.status);
        });
        return map;
    }, [salaryChangeRequests]);
    
    const handleModifyClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleApprovalSent = (employeeId: string) => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
        setJustSentRequestId(employeeId);
        setTimeout(() => setJustSentRequestId(null), 4000);
    };

    return (
        <PageWrapper
            title="Salary Assignment"
        >
            <Card>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-y-4">
                    <div>
                        <h3 className="text-lg font-semibold">Assign Employee CTC</h3>
                        <p className="text-sm text-slate-500">
                          Click 'Modify Salary' to propose a new CTC for an employee.
                        </p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-slate-300 rounded-md py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold">Employee</th>
                                <th className="p-4 font-semibold text-right">Current CTC (₹)</th>
                                <th className="p-4 font-semibold text-center">Status</th>
                                <th className="p-4 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(employee => {
                                const status = requestStatusMap.get(employee.id);
                                const isPending = status === SalaryChangeStatus.PENDING;

                                return (
                                <tr key={employee.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={employee.name} size="md" />
                                            <div>
                                                <p className="font-semibold text-slate-800">{employee.name}</p>
                                                <p className="text-sm text-slate-500 font-mono">{employee.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-700 text-right font-mono">
                                        {new Intl.NumberFormat('en-IN').format(employee.ctc || 0)}
                                    </td>
                                    <td className="p-4 text-center">
                                       {isPending ? (
                                           <span className="flex items-center justify-center gap-2 text-yellow-600 font-medium text-sm">
                                               <Clock size={16} />
                                               Pending Approval
                                           </span>
                                       ) : justSentRequestId === employee.id ? (
                                            <span className="flex items-center justify-center gap-2 text-green-600 font-medium text-sm">
                                                <CheckCircle size={16} />
                                                Request Sent
                                            </span>
                                       ) : (
                                            <span className="text-sm text-slate-500">-</span>
                                       )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleModifyClick(employee)}
                                            disabled={isPending}
                                            leftIcon={<Edit size={14} />}
                                        >
                                            Modify Salary
                                        </Button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                    {filteredEmployees.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            No employees found matching your search.
                        </div>
                    )}
                </div>
            </Card>
            {isModalOpen && selectedEmployee && (
                <ModifySalaryModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    employee={selectedEmployee}
                    onApprovalSent={handleApprovalSent}
                />
            )}
        </PageWrapper>
    );
};

export default SalaryAssignmentPage;