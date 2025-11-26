
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Employee } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onResetPassword: (employeeId: string, newPassword: string) => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose, employee, onResetPassword }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
        setError('Both password fields are required.');
        return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    onResetPassword(employee.id, newPassword);
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Reset Password for ${employee.name}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-slate-600">
            Enter a new password for <span className="font-semibold">{employee.name}</span>. The user will be required to use this new password for their next login.
        </p>
        <Input 
            id="newPassword" 
            name="newPassword" 
            label="New Password" 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
            autoComplete="new-password"
        />
        <Input 
            id="confirmPassword" 
            name="confirmPassword" 
            label="Confirm New Password" 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            autoComplete="new-password"
        />

        {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                <AlertTriangle size={20} />
                <span>{error}</span>
            </div>
        )}

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 mt-6">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit">Reset Password</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ResetPasswordModal;
