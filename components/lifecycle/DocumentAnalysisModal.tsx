
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { analyzeDocument } from '../../services/geminiService';
import { Loader } from 'lucide-react';

interface DocumentAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentName: string;
}

const DocumentAnalysisModal: React.FC<DocumentAnalysisModalProps> = ({ isOpen, onClose, documentName }) => {
    const [analysis, setAnalysis] = useState<Record<string, any> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const getAnalysis = async () => {
                setIsLoading(true);
                const result = await analyzeDocument(documentName);
                setAnalysis(result);
                setIsLoading(false);
            };
            getAnalysis();
        }
    }, [isOpen, documentName]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`AI Analysis for ${documentName}`}>
            {isLoading ? (
                <div className="flex items-center justify-center p-10">
                    <Loader size={24} className="animate-spin text-blue-500" />
                    <p className="ml-3 text-slate-500">Analyzing document...</p>
                </div>
            ) : analysis && !analysis.error ? (
                <div>
                     <p className="text-sm text-slate-600 mb-4">
                        AI has extracted the following key details from the document for verification.
                    </p>
                    <div className="space-y-3 p-4 bg-slate-50 rounded-lg border">
                       {Object.entries(analysis).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-3 gap-4 text-sm">
                                <span className="font-semibold text-slate-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="col-span-2 text-slate-900 font-mono bg-white p-1 rounded border">{String(value)}</span>
                            </div>
                       ))}
                    </div>
                </div>
            ) : (
                <p className="text-center text-red-600 p-10">
                    {analysis?.error || "Could not analyze the document at this time."}
                </p>
            )}
        </Modal>
    );
};

export default DocumentAnalysisModal;