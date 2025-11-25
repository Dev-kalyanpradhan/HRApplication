import React from 'react';
import Card from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Megaphone, ArrowRight } from 'lucide-react';
import { formatRelativeTime } from '../../utils/dateUtils';

const RecentAnnouncementsCard: React.FC = () => {
    const { announcements } = useAuth();
    const recentAnnouncements = announcements.slice(0, 3);

    return (
        <Card title="Recent Announcements" actions={<Megaphone size={20} className="text-blue-500" />}>
            {recentAnnouncements.length > 0 ? (
                <div className="space-y-4">
                    {recentAnnouncements.map(announcement => (
                        <div key={announcement.id} className="pb-3 border-b border-slate-100 last:border-b-0">
                            <Link to="/notice-board" className="block hover:bg-slate-50 -m-2 p-2 rounded-lg">
                                <p className="font-semibold text-sm text-slate-800">{announcement.title}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    By {announcement.authorName} &bull; {formatRelativeTime(announcement.createdAt)}
                                </p>
                            </Link>
                        </div>
                    ))}
                    <Link to="/notice-board" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 pt-2">
                        View All Announcements <ArrowRight size={14} />
                    </Link>
                </div>
            ) : (
                <p className="text-center py-4 text-sm text-slate-500">No announcements yet.</p>
            )}
        </Card>
    );
};

export default RecentAnnouncementsCard;
