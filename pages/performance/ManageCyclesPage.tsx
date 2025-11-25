
import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PerformanceCycle, PerformanceCycleStatus } from '../../types';
import AddCycleModal from '../../components/performance/AddCycleModal';

const ManageCyclesPage: React.FC = () => {
    const { performanceCycles, addPerformanceCycle } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getStatusChip = (status: PerformanceCycleStatus) => {
        const colors: Record<PerformanceCycleStatus, string> = {
            [PerformanceCycleStatus.ACTIVE]: 'bg-green-100 text-green-800',
            [PerformanceCycleStatus.UPCOMING]: 'bg-blue-100 text-blue-800',
            [PerformanceCycleStatus.CLOSED]: 'bg-slate-100 text-slate-800',
        };
        return colors[status];
    };
    
    return (
        <PageWrapper
            title="Performance Cycle Management"
            actions={
                <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
                    Create New Cycle
                </Button>
            }
        >
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 font-semibold">Cycle Name</th>
                                <th className="p-4 font-semibold">Start Date</th>
                                <th className="p-4 font-semibold">End Date</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {performanceCycles.map(cycle => (
                                <tr key={cycle.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-800">{cycle.name}</td>
                                    <td className="p-4 text-slate-700">{new Date(cycle.startDate).toLocaleDateString('en-IN')}</td>
                                    <td className="p-4 text-slate-700">{new Date(cycle.endDate).toLocaleDateString('en-IN')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(cycle.status)}`}>
                                            {cycle.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {isModalOpen && (
                <AddCycleModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={(cycleData) => {
                        addPerformanceCycle(cycleData);
                        setIsModalOpen(false);
                    }}
                />
            )}
        </PageWrapper>
    );
};

export default ManageCyclesPage;
