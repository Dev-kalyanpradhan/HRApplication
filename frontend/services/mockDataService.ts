import { Employee, UserRole, EmploymentType, WorkLocation, ConfirmationStatus } from '../types';

export const mockEmployees: Employee[] = [
  {
    id: 'AI4S001',
    password: 'password',
    firstName: 'Admin',
    lastName: 'User',
    name: 'Admin User',
    email: 'admin@ai4s.com',
    role: 'Administrator',
    userRole: UserRole.ADMIN,
    department: 'Administration',
    reportingManagerId: null,
    functionalManagerId: null,
    joiningDate: '2023-01-01',
    workLocation: WorkLocation.OFFICE,
    leaveBalance: { casual: 10, sick: 10, earned: 10 },
    functionAccess: [],
    employmentType: EmploymentType.REGULAR,
    confirmationStatus: ConfirmationStatus.CONFIRMED,
    ctc: 1000000
  }
];

export const mockAttendance = [];
export const mockPayrollHistory = [];
export const mockLeaveRequests = [];
export const mockTravelRequests = [];
export const mockExpenseRequests = [];
export const mockCandidates = [];
export const mockInvestmentDeclarations = [];
export const mockEmployeeLoans = [];
export const mockVariablePayments = [];
export const mockSalaryChangeRequests = [];
export const mockNotifications = [];
export const mockPerformanceCycles = [];
export const mockGoals = [];
export const mockPerformanceReviews = [];
export const mockKudos = [];
export const mockWorkflows = [];
export const mockEmployeeDocuments = [];
export const mockLearningAssignments = [];
export const mockPunchRecords = [];
export const mockConfirmationRequests = [];
export const mockAttendanceCorrectionRequests = [];
export const mockAnnouncements = [];

interface TaskTemplate {
    name: string;
    assigneeRole: UserRole;
    dueDate: string;
    assigneeId?: string;
}

export const onboardingTemplate: TaskTemplate[] = [
    { name: 'Setup Email', assigneeRole: UserRole.ADMIN, dueDate: 'D-1' },
    { name: 'Assign Laptop', assigneeRole: UserRole.ADMIN, dueDate: 'D-1' },
    { name: 'Welcome Kit', assigneeRole: UserRole.ADMIN, dueDate: 'D0' },
];

export const offboardingTemplate: TaskTemplate[] = [
    { name: 'Revoke Access', assigneeRole: UserRole.ADMIN, dueDate: 'D0' },
    { name: 'Collect Assets', assigneeRole: UserRole.ADMIN, dueDate: 'D0' },
];
