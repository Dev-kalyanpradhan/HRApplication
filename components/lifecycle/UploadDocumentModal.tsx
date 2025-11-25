
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { useAuth } from '../../contexts/AuthContext';
import { EmployeeDocument } from '../../types';

interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (doc: Omit<EmployeeDocument, 'id' | 'status' | 'submittedAt' | 'verifiedAt' | 'rejectionReason'>) => void;
    pendingDocs: EmployeeDocument[];
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose, onUpload, pendingDocs }) => {
    const { currentUser } = useAuth();
    const [documentName, setDocumentName] = useState(pendingDocs[0]?.documentName || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !documentName) return;
        onUpload({
            employeeId: currentUser.id,
            documentName,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upload Document">
            <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm text-slate-600">Select the document you wish to submit for verification.</p>
                <Select id="documentName" label="Document Type" value={documentName} onChange={e => setDocumentName(e.target.value)} required>
                    {pendingDocs.map(doc => (
                        <option key={doc.id} value={doc.documentName}>{doc.documentName}</option>
                    ))}
                </Select>
                 <div className="p-4 text-center border-2 border-dashed border-slate-300 rounded-lg">
                    <p className="text-slate-500">File upload simulation.</p>
                    <p className="text-xs text-slate-400">In a real app, a file input would be here.</p>
                </div>
                 <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Submit Document</Button>
                </div>
            </form>
        </Modal>
    );
};

export default UploadDocumentModal;
