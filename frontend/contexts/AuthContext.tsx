import React, { createContext, useState, useContext, useMemo, ReactNode, useCallback } from 'react';
import { Employee, UserRole, AttendanceRecord, AttendanceStatus, PayrollRecord, LeaveRequest, LeaveStatus, TravelRequest, TravelStatus, Candidate, Interview, InterviewStatus, InterviewResult, SalaryComponent, InvestmentDeclaration, DeclarationStatus, EmployeeLoan, LoanStatus, VariablePayment, SalaryChangeRequest, SalaryChangeStatus, Notification, PerformanceCycle, Goal, PerformanceReview, Kudos, PerformanceCycleStatus, GoalStatus, ReviewStatus, Workflow, Task, EmployeeDocument, WorkflowType, WorkflowStatus, TaskStatus, DocumentStatus, LearningAssignment, LearningStatus, PunchRecord, LeaveType, EmploymentType, ConfirmationStatus, ConfirmationRequest, AttendanceCorrectionRequest, AttendanceCorrectionStatus, ExpenseRequest, ExpenseStatus, Announcement } from '../types';
import { mockEmployees, mockAttendance, mockPayrollHistory, mockLeaveRequests, mockTravelRequests, mockCandidates, mockInvestmentDeclarations, mockEmployeeLoans, mockVariablePayments, mockSalaryChangeRequests, mockNotifications, mockPerformanceCycles, mockGoals, mockPerformanceReviews, mockKudos, mockWorkflows, mockEmployeeDocuments, onboardingTemplate, offboardingTemplate, mockLearningAssignments, mockPunchRecords, mockConfirmationRequests, mockAttendanceCorrectionRequests, mockExpenseRequests, mockAnnouncements } from '../services/mockDataService';
import { ALL_FUNCTIONS, MANAGER_DEFAULT_ACCESS, EMPLOYEE_DEFAULT_ACCESS } from '../constants';
import { getLeaveDurationInDays } from '../utils/dateUtils';

const initialDepartments = ["Engineering", "Product", "Design", "Sales", "Marketing", "HR", "Executive", "Technology", "Functional", "Technical"];
const initialRoles = ["Software Engineer", "Senior Software Engineer", "Product Manager", "UI/UX Designer", "Sales Executive", "Marketing Specialist", "HR Manager", "Engineering Manager", "CEO", "CTO", "HR Executive", "Sales Manager", "Chief Executive Officer(CEO)", "Senior FICO/MM Consultant", "Associate MM Consultant", "SAP BTP Solution Architect", "Administration", "Chief Development Officer(CDO)", "Project Manager", "SAP Cloud ALM Administrator", "Developer Admin", "SAP Build App Developer", "SAP Full Stack Solution Developer", "Associate FICO Consultant", "SAP Cloud Platform & System Architect", "SAP Integration Architect", "Functional Lead"];

const initialSalaryComponents: SalaryComponent[] = [
  { id: 'c1', name: 'Basic', type: 'earning', calculationType: 'percentage_ctc', value: 40, isEditable: true, order: 1 },
  { id: 'c2', name: 'HRA', type: 'earning', calculationType: 'percentage_basic', value: 50, isEditable: true, order: 2 },
  { id: 'c3', name: 'Special Allowance', type: 'earning', calculationType: 'balance_component', value: 0, isEditable: false, order: 100 },
  { id: 'c4', name: 'Provident Fund', type: 'deduction', calculationType: 'percentage_basic', value: 12, isEditable: true, order: 201 },
  { id: 'c5', name: 'Professional Tax', type: 'deduction', calculationType: 'fixed_amount', value: 200, isEditable: false, order: 202 },
  // A simplified income tax for calculation purposes
  { id: 'c6', name: 'Income Tax (TDS)', type: 'deduction', calculationType: 'percentage_ctc', value: 5, isEditable: true, order: 203 }
];


interface AuthContextType {
  currentUser: Employee | null;
  userRole: UserRole;
  employees: Employee[];
  attendance: AttendanceRecord[];
  payrollHistory: PayrollRecord[];
  leaveRequests: LeaveRequest[];
  travelRequests: TravelRequest[];
  expenseRequests: ExpenseRequest[];
  candidates: Candidate[];
  declarations: InvestmentDeclaration[];
  loans: EmployeeLoan[];
  variablePayments: VariablePayment[];
  salaryChangeRequests: SalaryChangeRequest[];
  confirmationRequests: ConfirmationRequest[];
  attendanceCorrectionRequests: AttendanceCorrectionRequest[];
  notifications: Notification[];
  announcements: Announcement[];
  performanceCycles: PerformanceCycle[];
  goals: Goal[];
  reviews: PerformanceReview[];
  kudos: Kudos[];
  workflows: Workflow[];
  employeeDocuments: EmployeeDocument[];
  learningAssignments: LearningAssignment[];
  punchRecords: PunchRecord[];
  departments: string[];
  roles: string[];
  salaryComponents: SalaryComponent[];
  companyLogo: string | null;
  updateCompanyLogo: (logoDataUrl: string | null) => void;
  updateSalaryComponents: (newComponents: SalaryComponent[]) => void;
  addDepartment: (department: string) => void;
  addRole: (role: string) => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'leaveBalance' | 'functionAccess'>) => void;
  updateEmployee: (updatedEmployee: Employee) => void;
  updateEmployeeAccess: (employeeId: string, access: string[]) => void;
  updateAttendance: (employeeId: string, date: string, status: AttendanceStatus) => void;
  bulkUpdateAttendance: (recordsForMonth: AttendanceRecord[], year: number, month: number) => void;
  markAttendanceAndDeductLeave: (employeeId: string, date: string, leaveType: LeaveType) => void;
  updateLeaveBalance: (employeeId: string, newBalance: { casual: number; sick: number; earned: number; }) => void;
  markDayAsHoliday: (date: string) => void;
  markDayAsWeekOff: (date: string) => void;
  markDayAsWorking: (date: string) => void;
  resetPassword: (employeeId: string, newPassword: string) => void;
  postNewPayrollBatch: (newRecords: PayrollRecord[], year: number, month: number) => void;
  addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'employeeName' | 'status' | 'employeeId' | 'submissionDate'>) => void;
  updateLeaveRequestStatus: (id: string, newStatus: LeaveStatus) => void;
  addTravelRequest: (request: Omit<TravelRequest, 'id' | 'employeeName' | 'status' | 'employeeId' | 'submissionDate'>) => void;
  updateTravelRequestStatus: (id: string, newStatus: TravelStatus) => void;
  addExpenseRequest: (request: Omit<ExpenseRequest, 'id' | 'employeeName' | 'status' | 'employeeId' | 'submissionDate'>) => void;
  updateExpenseRequestStatus: (id: string, newStatus: ExpenseStatus) => void;
  addCandidateAndScheduleInterview: (candidateData: Omit<Candidate, 'id' | 'interviews' | 'submittedBy' | 'submittedAt'>, interviewData: Omit<Interview, 'id' | 'status' | 'interviewerName'>) => void;
  submitInterviewFeedback: (candidateId: string, interviewId: string, feedback: string, result: InterviewResult) => void;
  addDeclaration: (declaration: Omit<InvestmentDeclaration, 'id' | 'employeeId' | 'status' | 'proofAttached'>) => void;
  updateDeclarationStatus: (id: string, newStatus: DeclarationStatus) => void;
  addLoan: (loan: Omit<EmployeeLoan, 'id' | 'status' | 'repayments' | 'endDate'>) => void;
  addVariablePayment: (payment: Omit<VariablePayment, 'id'>) => void;
  requestSalaryChange: (employeeId: string, newCtc: number) => Promise<void>;
  updateSalaryChangeStatus: (requestId: string, newStatus: SalaryChangeStatus.APPROVED | SalaryChangeStatus.REJECTED) => void;
  initiateConfirmation: (employeeId: string) => void;
  updateConfirmationRequestStatus: (requestId: string, decision: 'approve' | 'reject') => void;
  addAttendanceCorrectionRequest: (requestData: Omit<AttendanceCorrectionRequest, 'id' | 'employeeId' | 'employeeName' | 'status' | 'submissionDate'>) => void;
  updateAttendanceCorrectionRequestStatus: (requestId: string, newStatus: AttendanceCorrectionStatus) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  addAnnouncement: (title: string, content: string) => void;
  addPerformanceCycle: (cycle: Omit<PerformanceCycle, 'id'|'status'>) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  submitReview: (review: Omit<PerformanceReview, 'id'|'status'>, isManagerReview: boolean) => void;
  giveKudos: (kudos: Omit<Kudos, 'id'|'timestamp'|'giverId'>) => void;
  initiateOffboarding: (employeeId: string, lastWorkingDay: string, reason: string) => void;
  updateTaskStatus: (workflowId: string, taskId: string, status: TaskStatus) => void;
  uploadDocument: (doc: Omit<EmployeeDocument, 'id' | 'status' | 'submittedAt' | 'verifiedAt' | 'rejectionReason'>) => void;
  verifyDocument: (docId: string, status: DocumentStatus.VERIFIED | DocumentStatus.REJECTED, reason?: string) => void;
  assignLearning: (assignmentData: Omit<LearningAssignment, 'id'|'assignedById'|'assignedAt'|'status'|'completedAt'>) => void;
  updateLearningStatus: (assignmentId: string, newStatus: LearningStatus) => void;
  addPunch: (type: 'in' | 'out') => void;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const leaveTypeToBalanceKey = (leaveType: LeaveType): keyof Employee['leaveBalance'] | null => {
    switch (leaveType) {
        case LeaveType.CASUAL: return 'casual';
        case LeaveType.SICK: return 'sick';
        case LeaveType.EARNED: return 'earned';
        default: return null;
    }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>(mockPayrollHistory);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>(mockTravelRequests);
  const [expenseRequests, setExpenseRequests] = useState<ExpenseRequest[]>(mockExpenseRequests);
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [declarations, setDeclarations] = useState<InvestmentDeclaration[]>(mockInvestmentDeclarations);
  const [loans, setLoans] = useState<EmployeeLoan[]>(mockEmployeeLoans);
  const [variablePayments, setVariablePayments] = useState<VariablePayment[]>(mockVariablePayments);
  const [salaryChangeRequests, setSalaryChangeRequests] = useState<SalaryChangeRequest[]>(mockSalaryChangeRequests);
  const [confirmationRequests, setConfirmationRequests] = useState<ConfirmationRequest[]>(mockConfirmationRequests);
  const [attendanceCorrectionRequests, setAttendanceCorrectionRequests] = useState<AttendanceCorrectionRequest[]>(mockAttendanceCorrectionRequests);
  const [departments, setDepartments] = useState<string[]>(initialDepartments);
  const [roles, setRoles] = useState<string[]>(initialRoles);
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>(initialSalaryComponents);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [companyLogo, setCompanyLogo] = useState<string | null>(() => localStorage.getItem('companyLogo'));


  // Performance Management State
  const [performanceCycles, setPerformanceCycles] = useState<PerformanceCycle[]>(mockPerformanceCycles);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [reviews, setReviews] = useState<PerformanceReview[]>(mockPerformanceReviews);
  const [kudos, setKudos] = useState<Kudos[]>(mockKudos);

  // Lifecycle Management State
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocument[]>(mockEmployeeDocuments);
  
  // Learning State
  const [learningAssignments, setLearningAssignments] = useState<LearningAssignment[]>(mockLearningAssignments);

  // Punch Records State
  const [punchRecords, setPunchRecords] = useState<PunchRecord[]>(mockPunchRecords);


  const userRole = useMemo(() => {
    return currentUser ? currentUser.userRole : UserRole.EMPLOYEE;
  }, [currentUser]);
  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => {
    const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random()}`,
        isRead: false,
        timestamp: new Date().toISOString(),
    };
    // Add to top of list
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
      if (!currentUser) return;
      setNotifications(prev => prev.map(n => n.recipientId === currentUser.id ? { ...n, isRead: true } : n));
  }, [currentUser]);


  const login = useCallback(async (employeeCode: string, password: string): Promise<void> => {
    const user = employees.find(e => e.id.toLowerCase() === employeeCode.toLowerCase());
    
    if (user && user.password === password) {
      setCurrentUser(user);
    } else {
      throw new Error("Invalid credentials. Please check your Employee Code and Password.");
    }
  }, [employees]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);
  
  const updateCompanyLogo = useCallback((logoDataUrl: string | null) => {
      if (logoDataUrl) {
          localStorage.setItem('companyLogo', logoDataUrl);
          setCompanyLogo(logoDataUrl);
      } else {
          localStorage.removeItem('companyLogo');
          setCompanyLogo(null);
      }
  }, []);

  const updateSalaryComponents = useCallback((newComponents: SalaryComponent[]) => {
      setSalaryComponents(newComponents);
  }, []);

  const addDepartment = useCallback((department: string) => {
    if (department && !departments.includes(department)) {
        setDepartments(prev => [...prev, department].sort());
    }
  }, [departments]);

  const addRole = useCallback((role: string) => {
      if (role && !roles.includes(role)) {
          setRoles(prev => [...prev, role].sort());
      }
  }, [roles]);

  const initiateOnboarding = useCallback((newEmployee: Employee) => {
    const workflowId = `wf_onboard_${newEmployee.id}`;
    const tasks: Task[] = onboardingTemplate.map((taskTemplate, i) => {
        let assigneeId: string | undefined = undefined;
        if(taskTemplate.assigneeRole === UserRole.MANAGER) {
            assigneeId = newEmployee.reportingManagerId || undefined;
        } else if (taskTemplate.assigneeRole === UserRole.EMPLOYEE) {
            assigneeId = newEmployee.id;
        } else {
            assigneeId = taskTemplate.assigneeId; // For specific assignees like IT/HR persons
        }

        const newTask: Task = {
            ...taskTemplate,
            id: `task_${workflowId}_${i}`,
            workflowId: workflowId,
            status: TaskStatus.PENDING,
            assigneeId: assigneeId
        };

        if (assigneeId) {
            addNotification({
                recipientId: assigneeId,
                actorId: 'AI4S001', // System
                message: `New Onboarding Task: "${newTask.name}" for ${newEmployee.name}.`,
                link: '/lifecycle/my-tasks'
            });
        }
        return newTask;
    });

    const newWorkflow: Workflow = {
        id: workflowId,
        employeeId: newEmployee.id,
        type: WorkflowType.ONBOARDING,
        status: WorkflowStatus.IN_PROGRESS,
        startDate: newEmployee.joiningDate,
        tasks: tasks,
    };
    setWorkflows(prev => [newWorkflow, ...prev]);

    // Create required documents
    const requiredDocs = ['Aadhaar Card', 'PAN Card', 'Bank Account Proof', 'Educational Certificates', 'Previous Employment Relieving Letter', 'Signed Offer Letter', 'NDA Acknowledgment'];
    const newDocs: EmployeeDocument[] = requiredDocs.map((docName, i) => ({
        id: `doc_${newEmployee.id}_${i}`,
        employeeId: newEmployee.id,
        documentName: docName,
        status: DocumentStatus.PENDING,
    }));
    setEmployeeDocuments(prev => [...prev, ...newDocs]);
    
  }, [addNotification]);


  const addEmployee = useCallback((employeeData: Omit<Employee, 'id' | 'leaveBalance' | 'functionAccess'>) => {
    let newEmployee: Employee | null = null;
    setEmployees(prev => {
        let functionAccess: string[];
        if (employeeData.userRole === UserRole.ADMIN) {
            functionAccess = ALL_FUNCTIONS;
        } else if (employeeData.userRole === UserRole.MANAGER) {
            functionAccess = MANAGER_DEFAULT_ACCESS;
        } else {
            functionAccess = EMPLOYEE_DEFAULT_ACCESS;
        }

        newEmployee = {
            ...employeeData,
            id: `AI4S_NEW_${prev.length + 1}`, // Generate a unique ID
            leaveBalance: { casual: 12, sick: 10, earned: 15 }, // Default balance
            functionAccess,
        };
        return [...prev, newEmployee];
    });
    
    // This needs to run after state update, but for mock, we can assume it's synchronous
    setTimeout(() => {
        if(newEmployee) {
            initiateOnboarding(newEmployee);
        }
    }, 0);

  }, [initiateOnboarding]);

  const updateEmployee = useCallback((updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    if (currentUser && currentUser.id === updatedEmployee.id) {
        setCurrentUser(updatedEmployee);
    }
  }, [currentUser]);

  const updateEmployeeAccess = useCallback((employeeId: string, access: string[]) => {
    setEmployees(prev => prev.map(emp => 
        emp.id === employeeId ? { ...emp, functionAccess: access } : emp
    ));
  }, []);
  
  const resetPassword = useCallback((employeeId: string, newPassword: string) => {
    setEmployees(prev => prev.map(emp =>
      emp.id === employeeId ? { ...emp, password: newPassword } : emp
    ));
  }, []);

  const updateAttendance = useCallback((employeeId: string, date: string, status: AttendanceStatus) => {
    setAttendance(prev => {
        const recordIndex = prev.findIndex(rec => rec.employeeId === employeeId && rec.date === date);
        if (recordIndex > -1) {
            const newAttendance = [...prev];
            newAttendance[recordIndex] = { ...newAttendance[recordIndex], status: status };
            return newAttendance;
        } else {
            const newRecord: AttendanceRecord = {
                id: `${employeeId}-${date}`,
                employeeId,
                date,
                status,
            };
            return [...prev, newRecord];
        }
    });
  }, []);

  const bulkUpdateAttendance = useCallback((recordsForMonth: AttendanceRecord[], year: number, month_one_indexed: number) => {
    setAttendance(prev => {
        const otherMonthsRecords = prev.filter(r => {
            const recordDate = new Date(r.date);
            return !(recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month_one_indexed);
        });
        return [...otherMonthsRecords, ...recordsForMonth];
    });
  }, []);
  
  const setGlobalDayStatus = useCallback((date: string, status: AttendanceStatus.HOLIDAY | AttendanceStatus.WEEK_OFF) => {
      setAttendance(prev => {
          const updatedAttendance = [...prev];
          employees.forEach(emp => {
              const recordIndex = updatedAttendance.findIndex(rec => rec.employeeId === emp.id && rec.date === date);
              const newRecord: AttendanceRecord = { id: `${emp.id}-${date}`, employeeId: emp.id, date, status };
              if (recordIndex > -1) {
                  // Don't overwrite an existing leave request
                  if (updatedAttendance[recordIndex].status !== AttendanceStatus.ON_LEAVE) {
                      updatedAttendance[recordIndex] = newRecord;
                  }
              } else {
                  updatedAttendance.push(newRecord);
              }
          });
          return updatedAttendance;
      });
  }, [employees]);

  const markDayAsHoliday = useCallback((date: string) => {
      setGlobalDayStatus(date, AttendanceStatus.HOLIDAY);
  }, [setGlobalDayStatus]);

  const markDayAsWeekOff = useCallback((date: string) => {
      setGlobalDayStatus(date, AttendanceStatus.WEEK_OFF);
  }, [setGlobalDayStatus]);

  const markDayAsWorking = useCallback((date: string) => {
    setAttendance(prev => prev.map(rec => {
        if (rec.date === date && (rec.status === AttendanceStatus.HOLIDAY || rec.status === AttendanceStatus.WEEK_OFF)) {
            return { ...rec, status: AttendanceStatus.ABSENT };
        }
        return rec;
    }));
  }, []);
  
  const markAttendanceAndDeductLeave = useCallback((employeeId: string, date: string, leaveType: LeaveType) => {
    // 1. Deduct leave from employee
    setEmployees(prev => prev.map(emp => {
        if (emp.id === employeeId) {
            const newBalance = { ...emp.leaveBalance };
            const balanceKey = leaveTypeToBalanceKey(leaveType);
            if(balanceKey && newBalance[balanceKey] > 0){
                newBalance[balanceKey] -= 1;
            } else {
                return emp; // Do not deduct if balance is 0 or type is not deductible
            }
           
            if(currentUser && currentUser.id === employeeId) {
                setCurrentUser(prevUser => prevUser ? ({...prevUser, leaveBalance: newBalance}) : null);
            }
            return { ...emp, leaveBalance: newBalance };
        }
        return emp;
    }));

    // 2. Update attendance record to 'On Leave'
    updateAttendance(employeeId, date, AttendanceStatus.ON_LEAVE);
}, [updateAttendance, currentUser]);

  const updateLeaveBalance = useCallback((employeeId: string, newBalance: { casual: number; sick: number; earned: number; }) => {
    setEmployees(prev => prev.map(emp => {
        if (emp.id === employeeId) {
            const updatedEmployee = { ...emp, leaveBalance: newBalance };
            if (currentUser && currentUser.id === employeeId) {
                setCurrentUser(prevUser => prevUser ? { ...prevUser, leaveBalance: newBalance } : null);
            }
            return updatedEmployee;
        }
        return emp;
    }));
  }, [currentUser]);


  const postNewPayrollBatch = useCallback((newRecords: PayrollRecord[], year: number, month: number) => {
    setPayrollHistory(prev => {
      const otherRecords = prev.filter(p => !(p.year === year && p.month === month));
      return [...otherRecords, ...newRecords];
    });
  }, []);
  
  const addLeaveRequest = useCallback((request: Omit<LeaveRequest, 'id' | 'employeeName' | 'status' | 'employeeId' | 'submissionDate'>) => {
    if (!currentUser) return;
    
    const duration = getLeaveDurationInDays(request.startDate, request.endDate);
    const balanceKey = leaveTypeToBalanceKey(request.leaveType);

    if (balanceKey) {
        const currentBalance = currentUser.leaveBalance[balanceKey];
        if (currentBalance < duration) {
            throw new Error(`Insufficient leave balance. You have ${currentBalance} day(s) but are requesting ${duration}.`);
        }
    }

    const newRequest: LeaveRequest = {
        ...request,
        id: `lr_${Date.now()}`,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        status: LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL,
        submissionDate: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests(prev => [newRequest, ...prev]);
    const manager = employees.find(e => e.id === currentUser.reportingManagerId);
    if(manager){
        addNotification({
            recipientId: manager.id,
            actorId: currentUser.id,
            message: `${currentUser.name} submitted a request for ${request.leaveType}.`,
            link: '/leave/requests'
        });
    }
  }, [currentUser, employees, addNotification]);

  const updateLeaveRequestStatus = useCallback((id: string, newStatus: LeaveStatus) => {
    let updatedRequest: LeaveRequest | undefined;
    const originalRequest = leaveRequests.find(req => req.id === id);
    if (!originalRequest) return;

    if (newStatus === LeaveStatus.APPROVED && originalRequest.status !== LeaveStatus.APPROVED) {
        const duration = getLeaveDurationInDays(originalRequest.startDate, originalRequest.endDate);
        const balanceKey = leaveTypeToBalanceKey(originalRequest.leaveType);
        
        if (balanceKey) {
            setEmployees(prevEmps => prevEmps.map(emp => {
                if (emp.id === originalRequest.employeeId) {
                    const newBalance = { ...emp.leaveBalance };
                    newBalance[balanceKey] = Math.max(0, newBalance[balanceKey] - duration);
                    
                    if(currentUser && currentUser.id === emp.id) {
                        setCurrentUser(prevUser => prevUser ? ({...prevUser, leaveBalance: newBalance}) : null);
                    }
                    return { ...emp, leaveBalance: newBalance };
                }
                return emp;
            }));
        }
    }

    setLeaveRequests(prev => prev.map(req => {
        if (req.id === id) {
            updatedRequest = { ...req, status: newStatus };
            return updatedRequest;
        }
        return req;
    }));
    
    if (updatedRequest && currentUser) {
        addNotification({
            recipientId: updatedRequest.employeeId,
            actorId: currentUser.id,
            message: `Your ${updatedRequest.leaveType} request was ${newStatus}.`,
            link: '/leave/requests'
        });
    }
  }, [currentUser, addNotification, leaveRequests]);

  const addTravelRequest = useCallback((request: Omit<TravelRequest, 'id' | 'employeeName' | 'status' | 'employeeId' | 'submissionDate'>) => {
    if (!currentUser) return;
    const newRequest: TravelRequest = {
        ...request,
        id: `tr_${Date.now()}`,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        status: TravelStatus.PENDING,
        submissionDate: new Date().toISOString().split('T')[0],
    };
    setTravelRequests(prev => [newRequest, ...prev]);
  }, [currentUser]);
  
  const updateTravelRequestStatus = useCallback((id: string, newStatus: TravelStatus) => {
      setTravelRequests(prev => prev.map(req => (req.id === id ? { ...req, status: newStatus } : req)));
  }, []);

  const addExpenseRequest = useCallback((request: Omit<ExpenseRequest, 'id' | 'employeeName' | 'status' | 'employeeId' | 'submissionDate'>) => {
    if (!currentUser) return;
    const newRequest: ExpenseRequest = {
        ...request,
        id: `exp_${Date.now()}`,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        status: ExpenseStatus.PENDING,
        submissionDate: new Date().toISOString().split('T')[0],
    };
    setExpenseRequests(prev => [newRequest, ...prev]);
    const manager = employees.find(e => e.id === currentUser.reportingManagerId);
    if (manager) {
        addNotification({
            recipientId: manager.id,
            actorId: currentUser.id,
            message: `${currentUser.name} submitted an expense claim of ₹${request.amount}.`,
            link: '/requests/expenses'
        });
    }
  }, [currentUser, employees, addNotification]);

  const updateExpenseRequestStatus = useCallback((id: string, newStatus: ExpenseStatus) => {
      let updatedRequest: ExpenseRequest | undefined;
      setExpenseRequests(prev => prev.map(req => {
          if (req.id === id) {
              updatedRequest = { ...req, status: newStatus };
              return updatedRequest;
          }
          return req;
      }));
      if (updatedRequest && currentUser) {
          addNotification({
              recipientId: updatedRequest.employeeId,
              actorId: currentUser.id,
              message: `Your expense request for ₹${updatedRequest.amount} was ${newStatus.toLowerCase()}.`,
              link: '/expenses/my-requests'
          });
      }
  }, [currentUser, addNotification]);

  const addCandidateAndScheduleInterview = useCallback((candidateData: Omit<Candidate, 'id' | 'interviews' | 'submittedBy' | 'submittedAt'>, interviewData: Omit<Interview, 'id' | 'status' | 'interviewerName'>) => {
    if (!currentUser) return;
    const interviewer = employees.find(e => e.id === interviewData.interviewerId);
    if (!interviewer) return;

    const newInterview: Interview = {
        ...interviewData,
        id: `int_${Date.now()}`,
        status: InterviewStatus.SCHEDULED,
        interviewerName: interviewer.name,
    };

    const newCandidate: Candidate = {
        ...candidateData,
        id: `cand_${Date.now()}`,
        submittedBy: currentUser.id,
        submittedAt: new Date().toISOString(),
        interviews: [newInterview]
    };
    setCandidates(prev => [newCandidate, ...prev]);

    // Notify interviewer
    addNotification({
        recipientId: newInterview.interviewerId,
        actorId: currentUser.id,
        message: `You have been assigned to interview ${newCandidate.name}.`,
        link: '/recruitment/my-interviews'
    });

  }, [currentUser, employees, addNotification]);
  
  const submitInterviewFeedback = useCallback((candidateId: string, interviewId: string, feedback: string, result: InterviewResult) => {
      setCandidates(prev => prev.map(candidate => {
          if (candidate.id === candidateId) {
              const updatedInterviews = candidate.interviews.map(interview => {
                  if (interview.id === interviewId) {
                      return { ...interview, feedback, result, status: InterviewStatus.COMPLETED };
                  }
                  return interview;
              });
              return { ...candidate, interviews: updatedInterviews };
          }
          return candidate;
      }));
  }, []);

  const addDeclaration = useCallback((declaration: Omit<InvestmentDeclaration, 'id'|'employeeId'|'status'|'proofAttached'>) => {
      if (!currentUser) return;
      const newDeclaration: InvestmentDeclaration = {
          ...declaration,
          id: `decl_${Date.now()}`,
          employeeId: currentUser.id,
          status: DeclarationStatus.PENDING
      };
      setDeclarations(prev => [newDeclaration, ...prev]);
      // Notify admin (hardcoded for now)
      addNotification({
          recipientId: 'AI4S302', // Admin
          actorId: currentUser.id,
          message: `${currentUser.name} submitted a new tax declaration.`,
          link: '/requests/declarations'
      });
  }, [currentUser, addNotification]);
  
  const updateDeclarationStatus = useCallback((id: string, newStatus: DeclarationStatus) => {
      let updatedDecl: InvestmentDeclaration | undefined;
      setDeclarations(prev => prev.map(d => {
          if (d.id === id) {
              updatedDecl = { ...d, status: newStatus };
              return updatedDecl;
          }
          return d;
      }));
       if(updatedDecl && currentUser) {
           addNotification({
               recipientId: updatedDecl.employeeId,
               actorId: currentUser.id,
               message: `Your declaration for ${updatedDecl.section} was ${newStatus.toLowerCase()}.`,
               link: '/finance/tax-planning'
           });
       }
  }, [currentUser, addNotification]);

  const addLoan = useCallback((loan: Omit<EmployeeLoan, 'id'|'status'|'repayments'|'endDate'>) => {
      const tenureInMonths = Math.ceil(loan.loanAmount / loan.emi);
      const startDate = new Date(loan.startDate);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + tenureInMonths, startDate.getDate());

      const newLoan: EmployeeLoan = {
          ...loan,
          id: `loan_${Date.now()}`,
          status: LoanStatus.ACTIVE,
          repayments: [],
          endDate: endDate.toISOString().split('T')[0]
      };
      setLoans(prev => [newLoan, ...prev]);
  }, []);

  const addVariablePayment = useCallback((payment: Omit<VariablePayment, 'id'>) => {
      const newPayment: VariablePayment = {
          ...payment,
          id: `var_${Date.now()}`
      };
      setVariablePayments(prev => [newPayment, ...prev]);
  }, []);

  const requestSalaryChange = useCallback(async (employeeId: string, newCtc: number): Promise<void> => {
      if (!currentUser) throw new Error("You must be logged in.");
      const employee = employees.find(e => e.id === employeeId);
      if (!employee || !employee.functionalManagerId) throw new Error("Employee or their functional manager not found.");

      const newRequest: SalaryChangeRequest = {
          id: `scr_${Date.now()}`,
          employeeId: employeeId,
          requesterId: currentUser.id,
          approverId: employee.functionalManagerId,
          oldCtc: employee.ctc || 0,
          newCtc: newCtc,
          status: SalaryChangeStatus.PENDING,
          requestDate: new Date().toISOString(),
      };
      setSalaryChangeRequests(prev => [newRequest, ...prev]);

      addNotification({
          recipientId: newRequest.approverId,
          actorId: currentUser.id,
          message: `Salary change request for ${employee.name} requires your approval.`,
          link: '/requests/salary',
      });
  }, [currentUser, employees, addNotification]);
  
  const updateSalaryChangeStatus = useCallback((requestId: string, newStatus: SalaryChangeStatus.APPROVED | SalaryChangeStatus.REJECTED) => {
      let updatedRequest: SalaryChangeRequest | undefined;
      setSalaryChangeRequests(prev => prev.map(req => {
          if (req.id === requestId) {
              updatedRequest = { ...req, status: newStatus, approvalDate: new Date().toISOString() };
              return updatedRequest;
          }
          return req;
      }));

      if (updatedRequest) {
           const employee = employees.find(e => e.id === updatedRequest!.employeeId);
           if (newStatus === SalaryChangeStatus.APPROVED && employee) {
               updateEmployee({ ...employee, ctc: updatedRequest.newCtc });
           }
           // Notify requester
           addNotification({
                recipientId: updatedRequest.requesterId,
                actorId: updatedRequest.approverId,
                message: `Your salary change request for ${employee?.name} was ${newStatus}.`,
                link: '/payroll/assignment'
           });
      }
  }, [employees, updateEmployee, addNotification]);
  
  const initiateConfirmation = useCallback((employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee || !currentUser) return;

    if (confirmationRequests.some(r => r.employeeId === employeeId && r.status.toString().startsWith('Pending'))) {
        return;
    }

    const newRequest: ConfirmationRequest = {
        id: `conf_${Date.now()}`,
        employeeId,
        employeeName: employee.name,
        status: ConfirmationStatus.PENDING_REPORTING_MANAGER_APPROVAL,
        requestDate: new Date().toISOString(),
    };
    setConfirmationRequests(prev => [newRequest, ...prev]);
    updateEmployee({ ...employee, confirmationStatus: ConfirmationStatus.PENDING_REPORTING_MANAGER_APPROVAL });

    if (employee.reportingManagerId) {
        addNotification({
            recipientId: employee.reportingManagerId,
            actorId: currentUser.id,
            message: `Confirmation approval requested for ${employee.name}.`,
            link: '/requests/confirmation'
        });
    }
}, [employees, currentUser, confirmationRequests, addNotification, updateEmployee]);

const updateConfirmationRequestStatus = useCallback((requestId: string, decision: 'approve' | 'reject') => {
    const request = confirmationRequests.find(r => r.id === requestId);
    if (!request || !currentUser) return;
    
    const employee = employees.find(e => e.id === request.employeeId);
    if (!employee) return;

    let newStatus: ConfirmationStatus | null = null;
    let finalEmployeeStatus: ConfirmationStatus | undefined;
    let notificationRecipientId: string | null = null;
    let notificationMessage = '';
    
    if (decision === 'reject') {
        newStatus = ConfirmationStatus.REJECTED;
        finalEmployeeStatus = employee.employmentType === EmploymentType.REGULAR ? ConfirmationStatus.IN_PROBATION : ConfirmationStatus.IN_TRAINING;
        notificationRecipientId = employee.reportingManagerId;
        notificationMessage = `Confirmation for ${employee.name} was rejected by ${currentUser.name}.`;
        addNotification({
            recipientId: 'AI4S302',
            actorId: currentUser.id,
            message: `Confirmation for ${employee.name} was rejected.`,
            link: '/employees'
        });
    } else { // approve
        if (request.status === ConfirmationStatus.PENDING_REPORTING_MANAGER_APPROVAL) {
            newStatus = ConfirmationStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL;
            notificationRecipientId = employee.functionalManagerId;
            notificationMessage = `Confirmation for ${employee.name} is now pending your approval.`;
        } else if (request.status === ConfirmationStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL) {
            newStatus = ConfirmationStatus.APPROVED;
            finalEmployeeStatus = ConfirmationStatus.CONFIRMED;
            notificationRecipientId = employee.id;
            notificationMessage = `Congratulations! Your employment has been confirmed.`;
            addNotification({
                recipientId: 'AI4S302',
                actorId: currentUser.id,
                message: `${employee.name}'s employment has been confirmed.`,
                link: '/employees'
            });
        }
    }

    if (newStatus) {
        setConfirmationRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus!, approvalDate: newStatus === ConfirmationStatus.APPROVED ? new Date().toISOString() : undefined } : r));
        updateEmployee({
            ...employee,
            confirmationStatus: finalEmployeeStatus || newStatus,
            confirmationDate: finalEmployeeStatus === ConfirmationStatus.CONFIRMED ? new Date().toISOString().split('T')[0] : null
        });
        if (notificationRecipientId && notificationMessage) {
            addNotification({
                recipientId: notificationRecipientId,
                actorId: currentUser.id,
                message: notificationMessage,
                link: '/requests/confirmation'
            });
        }
    }

}, [confirmationRequests, employees, currentUser, addNotification, updateEmployee]);


const addAttendanceCorrectionRequest = useCallback((requestData: Omit<AttendanceCorrectionRequest, 'id' | 'employeeId' | 'employeeName' | 'status' | 'submissionDate'>) => {
    if (!currentUser) return;

    const newRequest: AttendanceCorrectionRequest = {
        ...requestData,
        id: `acr_${Date.now()}`,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        status: AttendanceCorrectionStatus.PENDING,
        submissionDate: new Date().toISOString().split('T')[0],
    };
    setAttendanceCorrectionRequests(prev => [newRequest, ...prev]);
    
    const manager = employees.find(e => e.id === currentUser.reportingManagerId);
    if(manager){
        addNotification({
            recipientId: manager.id,
            actorId: currentUser.id,
            message: `${currentUser.name} submitted an attendance correction request for ${new Date(requestData.date).toLocaleDateString('en-IN')}.`,
            link: '/requests/attendance'
        });
    }

}, [currentUser, employees, addNotification]);

const updateAttendanceCorrectionRequestStatus = useCallback((requestId: string, newStatus: AttendanceCorrectionStatus) => {
    let updatedRequest: AttendanceCorrectionRequest | undefined;
    
    setAttendanceCorrectionRequests(prev => prev.map(req => {
        if(req.id === requestId) {
            updatedRequest = { ...req, status: newStatus };
            return updatedRequest;
        }
        return req;
    }));
    
    if (updatedRequest && newStatus === AttendanceCorrectionStatus.APPROVED) {
        // Update punch record
        setPunchRecords(prev => {
            const index = prev.findIndex(p => p.employeeId === updatedRequest!.employeeId && p.date === updatedRequest!.date);
            const newPunchIn = updatedRequest!.requestedPunchIn ? new Date(`${updatedRequest!.date}T${updatedRequest!.requestedPunchIn}:00`).toISOString() : null;
            const newPunchOut = updatedRequest!.requestedPunchOut ? new Date(`${updatedRequest!.date}T${updatedRequest!.requestedPunchOut}:00`).toISOString() : null;

            if (index > -1) {
                const updated = [...prev];
                const existing = updated[index];
                updated[index] = {
                    ...existing,
                    punchIn: newPunchIn || existing.punchIn,
                    punchOut: newPunchOut || existing.punchOut,
                };
                return updated;
            } else {
                return [...prev, {
                    id: `punch_${updatedRequest!.employeeId}_${updatedRequest!.date}`,
                    employeeId: updatedRequest!.employeeId,
                    date: updatedRequest!.date,
                    punchIn: newPunchIn,
                    punchOut: newPunchOut,
                }];
            }
        });
        // Update attendance record
        updateAttendance(updatedRequest.employeeId, updatedRequest.date, AttendanceStatus.PRESENT);
    }
    
    if(updatedRequest && currentUser) {
        addNotification({
            recipientId: updatedRequest.employeeId,
            actorId: currentUser.id,
            message: `Your attendance correction for ${new Date(updatedRequest.date).toLocaleDateString('en-IN')} was ${newStatus.toLowerCase()}.`,
            link: '/attendance/my-attendance'
        });
    }

}, [currentUser, addNotification, updateAttendance]);


  // Performance Management Functions
  const addPerformanceCycle = useCallback((cycle: Omit<PerformanceCycle, 'id'|'status'>) => {
      const newCycle: PerformanceCycle = {
          ...cycle,
          id: `cycle_${Date.now()}`,
          status: new Date(cycle.startDate) > new Date() ? PerformanceCycleStatus.UPCOMING : PerformanceCycleStatus.ACTIVE,
      };
      setPerformanceCycles(prev => [newCycle, ...prev]);
  }, []);

  const addGoal = useCallback((goal: Omit<Goal, 'id'>) => {
      const newGoal: Goal = { ...goal, id: `goal_${Date.now()}`};
      setGoals(prev => [newGoal, ...prev]);
  }, []);
  
  const updateGoal = useCallback((goalId: string, updates: Partial<Goal>) => {
      setGoals(prev => prev.map(g => g.id === goalId ? {...g, ...updates} : g));
  }, []);

  const submitReview = useCallback((reviewData: Omit<PerformanceReview, 'id'|'status'>, isManagerReview: boolean) => {
      if(!currentUser) return;
      
      const existingReviewIndex = reviews.findIndex(r => r.employeeId === reviewData.employeeId && r.cycleId === reviewData.cycleId);
      let newStatus: ReviewStatus;
      
      if(isManagerReview) {
          newStatus = ReviewStatus.MANAGER_REVIEW_COMPLETE;
      } else {
          newStatus = ReviewStatus.SELF_ASSESSMENT_COMPLETE;
          const employee = employees.find(e => e.id === reviewData.employeeId);
          if(employee && employee.reportingManagerId) {
              addNotification({
                  recipientId: employee.reportingManagerId,
                  actorId: employee.id,
                  message: `${employee.name} has completed their self-assessment.`,
                  link: '/performance/team-reviews'
              });
          }
      }

      if (existingReviewIndex > -1) {
          setReviews(prev => prev.map((r, i) => i === existingReviewIndex ? { ...r, ...reviewData, status: newStatus } : r));
      } else {
          const newReview: PerformanceReview = {
              ...reviewData,
              id: `rev_${Date.now()}`,
              status: newStatus,
          };
          setReviews(prev => [newReview, ...prev]);
      }
  }, [currentUser, employees, reviews, addNotification]);

  const giveKudos = useCallback((kudosData: Omit<Kudos, 'id'|'timestamp'|'giverId'>) => {
      if(!currentUser) return;
      const newKudos: Kudos = {
          ...kudosData,
          id: `kudo_${Date.now()}`,
          giverId: currentUser.id,
          timestamp: new Date().toISOString(),
      };
      setKudos(prev => [newKudos, ...prev]);

      addNotification({
          recipientId: newKudos.receiverId,
          actorId: currentUser.id,
          message: `${currentUser.name} gave you kudos!`,
          link: '/performance/my-goals'
      });
  }, [currentUser, addNotification]);

  // Lifecycle Management Functions
  const initiateOffboarding = useCallback((employeeId: string, lastWorkingDay: string, reason: string) => {
      const employee = employees.find(e => e.id === employeeId);
      if(!employee) return;

      updateEmployee({ ...employee, exitDetails: { lastWorkingDay, reason } });

      const workflowId = `wf_offboard_${employeeId}`;
      const tasks: Task[] = offboardingTemplate.map((taskTemplate, i) => {
           let assigneeId: string | undefined = undefined;
            if(taskTemplate.assigneeRole === UserRole.MANAGER) {
                assigneeId = employee.reportingManagerId || undefined;
            } else if (taskTemplate.assigneeRole === UserRole.EMPLOYEE) {
                assigneeId = employee.id;
            } else {
                assigneeId = taskTemplate.assigneeId;
            }
            const newTask: Task = {
                ...taskTemplate,
                id: `task_${workflowId}_${i}`,
                workflowId,
                status: TaskStatus.PENDING,
                assigneeId,
            };
            if(assigneeId) {
                addNotification({
                    recipientId: assigneeId,
                    actorId: 'AI4S001',
                    message: `New Offboarding Task: "${newTask.name}" for ${employee.name}`,
                    link: '/lifecycle/my-tasks'
                });
            }
            return newTask;
      });

      const newWorkflow: Workflow = {
          id: workflowId,
          employeeId,
          type: WorkflowType.OFFBOARDING,
          status: WorkflowStatus.IN_PROGRESS,
          startDate: lastWorkingDay,
          tasks,
      };
      setWorkflows(prev => [newWorkflow, ...prev]);
  }, [employees, updateEmployee, addNotification]);
  
  const updateTaskStatus = useCallback((workflowId: string, taskId: string, status: TaskStatus) => {
      let updatedTask: Task | undefined;
      setWorkflows(prev => prev.map(wf => {
          if (wf.id === workflowId) {
              const updatedTasks = wf.tasks.map(t => {
                  if (t.id === taskId) {
                      updatedTask = { ...t, status, completedAt: new Date().toISOString() };
                      return updatedTask;
                  }
                  return t;
              });
              const allCompleted = updatedTasks.every(t => t.status === TaskStatus.COMPLETED);
              return { ...wf, tasks: updatedTasks, status: allCompleted ? WorkflowStatus.COMPLETED : wf.status };
          }
          return wf;
      }));

      if(updatedTask && currentUser) {
          // Notify HR that a task is done
          addNotification({
              recipientId: 'AI4S_Pawan', // HR
              actorId: currentUser.id,
              message: `Task "${updatedTask.name}" was completed.`,
              link: '/lifecycle/onboarding' // A generic link
          });
      }
  }, [currentUser, addNotification]);
  
  const uploadDocument = useCallback((docData: Omit<EmployeeDocument, 'id'|'status'|'submittedAt'|'verifiedAt'|'rejectionReason'>) => {
      if(!currentUser) return;
      setEmployeeDocuments(prev => prev.map(doc => {
          if (doc.employeeId === docData.employeeId && doc.documentName === docData.documentName) {
              return { ...doc, status: DocumentStatus.SUBMITTED, submittedAt: new Date().toISOString() };
          }
          return doc;
      }));
      addNotification({
          recipientId: 'AI4S_Pawan', // HR
          actorId: currentUser.id,
          message: `${currentUser.name} submitted their ${docData.documentName}.`,
          link: '/lifecycle/document-hub'
      });
  }, [currentUser, addNotification]);

  const verifyDocument = useCallback((docId: string, status: DocumentStatus.VERIFIED | DocumentStatus.REJECTED, reason?: string) => {
      let updatedDoc: EmployeeDocument | undefined;
      setEmployeeDocuments(prev => prev.map(doc => {
          if (doc.id === docId) {
              updatedDoc = { ...doc, status, verifiedAt: new Date().toISOString(), rejectionReason: reason };
              return updatedDoc;
          }
          return doc;
      }));
       if(updatedDoc && currentUser) {
           addNotification({
               recipientId: updatedDoc.employeeId,
               actorId: currentUser.id,
               message: `Your document '${updatedDoc.documentName}' was ${status.toLowerCase()}.`,
               link: '/lifecycle/document-hub'
           });
       }
  }, [currentUser, addNotification]);
  
  // Learning Functions
  const assignLearning = useCallback((assignmentData: Omit<LearningAssignment, 'id'|'assignedById'|'assignedAt'|'status'|'completedAt'>) => {
    if(!currentUser) return;
    const newAssignment: LearningAssignment = {
        ...assignmentData,
        id: `la_${Date.now()}`,
        assignedById: currentUser.id,
        assignedAt: new Date().toISOString(),
        status: LearningStatus.ASSIGNED,
    };
    setLearningAssignments(prev => [newAssignment, ...prev]);
    addNotification({
        recipientId: assignmentData.employeeId,
        actorId: currentUser.id,
        message: `You have been assigned a new learning item: "${assignmentData.title}".`,
        link: '/learning/my-courses',
    });
  }, [currentUser, addNotification]);

  const updateLearningStatus = useCallback((assignmentId: string, newStatus: LearningStatus) => {
    setLearningAssignments(prev => prev.map(a => {
        if (a.id === assignmentId) {
            return {
                ...a,
                status: newStatus,
                completedAt: newStatus === LearningStatus.COMPLETED ? new Date().toISOString() : undefined,
            };
        }
        return a;
    }));
  }, []);
  
  const addPunch = useCallback((type: 'in' | 'out') => {
    if (!currentUser) return;

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toISOString();

    setPunchRecords(prev => {
        const existingRecordIndex = prev.findIndex(r => r.employeeId === currentUser.id && r.date === dateStr);
        
        if (existingRecordIndex > -1) {
            // Record exists, update it
            const updatedRecords = [...prev];
            const record = updatedRecords[existingRecordIndex];
            if (type === 'out' && record.punchIn && !record.punchOut) {
                record.punchOut = timeStr;
            }
            return updatedRecords;
        } else {
            // No record for today, create a new one if it's a punch-in
            if (type === 'in') {
                const newRecord: PunchRecord = {
                    id: `punch_${currentUser.id}_${dateStr}`,
                    employeeId: currentUser.id,
                    date: dateStr,
                    punchIn: timeStr,
                    punchOut: null,
                };
                return [...prev, newRecord];
            }
        }
        return prev; // No change if trying to punch out without a record
    });
  }, [currentUser]);

  const addAnnouncement = useCallback((title: string, content: string) => {
    if (!currentUser || currentUser.userRole !== UserRole.ADMIN) return;

    const newAnnouncement: Announcement = {
        id: `ann_${Date.now()}`,
        title,
        content,
        authorId: currentUser.id,
        authorName: currentUser.name,
        createdAt: new Date().toISOString(),
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);

    // Notify all other employees
    employees.forEach(employee => {
        if (employee.id !== currentUser.id) {
            addNotification({
                recipientId: employee.id,
                actorId: currentUser.id,
                message: `New announcement posted: "${title}"`,
                link: '/notice-board'
            });
        }
    });
  }, [currentUser, employees, addNotification]);

  const value = {
    currentUser,
    userRole,
    employees,
    attendance,
    payrollHistory,
    leaveRequests,
    travelRequests,
    expenseRequests,
    candidates,
    declarations,
    loans,
    variablePayments,
    salaryChangeRequests,
    confirmationRequests,
    attendanceCorrectionRequests,
    notifications,
    announcements,
    performanceCycles,
    goals,
    reviews,
    kudos,
    workflows,
    employeeDocuments,
    learningAssignments,
    punchRecords,
    departments,
    roles,
    salaryComponents,
    companyLogo,
    updateCompanyLogo,
    updateSalaryComponents,
    addDepartment,
    addRole,
    addEmployee,
    updateEmployee,
    updateEmployeeAccess,
    updateAttendance,
    bulkUpdateAttendance,
    markAttendanceAndDeductLeave,
    updateLeaveBalance,
    markDayAsHoliday,
    markDayAsWeekOff,
    markDayAsWorking,
    resetPassword,
    postNewPayrollBatch,
    addLeaveRequest,
    updateLeaveRequestStatus,
    addTravelRequest,
    updateTravelRequestStatus,
    addExpenseRequest,
    updateExpenseRequestStatus,
    addCandidateAndScheduleInterview,
    submitInterviewFeedback,
    addDeclaration,
    updateDeclarationStatus,
    addLoan,
    addVariablePayment,
    requestSalaryChange,
    updateSalaryChangeStatus,
    initiateConfirmation,
    updateConfirmationRequestStatus,
    addAttendanceCorrectionRequest,
    updateAttendanceCorrectionRequestStatus,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addAnnouncement,
    addPerformanceCycle,
    addGoal,
    updateGoal,
    submitReview,
    giveKudos,
    initiateOffboarding,
    updateTaskStatus,
    uploadDocument,
    verifyDocument,
    assignLearning,
    updateLearningStatus,
    addPunch,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};