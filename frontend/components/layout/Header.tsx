import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, LogOut } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { Employee } from '../../types';
import EmployeeProfileModal from '../employees/EmployeeProfileModal';
import { ALL_LINKS } from '../../constants';
import NotificationPopover from '../notifications/NotificationPopover';

const Header: React.FC = () => {
    const { currentUser, userRole, logout, employees, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Employee[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<Employee | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    
    const [isNotificationPopoverOpen, setIsNotificationPopoverOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const pageTitle = useMemo(() => {
        const currentPath = location.pathname;
        if (currentPath === '/') return 'Home';

        const directMatch = ALL_LINKS.find(link => !link.children && link.path === currentPath);
        if (directMatch) return directMatch.name;
        
        const parentMatch = ALL_LINKS.find(link => 
            link.children?.some(child => currentPath.startsWith(child.path))
        );
        if (parentMatch) return parentMatch.name;
        
        return 'Home'; // Fallback
    }, [location.pathname]);

    const unreadCount = useMemo(() => {
        if (!currentUser) return 0;
        return notifications.filter(n => n.recipientId === currentUser.id && !n.isRead).length;
    }, [notifications, currentUser]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim() === '') {
            setSearchResults([]);
            return;
        }

        const filtered = employees.filter(employee =>
            employee.name.toLowerCase().includes(term.toLowerCase()) ||
            employee.id.toLowerCase().includes(term.toLowerCase())
        );
        setSearchResults(filtered.slice(0, 7)); // Limit results for performance
    };
    
    const handleSelectEmployee = (employee: Employee) => {
        setSelectedProfile(employee);
        setSearchTerm('');
        setSearchResults([]);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchResults([]);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationPopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!currentUser) {
        return <header className="h-16 bg-white border-b border-slate-200" />;
    }

  return (
    <>
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-slate-700 hidden sm:block">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search employee by name or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-slate-100 rounded-full py-2 pl-10 pr-4 w-48 sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {searchResults.length > 0 && (
                  <div className="absolute mt-2 w-full sm:w-80 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                      <ul>
                          {searchResults.map(employee => (
                              <li key={employee.id}>
                                  <button 
                                    onClick={() => handleSelectEmployee(employee)}
                                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                  >
                                      <Avatar name={employee.name} size="md" />
                                      <div>
                                        <p className="font-semibold">{employee.name}</p>
                                        <p className="text-xs text-slate-500">{employee.role}</p>
                                      </div>
                                  </button>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
            </div>
            
            <div className="relative" ref={notificationRef}>
                <button onClick={() => setIsNotificationPopoverOpen(prev => !prev)} className="relative text-slate-500 hover:text-blue-600">
                    <Bell size={22} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                </button>
                {isNotificationPopoverOpen && (
                    <NotificationPopover 
                        isOpen={isNotificationPopoverOpen}
                        onClose={() => setIsNotificationPopoverOpen(false)}
                    />
                )}
            </div>


            <div className="relative">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Avatar name={currentUser.name} size="md" />
                    <div className="hidden sm:block">
                        <p className="font-semibold text-sm">{currentUser.name}</p>
                        <p className="text-xs text-slate-500">{userRole}</p>
                    </div>
                </div>

                {isMenuOpen && (
                    <div 
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5"
                        onMouseLeave={() => setIsMenuOpen(false)}
                    >
                        <button
                            onClick={logout}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                )}
            </div>
          </div>
        </header>

        {selectedProfile && (
            <EmployeeProfileModal
                isOpen={!!selectedProfile}
                onClose={() => setSelectedProfile(null)}
                employee={selectedProfile}
            />
        )}
    </>
  );
};

export default Header;