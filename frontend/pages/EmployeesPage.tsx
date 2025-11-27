import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Employee } from '../types';
import { Plus, Search, Filter } from 'lucide-react';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import EditEmployeeModal from '../components/employees/EditEmployeeModal';
import ResetPasswordModal from '../components/employees/ResetPasswordModal';

const EmployeesPage: React.FC = () => {
  const { employees, userRole, addEmployee, updateEmployee, resetPassword } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [resettingPasswordFor, setResettingPasswordFor] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;

  return (
    <PageWrapper 
      title="Employees" 
      actions={
        userRole === UserRole.ADMIN ? (
          <Button onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus size={16} />}>
            Add Employee
          </Button>
        ) : null
      }
    >
      <Card className="mb-6">
        <div className="flex items-center gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search employees..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="secondary" leftIcon={<Filter size={16} />}>Filter</Button>
        </div>
      </Card>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={employee.name} size="sm" />
                      <div>
                        <p className="font-medium text-slate-900">{employee.name}</p>
                        <p className="text-xs text-slate-500">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.role}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.department}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canEdit && (
                        <div className="flex justify-end gap-2">
                             <Button size="sm" variant="ghost" onClick={() => setEditingEmployee(employee)}>Edit</Button>
                             {userRole === UserRole.ADMIN && (
                                <Button size="sm" variant="ghost" onClick={() => setResettingPasswordFor(employee)}>Reset Pwd</Button>
                             )}
                        </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                  <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          No employees found matching your search.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEmployee={addEmployee}
        managers={employees} 
      />

      {editingEmployee && (
        <EditEmployeeModal 
            isOpen={!!editingEmployee}
            onClose={() => setEditingEmployee(null)}
            employee={editingEmployee}
            onUpdateEmployee={(updated) => {
                updateEmployee(updated);
                setEditingEmployee(null);
            }}
            managers={employees}
        />
      )}

      {resettingPasswordFor && (
          <ResetPasswordModal
            isOpen={!!resettingPasswordFor}
            onClose={() => setResettingPasswordFor(null)}
            employee={resettingPasswordFor}
            onResetPassword={resetPassword}
          />
      )}
    </PageWrapper>
  );
};

export default EmployeesPage;