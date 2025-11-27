import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { DocumentStatus } from '../../types';
import { FileText, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import UploadDocumentModal from '../../components/lifecycle/UploadDocumentModal';

const DocumentHubPage: React.FC = () => {
  const { employeeDocuments, currentUser } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const myDocuments = employeeDocuments.filter(doc => doc.employeeId === currentUser?.id);

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.VERIFIED: return <CheckCircle className="text-green-500" size={20} />;
      case DocumentStatus.REJECTED: return <AlertCircle className="text-red-500" size={20} />;
      case DocumentStatus.SUBMITTED: return <Clock className="text-blue-500" size={20} />;
      default: return <Clock className="text-slate-300" size={20} />;
    }
  };

  return (
    <PageWrapper 
      title="Document Hub" 
      actions={
        <Button onClick={() => setIsUploadModalOpen(true)} leftIcon={<Upload size={16} />}>
          Upload Document
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myDocuments.map(doc => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{doc.documentName}</h3>
                  <p className="text-xs text-slate-500">{doc.status}</p>
                </div>
              </div>
              {getStatusIcon(doc.status)}
            </div>
            {doc.rejectionReason && (
                <div className="mt-3 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                    Reason: {doc.rejectionReason}
                </div>
            )}
            <div className="mt-4 pt-3 border-t flex justify-between text-xs text-slate-400">
                <span>{doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : 'Not submitted'}</span>
            </div>
          </Card>
        ))}
        {myDocuments.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
                No documents found.
            </div>
        )}
      </div>

      <UploadDocumentModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </PageWrapper>
  );
};

export default DocumentHubPage;