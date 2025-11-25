

import React, { useState, useMemo, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/ui/Avatar';
import { Search, Edit } from 'lucide-react';
import { Employee } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

interface EditLeaveBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSave: (employeeId: string, newBalance: { casual: number, sick: number, earned: number }) => void;
}

const EditLeaveBalanceModal: React.FC<EditLeaveBalanceModalProps> = ({ isOpen, onClose, employee, onSave }) => {
  const [balances, setBalances] = useState(employee.leaveBalance);

  useEffect(() => {
    if (employee) {
      setBalances(employee.leaveBalance);
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBalances(prev => ({
      ...prev,
      [name]: Number(value) >= 0 ? Number(value) : 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(employee.id, balances);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Leave Balance for ${employee.name}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-slate-600">Manually adjust the available leave days for this employee.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input 
            id="casual" 
            name="casual" 
            label="Casual Leave" 
            type="number" 
            value={balances.casual} 
            onChange={handleChange} 
            min="0"
            required 
          />
          <Input 
            id="sick" 
            name="sick" 
            label="Sick Leave" 
            type="number" 
            value={balances.sick} 
            onChange={handleChange} 
            min="0"
            required 
          />
          <Input 
            id="earned" 
            name="earned" 
            label="Earned Leave" 
            type="number" 
            value={balances.earned} 
            onChange={handleChange} 
            min="0"
            required 
          />
        </div>
        <div className="flex justify-end gap-4 pt-4 border-t mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};


const LeaveBalancesPage: React.FC = () => {
    const { employees, updateLeaveBalance } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);


    const filteredEmployees = useMemo(() => {
        return employees.filter(employee =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);
    
    const handleEditClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };
    
    const handleSaveBalance = (employeeId: string, newBalance: { casual: number; sick: number; earned: number; }) => {
        updateLeaveBalance(employeeId, newBalance);
    };

    return (
        <PageWrapper title="Employee Leave Balances">
            <Card>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-y-4">
                    <h3 className="text-lg font-semibold">All Employee Balances ({filteredEmployees.length})</h3>
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
                                <th className="p-4 font-semibold text-center">Casual Leave</th>
                                <th className="p-4 font-semibold text-center">Sick Leave</th>
                                <th className="p-4 font-semibold text-center">Earned Leave</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(employee => (
                                <tr key={employee.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={employee.name} size="md" />
                                            <div>
                                                <p className="font-semibold text-slate-800">{employee.name}</p>
                                                <p className="text-sm text-slate-500">{employee.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center font-medium text-lg text-blue-700">{employee.leaveBalance.casual}</td>
                                    <td className="p-4 text-center font-medium text-lg text-amber-700">{employee.leaveBalance.sick}</td>
                                    <td className="p-4 text-center font-medium text-lg text-green-700">{employee.leaveBalance.earned}</td>
                                    <td className="p-4 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditClick(employee)}
                                            title="Edit Leave Balance"
                                        >
                                            <Edit size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredEmployees.length === 0 && (
                         <div className="text-center py-10 text-slate-500">
                            <p>No employees found matching your search.</p>
                        </div>
                    )}
                </div>
            </Card>
            {isModalOpen && selectedEmployee && (
                <EditLeaveBalanceModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    employee={selectedEmployee}
                    onSave={handleSaveBalance}
                />
            )}
        </PageWrapper>
    );
};

export default LeaveBalancesPage;
