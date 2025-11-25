
import React, { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { InvestmentDeclaration, DeclarationStatus } from '../../types';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const AddDeclarationModal: React.FC<{isOpen: boolean, onClose: () => void, onAdd: (decl: Omit<InvestmentDeclaration, 'id'|'employeeId'|'status'|'proofAttached'>) => void}> = ({ isOpen, onClose, onAdd }) => {
    const currentYear = new Date().getFullYear();
    const [financialYear, setFinancialYear] = useState(`${currentYear}-${currentYear+1}`);
    const [section, setSection] = useState('80C');
    const [declaredAmount, setDeclaredAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            financialYear,
            section,
            declaredAmount: Number(declaredAmount)
        });
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Tax Declaration">
            <form onSubmit={handleSubmit} className="space-y-6">
                 <Select id="financialYear" label="Financial Year" value={financialYear} onChange={e => setFinancialYear(e.target.value)}>
                    <option value={`${currentYear}-${currentYear+1}`}>{`${currentYear}-${currentYear+1}`}</option>
                    <option value={`${currentYear-1}-${currentYear}`}>{`${currentYear-1}-${currentYear}`}</option>
                </Select>
                <Select id="section" label="Tax Section" value={section} onChange={e => setSection(e.target.value)}>
                    <option value="80C">Section 80C (EPF, PPF, Life Insurance, etc.)</option>
                    <option value="80D">Section 80D (Medical Insurance)</option>
                    <option value="HRA">House Rent Allowance (HRA)</option>
                    <option value="80G">Section 80G (Donations)</option>
                    <option value="Other">Other</option>
                </Select>
                <Input id="declaredAmount" label="Declared Amount (INR)" type="number" value={declaredAmount} onChange={e => setDeclaredAmount(e.target.value)} required />

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Add Declaration</Button>
                </div>
            </form>
        </Modal>
    );
}


const TaxPlanningPage: React.FC = () => {
    const { currentUser, declarations, addDeclaration } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const myDeclarations = useMemo(() => {
        return declarations.filter(d => d.employeeId === currentUser?.id);
    }, [declarations, currentUser]);

    const getStatusChip = (status: DeclarationStatus) => {
        const colors: Record<DeclarationStatus, string> = {
            [DeclarationStatus.APPROVED]: 'bg-green-100 text-green-800',
            [DeclarationStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
            [DeclarationStatus.REJECTED]: 'bg-red-100 text-red-800',
        };
        return colors[status];
    };
    
    const totalDeclared = myDeclarations
      .filter(d => d.status === DeclarationStatus.APPROVED)
      .reduce((acc, d) => acc + d.declaredAmount, 0);

    return (
        <PageWrapper
            title="Tax Planning"
            actions={
                <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
                    Add Declaration
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card title="Financial Year">
                    <p className="text-3xl font-bold">{new Date().getFullYear()}-{new Date().getFullYear()+1}</p>
                </Card>
                <Card title="My Approved Declarations">
                    <p className="text-3xl font-bold text-green-700">₹{new Intl.NumberFormat('en-IN').format(totalDeclared)}</p>
                </Card>
                 <Card title="My Declaration Status">
                    <div className="flex justify-around">
                        <div className="text-center"><p className="text-2xl font-bold text-yellow-600">{myDeclarations.filter(d => d.status === DeclarationStatus.PENDING).length}</p><p className="text-sm">Pending</p></div>
                        <div className="text-center"><p className="text-2xl font-bold text-green-600">{myDeclarations.filter(d => d.status === DeclarationStatus.APPROVED).length}</p><p className="text-sm">Approved</p></div>
                        <div className="text-center"><p className="text-2xl font-bold text-red-600">{myDeclarations.filter(d => d.status === DeclarationStatus.REJECTED).length}</p><p className="text-sm">Rejected</p></div>
                    </div>
                </Card>
            </div>
            <Card title="My Investment Declarations">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold">Financial Year</th>
                                <th className="p-4 font-semibold">Section</th>
                                <th className="p-4 font-semibold text-right">Declared Amount</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myDeclarations.map(decl => (
                                <tr key={decl.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-800">{decl.financialYear}</td>
                                    <td className="p-4 text-slate-700">{decl.section}</td>
                                    <td className="p-4 text-slate-700 text-right font-mono">₹{new Intl.NumberFormat('en-IN').format(decl.declaredAmount)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(decl.status)}`}>
                                            {decl.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {myDeclarations.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <p>You have not made any declarations yet.</p>
                        </div>
                    )}
                </div>
            </Card>
            <AddDeclarationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addDeclaration}
            />
        </PageWrapper>
    );
};

export default TaxPlanningPage;