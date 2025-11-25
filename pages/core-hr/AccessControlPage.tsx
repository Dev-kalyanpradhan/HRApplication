import React, { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, UserRole } from '../../types';
import Button from '../../components/ui/Button';
import { ShieldCheck, Search } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import ManageAccessModal from '../../components/settings/ManageAccessModal';
import { ALL_FUNCTIONS } from '../../constants';

const AccessControlPage: React.FC = () => {
  const { employees, updateEmployeeAccess } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const handleManageClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSaveChanges = (employeeId: string, accessList: string[]) => {
    updateEmployeeAccess(employeeId, accessList);
    setIsModalOpen(false);
  };

  return (
    <PageWrapper title="Access Control">
        <Card>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-y-4">
                <h3 className="text-lg font-semibold">Manage employee permissions</h3>
                <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or ID..."
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
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Accessible Functions</th>
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
                            <p className="text-sm text-slate-500 font-mono">{employee.id}</p>
                            </div>
                        </div>
                        </td>
                        <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${employee.userRole === UserRole.ADMIN ? 'bg-red-100 text-red-800' : employee.userRole === UserRole.MANAGER ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>{employee.userRole}</span>
                        </td>
                        <td className="p-4 text-slate-600 text-sm">
                        {employee.functionAccess.length} / {ALL_FUNCTIONS.length}
                        </td>
                        <td className="p-4 text-center">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleManageClick(employee)}
                            leftIcon={<ShieldCheck size={16} />}
                        >
                            Manage Access
                        </Button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            {selectedEmployee && (
                <ManageAccessModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employee={selectedEmployee}
                onSave={handleSaveChanges}
                />
            )}
        </Card>
    </PageWrapper>
  );
};

export default AccessControlPage;
