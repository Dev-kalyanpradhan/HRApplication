import React from 'react';
import { LayoutDashboard, Users, CalendarOff, GitFork, Briefcase, Settings, IndianRupee, Plane, CalendarClock, UserPlus, FileText, Send, Building, ShieldCheck, Filter, UserCheck, Calculator, UserSearch, Landmark, HandCoins, Gift, PiggyBank, Pencil, ClipboardCheck, TrendingUp, Award, MessageSquare, Star, Recycle, Folder, ClipboardList, GraduationCap, HeartPulse, ClipboardEdit, Fingerprint, Database, Receipt, Megaphone } from 'lucide-react';
import { UserRole } from './types';

export const ALL_LINKS = [
  { name: 'Home', path: '/', icon: <LayoutDashboard size={20} />, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { name: 'Notice Board', path: '/notice-board', icon: <Megaphone size={20} />, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { 
    name: 'Employees Management', 
    icon: <Users size={20} />, 
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      { name: 'Employee Directory', path: '/employees', roles: [UserRole.ADMIN, UserRole.MANAGER], icon: <UserSearch size={16} /> },
      { name: 'Organizational Chart', path: '/hierarchy', roles: [UserRole.ADMIN, UserRole.MANAGER], icon: <GitFork size={16} /> },
    ]
  },
  {
    name: 'Lifecycle',
    icon: <Recycle size={20} />,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE],
    children: [
      { name: 'My Tasks', path: '/lifecycle/my-tasks', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE], icon: <ClipboardList size={16} /> },
      { name: 'Onboarding', path: '/lifecycle/onboarding', roles: [UserRole.ADMIN, UserRole.MANAGER], icon: <UserPlus size={16} /> },
      { name: 'Offboarding', path: '/lifecycle/offboarding', roles: [UserRole.ADMIN, UserRole.MANAGER], icon: <Users size={16} /> },
      { name: 'Document Hub', path: '/lifecycle/document-hub', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE], icon: <Folder size={16} /> },
    ]
  },
  { 
    name: 'Leave Management', 
    icon: <CalendarOff size={20} />, 
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE],
    children: [
      { name: 'My Requests & Balances', path: '/leave/requests', roles: [UserRole.EMPLOYEE] },
      { name: 'Leave Balances', path: '/leave/balances', roles: [UserRole.ADMIN, UserRole.MANAGER], icon: <Users size={16} /> },
      { name: 'Apply for Leave', path: '/leave/apply', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
    ]
  },
   { 
    name: 'Employee Requests', 
    icon: <ClipboardCheck size={20} />, 
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      { name: 'Leave Requests', path: '/leave/requests', roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { name: 'Travel Requests', path: '/travel/requests', roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { name: 'Expense Approvals', path: '/requests/expenses', roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { name: 'Salary Approvals', path: '/requests/salary', roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { name: 'Declaration Approvals', path: '/requests/declarations', roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { name: 'Confirmation Approvals', path: '/requests/confirmation', roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { name: 'Attendance Corrections', path: '/requests/attendance', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    ]
  },
  { 
    name: 'Attendance', 
    icon: <CalendarClock size={20} />, 
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE],
    children: [
      { name: 'Dashboard', path: '/attendance/dashboard', roles: [UserRole.ADMIN, UserRole.MANAGER], icon: <LayoutDashboard size={16} /> },
      { name: 'My Attendance', path: '/attendance/my-attendance', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE], icon: <Fingerprint size={16}/> },
      { name: 'Apply for On-Duty', path: '/attendance/apply-od', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
      { name: 'Apply for Correction', path: '/attendance/apply-correction', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE], icon: <ClipboardEdit size={16}/> },
      { name: 'Attendance Admin', path: '/attendance/admin', roles: [UserRole.ADMIN] },
    ]
  },
  { 
    name: 'Travel', 
    icon: <Plane size={20} />, 
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE],
    children: [
      { name: 'Travel Requests', path: '/travel/requests', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
      { name: 'Apply for Travel', path: '/travel/apply', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
    ]
  },
  {
    name: 'Expense Management',
    icon: <Receipt size={20} />,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE],
    children: [
      { name: 'My Expenses', path: '/expenses/my-requests', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
      { name: 'Apply for Expense', path: '/expenses/apply', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
    ]
  },
  {
    name: 'Recruitment',
    icon: <Briefcase size={20} />,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE], // Broadened for 'My Interviews'
    children: [
        { name: 'Candidate Pipeline', path: '/recruitment/pipeline', roles: [UserRole.ADMIN], icon: <Filter size={16}/> },
        { name: 'My Interviews', path: '/recruitment/my-interviews', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE], icon: <UserCheck size={16}/> },
        { name: 'Add Candidate', path: '/recruitment/add', roles: [UserRole.ADMIN], icon: <UserPlus size={16}/> },
    ]
  },
  {
    name: 'Performance',
    icon: <TrendingUp size={20} />,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE],
    children: [
        { name: 'My Goals & Reviews', path: '/performance/my-goals', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE], icon: <Star size={16}/> },
        { name: 'Team Reviews', path: '/performance/team-reviews', roles: [UserRole.ADMIN, UserRole.MANAGER], icon: <Users size={16}/> },
        { name: 'Give Kudos', path: '/performance/kudos', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE], icon: <Award size={16}/> },
        { name: 'Company Feed', path: '/performance/feed', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE], icon: <MessageSquare size={16}/> },
        { name: 'Manage Cycles', path: '/performance/cycles', roles: [UserRole.ADMIN], icon: <Settings size={16}/> },
    ]
  },
  {
    name: 'Learning',
    icon: <GraduationCap size={20} />,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE],
    children: [
        { name: 'My Learning', path: '/learning/my-courses', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE], icon: <ClipboardList size={16}/> },
        { name: 'Team Learning', path: '/learning/team-progress', roles: [UserRole.ADMIN, UserRole.MANAGER], icon: <Users size={16}/> },
    ]
  },
   { 
    name: 'My Finance', 
    icon: <PiggyBank size={20} />, 
    roles: [UserRole.EMPLOYEE, UserRole.MANAGER],
    children: [
      { name: 'My Payslips', path: '/finance/my-payslips', roles: [UserRole.EMPLOYEE, UserRole.MANAGER], icon: <FileText size={16} /> },
      { name: 'Tax Planning', path: '/finance/tax-planning', roles: [UserRole.EMPLOYEE, UserRole.MANAGER], icon: <Calculator size={16} /> },
    ]
  },
  {
    name: 'Payroll',
    icon: <IndianRupee size={20} />,
    roles: [UserRole.ADMIN],
    children: [
        { name: 'Run Payroll', path: '/payroll/run', roles: [UserRole.ADMIN], icon: <Send size={16} /> },
        { name: 'CTC Calculator', path: '/payroll/calculator', roles: [UserRole.ADMIN], icon: <Calculator size={16} /> },
        { name: 'Salary Assignment', path: '/payroll/assignment', roles: [UserRole.ADMIN], icon: <Pencil size={16} /> },
        { name: 'Loan Management', path: '/payroll/loans', roles: [UserRole.ADMIN], icon: <HandCoins size={16} /> },
        { name: 'Variable Pay', path: '/payroll/variable-pay', roles: [UserRole.ADMIN], icon: <Gift size={16} /> },
        { name: 'Statutory Reports', path: '/payroll/reports', roles: [UserRole.ADMIN], icon: <Landmark size={16} /> },
        { name: 'History', path: '/payroll/history', roles: [UserRole.ADMIN], icon: <FileText size={16} /> },
    ]
  },
  {
    name: 'Core HR',
    icon: <Settings size={20} />,
    roles: [UserRole.ADMIN],
    children: [
        { name: 'Access Control', path: '/core-hr/access', roles: [UserRole.ADMIN], icon: <ShieldCheck size={16}/> },
        { name: 'Company Settings', path: '/core-hr/settings', roles: [UserRole.ADMIN], icon: <Building size={16}/> },
        { name: 'SQL Editor', path: '/core-hr/sql-editor', roles: [UserRole.ADMIN], icon: <Database size={16}/> },
    ]
  },
];


export const ALL_FUNCTIONS = ALL_LINKS.flatMap(l => l.children ? [l.name, ...l.children.map(c => c.name)] : [l.name]);

export const MANAGER_DEFAULT_ACCESS = [
    'Home', 'Notice Board', 'Employees Management', 'Employee Directory', 'Organizational Chart', 
    'Lifecycle', 'My Tasks', 'Onboarding', 'Offboarding', 'Document Hub',
    'My Finance', 'My Payslips', 'Tax Planning',
    'Leave Management', 'Apply for Leave', 'Leave Balances',
    'Attendance', 'Dashboard', 'My Attendance', 'Apply for On-Duty', 'Apply for Correction',
    'Travel', 'Apply for Travel', 'Travel Requests',
    'Expense Management', 'My Expenses', 'Apply for Expense',
    'Recruitment', 'My Interviews',
    'Performance', 'My Goals & Reviews', 'Team Reviews', 'Give Kudos', 'Company Feed',
    'Learning', 'My Learning', 'Team Learning',
    'Employee Requests', 'Leave Requests', 'Travel Requests', 'Expense Approvals', 'Salary Approvals', 'Declaration Approvals', 'Confirmation Approvals', 'Attendance Corrections'
];
export const EMPLOYEE_DEFAULT_ACCESS = [
    'Home', 'Notice Board',
    'Lifecycle', 'My Tasks', 'Document Hub',
    'My Finance', 'My Payslips', 'Tax Planning',
    'Leave Management', 'My Requests & Balances', 'Apply for Leave',
    'Attendance', 'My Attendance', 'Apply for On-Duty', 'Apply for Correction',
    'Travel', 'Travel Requests', 'Apply for Travel',
    'Expense Management', 'My Expenses', 'Apply for Expense',
    'Recruitment', 'My Interviews',
    'Performance', 'My Goals & Reviews', 'Give Kudos', 'Company Feed',
    'Learning', 'My Learning'
];


export const getNavLinks = (role: UserRole, accessList: string[] = []) => {
  if (role === UserRole.ADMIN) {
     const links = ALL_LINKS.filter(link => {
        // Hide "My Finance" from Admin, but show everything else
        return link.name !== 'My Finance';
     });
     return links.map(link => {
        if(link.children) {
            return {...link, children: link.children.filter(child => child.roles.includes(role))};
        }
        return link;
    }).filter(link => link && (link.children ? link.children.length > 0 : true));
  }
  
  // For other roles, filter based on accessList
  const filteredLinks = ALL_LINKS.filter(link => accessList.includes(link.name));
  
  return filteredLinks.map(link => {
      if(link.children) {
          const accessibleChildren = link.children.filter(child => accessList.includes(child.name) && child.roles.includes(role));
          // Only show parent if it has at least one accessible child
          return accessibleChildren.length > 0 ? { ...link, children: accessibleChildren } : null;
      }
      return link;
  }).filter(link => link !== null) as (typeof ALL_LINKS[number])[];
};


export const INDIAN_HOLIDAYS = [
  { date: '2024-01-26', name: 'Republic Day' },
  { date: '2024-03-25', name: 'Holi' },
  { date: '2024-04-11', name: 'Eid-ul-Fitr' },
  { date: '2024-08-15', name: 'Independence Day' },
  { date: '2024-10-02', name: 'Gandhi Jayanti' },
  { date: '2024-10-31', name: 'Diwali' },
  { date: '2024-12-25', 'name': 'Christmas Day' },
];