import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

const NotificationPopover: React.FC<Props> = ({ isOpen, onClose }) => {
    const { notifications, markNotificationAsRead } = useAuth();
    if (!isOpen) return null;
    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
            <div className="p-2 border-b"><h3 className="font-semibold text-sm">Notifications</h3></div>
            <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? <p className="p-4 text-sm text-gray-500">No notifications</p> : 
                    notifications.map(n => (
                        <div key={n.id} className="p-2 hover:bg-gray-50 cursor-pointer" onClick={() => markNotificationAsRead(n.id)}>
                            <p className="text-sm">{n.message}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};
export default NotificationPopover;
