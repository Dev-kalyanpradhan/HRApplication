
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types';
import { formatRelativeTime } from '../../utils/dateUtils';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { BellOff } from 'lucide-react';

interface NotificationPopoverProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({ isOpen, onClose }) => {
    const { currentUser, notifications, employees, markNotificationAsRead, markAllNotificationsAsRead } = useAuth();
    const navigate = useNavigate();

    const userNotifications = notifications.filter(n => n.recipientId === currentUser?.id);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markNotificationAsRead(notification.id);
        }
        navigate(notification.link);
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl z-50 ring-1 ring-black ring-opacity-5 flex flex-col animate-fade-in-down">
             <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.2s ease-out forwards;
                }
            `}</style>
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
                {userNotifications.some(n => !n.isRead) && (
                    <Button variant="ghost" size="sm" onClick={markAllNotificationsAsRead}>Mark all as read</Button>
                )}
            </div>
            <div className="overflow-y-auto max-h-96">
                {userNotifications.length > 0 ? (
                    userNotifications.map(notification => {
                        const actor = employees.find(e => e.id === notification.actorId);
                        return (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50 border-b border-slate-100 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
                            >
                                {actor ? <Avatar name={actor.name} size="md" /> : <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0"></div>}
                                <div className="flex-1">
                                    <p className="text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: notification.message }}></p>
                                    <p className="text-xs text-blue-600 mt-1">{formatRelativeTime(notification.timestamp)}</p>
                                </div>
                                {!notification.isRead && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1 flex-shrink-0 self-center"></div>}
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-12 px-4 text-slate-500">
                        <BellOff size={32} className="mx-auto mb-3 text-slate-400"/>
                        <p className="font-semibold">No new notifications</p>
                        <p className="text-sm">You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotificationPopover;
