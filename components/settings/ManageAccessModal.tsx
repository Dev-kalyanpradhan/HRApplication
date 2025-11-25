
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Employee, UserRole } from '../../types';
import { ALL_LINKS } from '../../constants';

interface ManageAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSave: (employeeId: string, accessList: string[]) => void;
}

const ManageAccessModal: React.FC<ManageAccessModalProps> = ({ isOpen, onClose, employee, onSave }) => {
  const [access, setAccess] = useState<string[]>([]);

  useEffect(() => {
    if (employee) {
      setAccess(employee.functionAccess || []);
    }
  }, [employee]);

  const handleCheckboxChange = (functionName: string, isChecked: boolean, childrenNames: string[] = []) => {
    let newAccess = [...access];
    if (isChecked) {
      newAccess.push(functionName, ...childrenNames);
      newAccess = [...new Set(newAccess)]; // ensure unique
    } else {
      newAccess = newAccess.filter(name => name !== functionName && !childrenNames.includes(name));
    }
    setAccess(newAccess);
  };
  
  const handleChildCheckboxChange = (childName: string, isChecked: boolean, parentName: string) => {
    let newAccess = [...access];
    if(isChecked) {
        newAccess.push(childName, parentName); // Add child and ensure parent is also added
        newAccess = [...new Set(newAccess)];
    } else {
        newAccess = newAccess.filter(name => name !== childName);
        // If no other children of this parent are selected, remove the parent
        const parentLink = ALL_LINKS.find(l => l.name === parentName);
        const remainingChildren = parentLink?.children?.filter(c => newAccess.includes(c.name)) || [];
        if(remainingChildren.length === 0) {
            newAccess = newAccess.filter(name => name !== parentName);
        }
    }
    setAccess(newAccess);
  }

  const handleSave = () => {
    onSave(employee.id, access);
  };

  if (!employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Access for ${employee.name}`} size="lg">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Select the modules and functions this user should have access to. Admins have full access by default.
        </p>
        <div className="space-y-2 rounded-lg border border-slate-200 p-4 max-h-80 overflow-y-auto">
          {ALL_LINKS.filter(l => l.name !== 'Home').map(link => {
            const childrenNames = link.children?.map(c => c.name) || [];
            const isParentChecked = access.includes(link.name);

            return (
                <div key={link.name} className="p-2 rounded-md hover:bg-slate-50 transition-colors">
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={isParentChecked}
                            onChange={e => handleCheckboxChange(link.name, e.target.checked, childrenNames)}
                            disabled={employee.userRole === UserRole.ADMIN}
                        />
                        <span className="text-sm font-medium text-slate-700">{link.name}</span>
                    </label>
                    {link.children && isParentChecked && (
                        <div className="pl-8 pt-2 mt-2 border-l ml-2 space-y-2">
                             {link.children.map(child => (
                                <label key={child.name} className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        checked={access.includes(child.name)}
                                        onChange={e => handleChildCheckboxChange(child.name, e.target.checked, link.name)}
                                        disabled={employee.userRole === UserRole.ADMIN}
                                    />
                                    <span className="text-xs text-slate-600">{child.name}</span>
                                </label>
                             ))}
                        </div>
                    )}
                </div>
            )
          })}
        </div>

        {employee.userRole === UserRole.ADMIN && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800">
                Administrators always have full access to all functions. Permissions cannot be modified.
            </div>
        )}

        <div className="flex justify-end gap-4 pt-4 border-t mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={employee.userRole === UserRole.ADMIN}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ManageAccessModal;
