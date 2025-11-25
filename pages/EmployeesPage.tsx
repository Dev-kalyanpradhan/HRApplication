


import React, { useState, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, Search, Pencil, KeyRound, CheckCircle, Clock } from 'lucide-react';
import { Employee, UserRole, EmploymentType, ConfirmationStatus } from '../types';
import Avatar from '../components/ui/Avatar';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import EditEmployeeModal from '../components/employees/EditEmployeeModal';
import ResetPasswordModal from '../components/employees/ResetPasswordModal';
import { useAuth } from '../contexts/AuthContext';
import { getSubordinateIds } from '../utils/hierarchyUtils';

const EmployeesPage: React.FC = () => {
  const { currentUser, userRole, employees, addEmployee, updateEmployee, resetPassword, initiateConfirmation, confirmationRequests } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const visibleEmployees = useMemo(() => {
    if (userRole === UserRole.ADMIN) {
      return employees;
    }
    if (userRole === UserRole.MANAGER && currentUser) {
      const subordinateIds = [currentUser.id, ...getSubordinateIds(currentUser.id, employees)];
      return employees.filter(e => subordinateIds.includes(e.id));
    }
    if (userRole === UserRole.EMPLOYEE && currentUser) {
        if (!currentUser.reportingManagerId) return [currentUser];
        const manager = employees.find(e => e.id === currentUser.reportingManagerId);
        const peers = employees.filter(e => e.reportingManagerId === currentUser.reportingManagerId);
        return [...peers, ...(manager ? [manager] : [])];
    }
    return [];
  }, [currentUser, userRole, employees]);

  const filteredEmployees = useMemo(() => {
    return visibleEmployees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [visibleEmployees, searchTerm]);
  
  const managers = useMemo(() => employees.filter(e => e.userRole === UserRole.MANAGER || e.userRole === UserRole.ADMIN), [employees]);

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleResetPasswordClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsResetPasswordModalOpen(true);
  };

  const handleUpdateEmployee = (updatedData: Employee) => {
    updateEmployee(updatedData);
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleResetPassword = (employeeId: string, newPassword: string) => {
    resetPassword(employeeId, newPassword);
    setIsResetPasswordModalOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <PageWrapper
      title={userRole === UserRole.MANAGER ? "My Team" : "Employee Directory"}
      actions={
        userRole === UserRole.ADMIN && (
          <Button onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus size={18} />}>
            Add Employee
          </Button>
        )
      }
    >
      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-y-4">
            <h3 className="text-lg font-semibold">All Employees ({filteredEmployees.length})</h3>
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
                <th className="p-4 font-semibold">Employee ID</th>
                <th className="p-4 font-semibold">Employment Status</th>
                <th className="p-4 font-semibold">IP Restriction</th>
                {userRole === UserRole.ADMIN && <th className="p-4 font-semibold">Actions</th>}
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
                  <td className="p-4 text-slate-700 font-mono">{employee.id}</td>
                  <td className="p-4 text-slate-700">
                     <p className="font-semibold">{employee.employmentType}</p>
                     <p className={`text-xs font-medium ${employee.confirmationStatus === ConfirmationStatus.CONFIRMED ? 'text-green-600' : 'text-amber-600'}`}>
                        {employee.confirmationStatus}
                     </p>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      employee.ipRestrictionExempt || employee.userRole === UserRole.ADMIN
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {employee.ipRestrictionExempt || employee.userRole === UserRole.ADMIN ? 'Exempt' : 'Enforced'}
                    </span>
                  </td>
                  {userRole === UserRole.ADMIN && (
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditClick(employee)} title="Edit Employee Details">
                          <Pencil size={16} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleResetPasswordClick(employee)} title="Reset Password">
                          <KeyRound size={16} />
                        </Button>
                        {employee.confirmationStatus !== ConfirmationStatus.CONFIRMED && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => initiateConfirmation(employee.id)}
                                disabled={employee.confirmationStatus?.toString().startsWith('Pending')}
                                title="Initiate Confirmation Process"
                            >
                                {employee.confirmationStatus?.toString().startsWith('Pending') 
                                    ? <Clock size={16} className="text-yellow-500"/> 
                                    : <CheckCircle size={16} className="text-green-500"/>
                                }
                            </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEmployee={addEmployee}
        managers={managers}
      />
      {selectedEmployee && (
        <>
            <EditEmployeeModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                employee={selectedEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                managers={managers}
            />
            <ResetPasswordModal
              isOpen={isResetPasswordModalOpen}
              onClose={() => setIsResetPasswordModalOpen(false)}
              employee={selectedEmployee}
              onResetPassword={handleResetPassword}
            />
        </>
      )}
    </PageWrapper>
  );
};

export default EmployeesPage;