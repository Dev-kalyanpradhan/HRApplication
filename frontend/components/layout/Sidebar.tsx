import React, { useState, useMemo, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getNavLinks } from '../../constants';
import { Zap, ChevronsLeft, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { currentUser, userRole, companyLogo } = useAuth();
  const location = useLocation();

  const navLinks = useMemo(() => getNavLinks(userRole, currentUser?.functionAccess || []), [userRole, currentUser]);

  const initiallyOpenMenu = useMemo(() => {
    const activeParent = navLinks.find(link => link.children?.some(child => location.pathname.startsWith(child.path)));
    return activeParent ? activeParent.name : null;
  }, [navLinks, location.pathname]);

  const [openMenu, setOpenMenu] = useState<string | null>(initiallyOpenMenu);
  
  useEffect(() => {
    if(isCollapsed) {
        setOpenMenu(null);
    } else {
        setOpenMenu(initiallyOpenMenu);
    }
  }, [isCollapsed, initiallyOpenMenu]);

  const handleMenuClick = (name: string) => {
    if (isCollapsed) return;
    setOpenMenu(openMenu === name ? null : name);
  };
  
  return (
    <div className={`bg-slate-800 text-slate-100 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-16 flex items-center justify-center shrink-0 border-b border-slate-700 px-4">
        {companyLogo ? (
            <img src={companyLogo} alt="Company Logo" className="h-9 w-auto object-contain" />
        ) : (
            <Zap className="text-blue-400" size={24} />
        )}
        {!isCollapsed && <h1 className="text-xl font-bold ml-2 truncate">AI4S Smart HR</h1>}
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
        {navLinks.map((link) => {
          if (!link) return null;

          if (link.children) {
             const isParentActive = link.children.some(child => location.pathname.startsWith(child.path));
            return (
              <div key={link.name}>
                <button
                  onClick={() => handleMenuClick(link.name)}
                  title={isCollapsed ? link.name : undefined}
                  className={`w-full flex items-center rounded-lg transition-colors duration-200 ${isCollapsed ? 'justify-center py-3' : 'px-4 py-2.5'} ${
                    isParentActive && !isCollapsed
                      ? 'bg-slate-700 text-white'
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {link.icon}
                  {!isCollapsed && <span className="ml-4 font-medium flex-1 text-left">{link.name}</span>}
                  {!isCollapsed && <ChevronDown size={16} className={`transition-transform duration-200 ${openMenu === link.name ? 'rotate-180' : ''}`} />}
                </button>
                {openMenu === link.name && !isCollapsed && (
                  <div className="mt-1 pl-8 space-y-1">
                    {link.children.map(child => (
                       <NavLink
                          key={child.name}
                          to={child.path}
                          className={({ isActive }) =>
                            "flex items-center rounded-md transition-colors duration-200 px-4 py-2 text-sm hover:bg-slate-700/50 text-slate-400" +
                            (isActive ? " bg-blue-600/20 text-blue-300 font-semibold" : "")
                          }
                       >
                        {child.name}
                       </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/'}
              title={isCollapsed ? link.name : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-lg transition-colors duration-200 ${isCollapsed ? 'justify-center py-3' : 'px-4 py-2.5'} hover:bg-slate-700 text-slate-300` +
                (isActive ? " bg-blue-600 text-white shadow-md" : "")
              }
            >
              {link.icon}
              {!isCollapsed && <span className="ml-4 font-medium">{link.name}</span>}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-700 shrink-0">
        <button 
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft size={20} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
        {!isCollapsed && <p className="text-xs text-slate-400 text-center mt-4">&copy; 2024 AI4S Corp.</p>}
      </div>
    </div>
  );
};

export default Sidebar;