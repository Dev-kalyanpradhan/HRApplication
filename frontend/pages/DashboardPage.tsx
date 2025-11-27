import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    return (
        <PageWrapper title={`Welcome back, ${currentUser?.firstName}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Quick Stats">
                    <p className="text-3xl font-bold text-blue-600">Active</p>
                    <p className="text-sm text-slate-500">Employee Status</p>
                </Card>
                <Card title="Leave Balance">
                     <p className="text-3xl font-bold text-green-600">{currentUser?.leaveBalance.casual}</p>
                     <p className="text-sm text-slate-500">Casual Leaves Available</p>
                </Card>
                <Card title="Pending Tasks">
                    <p className="text-3xl font-bold text-orange-600">0</p>
                    <p className="text-sm text-slate-500">Tasks to review</p>
                </Card>
            </div>
        </PageWrapper>
    );
};
export default DashboardPage;
