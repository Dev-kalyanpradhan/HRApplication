

import React, { useMemo, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { DocumentStatus, UserRole } from '../../types';
import Button from '../../components/ui/Button';
import { Upload, Check, X, AlertTriangle, Bot } from 'lucide-react';
import UploadDocumentModal from '../../components/lifecycle/UploadDocumentModal';
import Avatar from '../../components/ui/Avatar';
import DocumentAnalysisModal from '../../components/lifecycle/DocumentAnalysisModal';

const DocumentHubPage: React.FC = () => {
    const { currentUser, userRole, employees, employeeDocuments, uploadDocument, verifyDocument } = useAuth();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    const [activeTab, setActiveTab] = useState(DocumentStatus.SUBMITTED);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);

    const myDocuments = useMemo(() => {
        return employeeDocuments.filter(d => d.employeeId === currentUser?.id);
    }, [employeeDocuments, currentUser]);

    const adminVisibleDocuments = useMemo(() => {
        return employeeDocuments.filter(d => d.status === activeTab);
    }, [employeeDocuments, activeTab]);

    const handleAnalyzeClick = (doc: any) => {
        setSelectedDocument(doc);
        setIsAnalysisModalOpen(true);
    };

    const getStatusChip = (status: DocumentStatus) => {
        const colors = {
            [DocumentStatus.PENDING]: 'bg-slate-100 text-slate-800',
            [DocumentStatus.SUBMITTED]: 'bg-yellow-100 text-yellow-800',
            [DocumentStatus.VERIFIED]: 'bg-green-100 text-green-800',
            [DocumentStatus.REJECTED]: 'bg-red-100 text-red-800',
        };
        return colors[status];
    };

    const isAdmin = userRole === UserRole.ADMIN || currentUser?.functionAccess.includes('Lifecycle');
    
    // Employee View
    if (!isAdmin) {
        return (
            <PageWrapper title="My Document Hub" actions={<Button onClick={() => setIsUploadModalOpen(true)} leftIcon={<Upload size={16}/>}>Upload Document</Button>}>
                <Card>
                    <p className="text-sm text-slate-600 mb-4">Please upload all required documents. HR will verify them upon submission.</p>
                     <div className="space-y-3">
                        {myDocuments.map(doc => (
                             <div key={doc.id} className="p-4 border rounded-lg bg-white flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-slate-800">{doc.documentName}</p>
                                     {doc.status === DocumentStatus.REJECTED && (
                                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle size={12}/> {doc.rejectionReason}</p>
                                     )}
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(doc.status)}`}>
                                    {doc.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
                <UploadDocumentModal 
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onUpload={(doc) => {
                        uploadDocument(doc);
                        setIsUploadModalOpen(false);
                    }}
                    pendingDocs={myDocuments.filter(d => d.status === DocumentStatus.PENDING || d.status === DocumentStatus.REJECTED)}
                />
            </PageWrapper>
        );
    }
    
    // Admin View
    return (
        <PageWrapper title="Document Hub (Admin)">
            <Card>
                <div className="flex border-b border-slate-200 mb-6">
                   {Object.values(DocumentStatus).map(status => (
                        <button 
                            key={status}
                            onClick={() => setActiveTab(status)}
                            className={`px-4 py-3 font-medium text-sm capitalize ${activeTab === status ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {status.toLowerCase()}
                        </button>
                   ))}
                </div>
                
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold">Employee</th>
                                <th className="p-4 font-semibold">Document</th>
                                <th className="p-4 font-semibold">Submitted At</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adminVisibleDocuments.map(doc => {
                                const employee = employees.find(e => e.id === doc.employeeId);
                                return (
                                <tr key={doc.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={employee?.name || ''} size="md" />
                                            <div>
                                                <p className="font-semibold text-slate-800">{employee?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-800">{doc.documentName}</td>
                                    <td className="p-4 text-slate-700">{doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                                    <td className="p-4 text-center">
                                        {doc.status === DocumentStatus.SUBMITTED && (
                                            <div className="flex gap-2 justify-center">
                                                <Button size="sm" variant="secondary" onClick={() => handleAnalyzeClick(doc)}><Bot size={16} className="text-blue-600"/></Button>
                                                <Button size="sm" variant="secondary" onClick={() => verifyDocument(doc.id, DocumentStatus.VERIFIED)}><Check size={16} className="text-green-600"/></Button>
                                                <Button size="sm" variant="secondary" onClick={() => {
                                                    const reason = prompt("Please provide a reason for rejection:");
                                                    if(reason) verifyDocument(doc.id, DocumentStatus.REJECTED, reason);
                                                }}><X size={16} className="text-red-600"/></Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                     {adminVisibleDocuments.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <p>No documents with status '{activeTab.toLowerCase()}' found.</p>
                        </div>
                    )}
                </div>
            </Card>
            {isAnalysisModalOpen && selectedDocument && (
                <DocumentAnalysisModal 
                    isOpen={isAnalysisModalOpen}
                    onClose={() => setIsAnalysisModalOpen(false)}
                    documentName={selectedDocument.documentName}
                />
            )}
        </PageWrapper>
    );
};

export default DocumentHubPage;