import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { formatRelativeTime } from '../../utils/dateUtils';
import AddAnnouncementModal from '../../components/notice-board/AddAnnouncementModal';
import { Plus, Megaphone } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';

const NoticeBoardPage: React.FC = () => {
    const { currentUser, announcements } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const isAdmin = currentUser?.userRole === UserRole.ADMIN;

    return (
        <PageWrapper
            title="Notice Board"
            actions={
                isAdmin && (
                    <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
                        New Announcement
                    </Button>
                )
            }
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {announcements.length > 0 ? (
                    announcements.map(announcement => (
                        <Card key={announcement.id}>
                            <div className="border-b border-slate-200 pb-4 mb-4">
                                <h2 className="text-xl font-bold text-slate-800">{announcement.title}</h2>
                                <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                                    <Avatar name={announcement.authorName} size="sm" />
                                    <span>Posted by <span className="font-semibold">{announcement.authorName}</span></span>
                                    <span>&bull;</span>
                                    <span>{formatRelativeTime(announcement.createdAt)}</span>
                                </div>
                            </div>
                            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {announcement.content}
                            </p>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <div className="text-center py-20 text-slate-500">
                            <Megaphone size={48} className="mx-auto mb-4 text-slate-400" />
                            <h2 className="text-2xl font-bold text-slate-800">The notice board is empty.</h2>
                            <p className="text-slate-600 mt-2">Check back later for new announcements.</p>
                        </div>
                    </Card>
                )}
            </div>

            {isAdmin && (
                <AddAnnouncementModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </PageWrapper>
    );
};

export default NoticeBoardPage;
