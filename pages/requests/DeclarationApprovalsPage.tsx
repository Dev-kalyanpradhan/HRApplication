import React, { useMemo, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Check, X, Search, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DeclarationStatus, UserRole } from '../../types';
import Avatar from '../../components/ui/Avatar';
import { downloadCsv } from '../../utils/csvUtils';

const DeclarationApprovalsPage: React.FC = () => {
    const { currentUser, declarations, updateDeclarationStatus, employees } = useAuth();
    const [filter, setFilter] = useState<DeclarationStatus>(DeclarationStatus.PENDING);
    const [searchTerm, setSearchTerm] = useState('');

    const visibleDeclarations = useMemo(() => {
        return declarations
            .filter(d => d.status === filter)
            .filter(d => {
                if (!searchTerm.trim()) return true;
                const employee = employees.find(e => e.id === d.employeeId);
                return employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [declarations, filter, searchTerm, employees]);
    
    const handleDownload = () => {
        const headers = ['Declaration ID', 'Employee Name', 'Employee ID', 'Financial Year', 'Section', 'Declared Amount', 'Status'];
        const rows = visibleDeclarations.map(decl => {
            const employee = employees.find(e => e.id === decl.employeeId);
            return [
                decl.id,
                employee?.name || decl.employeeId,
                decl.employeeId,
                decl.financialYear,
                decl.section,
                decl.declaredAmount,
                decl.status
            ];
        });
        downloadCsv(`declaration_requests_${filter.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    };

    const getStatusChip = (status: DeclarationStatus) => {
        const colors: Record<DeclarationStatus, string> = {
            [DeclarationStatus.APPROVED]: 'bg-green-100 text-green-800',
            [DeclarationStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
            [DeclarationStatus.REJECTED]: 'bg-red-100 text-red-800',
        };
        return colors[status];
    };

    return (
        <PageWrapper title="Investment Declaration Approvals">
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex border-b border-slate-200">
                       {Object.values(DeclarationStatus).map(status => (
                            <button 
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 font-medium text-sm capitalize ${filter === status ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {status.toLowerCase()}
                            </button>
                       ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by employee..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white border border-slate-300 rounded-md py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {(currentUser?.userRole === UserRole.ADMIN || currentUser?.userRole === UserRole.MANAGER) && (
                             <Button onClick={handleDownload} variant="secondary" size="sm" leftIcon={<Download size={16}/>}>
                                Export
                            </Button>
                        )}
                    </div>
                </div>


                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold">Employee</th>
                                <th className="p-4 font-semibold">Financial Year</th>
                                <th className="p-4 font-semibold">Section</th>
                                <th className="p-4 font-semibold text-right">Declared Amount</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleDeclarations.map(decl => {
                                const employee = employees.find(e => e.id === decl.employeeId);
                                return (
                                <tr key={decl.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={employee?.name || ''} size="md" />
                                            <div>
                                                <p className="font-semibold text-slate-800">{employee?.name}</p>
                                                <p className="text-xs text-slate-500 font-mono">{employee?.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-800">{decl.financialYear}</td>
                                    <td className="p-4 text-slate-700">{decl.section}</td>
                                    <td className="p-4 text-slate-700 text-right font-mono">₹{decl.declaredAmount.toLocaleString('en-IN')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(decl.status)}`}>
                                            {decl.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {decl.status === DeclarationStatus.PENDING && (
                                            <div className="flex gap-2 justify-center">
                                                <Button size="sm" variant="secondary" onClick={() => updateDeclarationStatus(decl.id, DeclarationStatus.APPROVED)}><Check size={16} className="text-green-600"/></Button>
                                                <Button size="sm" variant="secondary" onClick={() => updateDeclarationStatus(decl.id, DeclarationStatus.REJECTED)}><X size={16} className="text-red-600"/></Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                    {visibleDeclarations.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <p>No declarations match the current filters.</p>
                        </div>
                    )}
                </div>
            </Card>
        </PageWrapper>
    );
};

export default DeclarationApprovalsPage;