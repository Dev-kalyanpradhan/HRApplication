
import React, { useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Award, ArrowRight } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import { formatRelativeTime } from '../../utils/dateUtils';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const CompanyFeedPage: React.FC = () => {
    const { employees, kudos } = useAuth();
    
    const publicKudos = useMemo(() => {
        return kudos
            .filter(k => k.isPublic)
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [kudos]);

    return (
        <PageWrapper
            title="Company Kudos Feed"
            actions={
                <Link to="/performance/kudos">
                    <Button leftIcon={<Award size={16}/>}>Give Kudos</Button>
                </Link>
            }
        >
            <div className="max-w-3xl mx-auto space-y-6">
                {publicKudos.length > 0 ? (
                    publicKudos.map(kudo => {
                        const giver = employees.find(e => e.id === kudo.giverId);
                        const receiver = employees.find(e => e.id === kudo.receiverId);
                        if (!giver || !receiver) return null;

                        return (
                             <Card key={kudo.id} className="!p-0">
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Avatar name={giver.name} size="md" />
                                        <ArrowRight size={20} className="text-slate-400"/>
                                        <Avatar name={receiver.name} size="md" />
                                        <div className="ml-2">
                                            <p className="text-sm font-semibold text-slate-800">{giver.name} to {receiver.name}</p>
                                            <p className="text-xs text-slate-500">{formatRelativeTime(kudo.timestamp)}</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-700 italic text-center p-4 bg-slate-50 rounded-lg">"{kudo.message}"</p>
                                </div>
                             </Card>
                        )
                    })
                ) : (
                    <Card>
                        <div className="text-center py-20 text-slate-500">
                             <Award size={48} className="mx-auto mb-4 text-slate-400"/>
                             <h2 className="text-2xl font-bold text-slate-800">The Feed is Quiet... For Now</h2>
                             <p className="text-slate-600 mt-2">Be the first to recognize a colleague's great work!</p>
                        </div>
                    </Card>
                )}
            </div>
        </PageWrapper>
    );
};

export default CompanyFeedPage;
