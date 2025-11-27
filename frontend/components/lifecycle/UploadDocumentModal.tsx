import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const UploadDocumentModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { uploadDocument, currentUser } = useAuth();
  const [docName, setDocName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
        uploadDocument({
            employeeId: currentUser.id,
            documentName: docName,
        });
        setDocName('');
        onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Document">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
            id="docName" 
            label="Document Name" 
            value={docName} 
            onChange={(e) => setDocName(e.target.value)} 
            placeholder="e.g., Aadhar Card" 
            required 
        />
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500">
            <p>File upload is simulated in this demo.</p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Upload</Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadDocumentModal;