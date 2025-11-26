
export enum EmploymentType {
  TRAINEE = 'Trainee',
  REGULAR = 'Regular',
}

export enum ConfirmationStatus {
  PENDING_REPORTING_MANAGER_APPROVAL = 'Pending Reporting Manager Approval',
  PENDING_FUNCTIONAL_MANAGER_APPROVAL = 'Pending Functional Manager Approval',
  APPROVED = 'Approved', // Final state of the request
  REJECTED = 'Rejected', // Final state of the request
  CONFIRMED = 'Confirmed', // State on the employee record
  IN_TRAINING = 'In Training', // State on the employee record
  IN_PROBATION = 'In Probation', // State on the employee record
}

export interface ConfirmationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  status: ConfirmationStatus;
  requestDate: string; // ISO date
  approvalDate?: string; // ISO date
}


export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  EMPLOYEE = 'Employee',
}

export enum LeaveType {
  CASUAL = 'Casual Leave',
  SICK = 'Sick Leave',
  EARNED = 'Earned Leave',
  ON_DUTY = 'On Duty',
}

export enum LeaveStatus {
  PENDING_REPORTING_MANAGER_APPROVAL = 'Pending Reporting Manager Approval',
  PENDING_FUNCTIONAL_MANAGER_APPROVAL = 'Pending Functional Manager Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  submissionDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
}

export enum WorkLocation {
    OFFICE = 'Work from Office',
    HOME = 'Work from Home',
}

// New interfaces for detailed employee information
export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
}

export interface BankDetails {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
}

export interface StatutoryDetails {
    panNumber?: string;
    aadhaarNumber?: string;
    passportNumber?: string;
    drivingLicenseNumber?: string;
    uanNumber?: string; // Universal Account Number for PF
    esiNumber?: string; // Employee State Insurance Number
}

export interface EducationRecord {
    degree: string;
    institution: string;
    yearOfCompletion: string;
}

export interface PreviousEmployment {
    companyName: string;
    role: string;
    startDate: string;
    endDate: string;
}


export interface Employee {
  id: string; // Employee Code
  password: string; // From 'Login Password' column in the sheet
  
  firstName: string;
  lastName: string;
  middleName?: string;
  name: string; // Concatenated name

  email: string;
  role: string; // Designation
  userRole: UserRole;
  department: string;
  reportingManagerId: string | null;
  functionalManagerId: string | null;
  joiningDate: string; // YYYY-MM-DD
  workLocation: WorkLocation; 
  ipRestrictionExempt?: boolean; // New field for exemption
  
  leaveBalance: {
    casual: number;
    sick: number;
    earned: number;
  };
  ctc?: number; // Annual Cost to Company
  salaryStructure?: SalaryComponent[]; // Optional custom salary structure
  functionAccess: string[]; // List of accessible function names
  declarations?: InvestmentDeclaration[]; // Tax declarations

  // New Employment Fields
  employmentType: EmploymentType;
  probationEndDate?: string | null;
  trainingEndDate?: string | null;
  confirmationStatus?: ConfirmationStatus;
  confirmationDate?: string | null;

  // I. Personal Information from user request
  photoUrl?: string; // for Passport-size Photograph
  permanentAddress?: string;
  currentAddress?: string;
  emergencyContact?: EmergencyContact;

  // II. Statutory and Compliance from user request
  bankDetails?: BankDetails;
  statutoryDetails?: StatutoryDetails;
  
  // III. Educational and Professional Records from user request
  educationRecords?: EducationRecord[];
  previousEmployment?: PreviousEmployment[];


  // Optional fields from sheet
  phone?: string;
  location?: string; // This is work location, now superseded by workLocation enum
  dateOfBirth?: string | null; // YYYY-MM-DD
  maritalStatus?: string | null;
  bloodGroup?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  exitDetails?: {
      lastWorkingDay: string;
      reason: string;
  };
}

export enum InterviewStatus {
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELED = 'Canceled',
}

export enum InterviewResult {
  PROCEED = 'Proceed to Next Round',
  HOLD = 'On Hold',
  REJECT = 'Reject',
}

export interface Interview {
  id: string;
  interviewerId: string;
  interviewerName: string;
  scheduledAt: string; // ISO 8601 format
  meetingLink: string;
  status: InterviewStatus;
  feedback?: string;
  result?: InterviewResult;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  applyingForRole: string;
  submittedBy: string; // employeeId of the person who added the candidate
  submittedAt: string; // ISO 8601 format
  interviews: Interview[];
}

export enum TravelStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  BOOKED = 'Booked'
}

export interface TravelRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  destination: string;
  purpose: string;
  startDate: string;
  endDate: string;
  estimatedCost: number;
  status: TravelStatus;
  submissionDate: string; // YYYY-MM-DD
}

export interface AttendanceSummary {
    present: number;
    absent: number;
    onLeave: number;
    holiday: number;
    weekOff: number;
    halfDayLeave?: number;
    halfDayPresentAbsent?: number;
}


export interface LeaveSummary {
    [LeaveType.CASUAL]: number;
    [LeaveType.SICK]: number;
    [LeaveType.EARNED]: number;
    [LeaveType.ON_DUTY]: number;
}


export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: number; // 1-12
  year: number;
  basic: number;
  hra: number; // House Rent Allowance
  specialAllowance: number;
  providentFund: number; // Employee's contribution
  professionalTax: number;
  incomeTax: number;
  grossEarnings: number;
  totalDeductions: number;
  netSalary: number;
  paidDays: number;
  totalDaysInMonth: number;
  attendanceSummary?: AttendanceSummary;
  leaveSummary?: LeaveSummary;
  componentBreakdown?: Record<string, number>;
  loanDeduction?: number;
  variablePayments?: Record<string, number>;
}

export enum AttendanceStatus {
    PRESENT = 'Present',
    ABSENT = 'Absent',
    ON_LEAVE = 'On Leave',
    HOLIDAY = 'Holiday',
    WEEK_OFF = 'Week Off',
    HALF_DAY_LEAVE = 'Half Day Leave',
    HALF_DAY_PRESENT_ABSENT = 'Half Day Present/Absent'
}

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
}

export interface PunchRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  punchIn: string | null; // ISO 8601 format
  punchOut: string | null; // ISO 8601 format
}

export enum AttendanceCorrectionStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface AttendanceCorrectionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  requestedPunchIn: string | null; // Time string HH:mm
  requestedPunchOut: string | null; // Time string HH:mm
  reason: string;
  status: AttendanceCorrectionStatus;
  submissionDate: string; // YYYY-MM-DD
}

export interface SalaryComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  calculationType: 'percentage_ctc' | 'percentage_basic' | 'fixed_amount' | 'balance_component';
  value: number; // Percentage or fixed amount
  isEditable: boolean;
  order: number;
}

export enum DeclarationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface InvestmentDeclaration {
    id: string;
    employeeId: string;
    financialYear: string; // e.g., "2024-2025"
    section: string; // e.g., "80C", "80D", "HRA"
    declaredAmount: number;
    status: DeclarationStatus;
    proofAttached?: boolean;
}

export enum LoanStatus {
  ACTIVE = 'Active',
  PAID_OFF = 'Paid Off'
}

export interface EmployeeLoan {
  id: string;
  employeeId: string;
  loanAmount: number;
  emi: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: LoanStatus;
  repayments: { month: number, year: number, amount: number }[];
}


export interface VariablePayment {
    id: string;
    employeeId: string;
    month: number; // For which payroll month
    year: number; // For which payroll year
    description: string;
    type: 'earning' | 'deduction';
    amount: number;
}

export enum SalaryChangeStatus {
  PENDING = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface SalaryChangeRequest {
  id: string;
  employeeId: string;
  requesterId: string; // Admin who initiated
  approverId: string; // Functional Manager
  oldCtc: number;
  newCtc: number;
  status: SalaryChangeStatus;
  requestDate: string; // ISO date
  approvalDate?: string; // ISO date
}

export interface Notification {
  id:string;
  recipientId: string; // The user who sees the notification
  actorId: string; // The user who performed the action
  message: string;
  link: string; // React-router path to navigate to on click
  isRead: boolean;
  timestamp: string; // ISO 8601
}

// Performance Management Types
export enum PerformanceCycleStatus {
  UPCOMING = 'Upcoming',
  ACTIVE = 'Active',
  CLOSED = 'Closed'
}

export interface PerformanceCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PerformanceCycleStatus;
}

export enum GoalStatus {
  ON_TRACK = 'On Track',
  AT_RISK = 'At Risk',
  ACHIEVED = 'Achieved',
  NOT_STARTED = 'Not Started'
}

export interface Goal {
  id: string;
  employeeId: string;
  cycleId: string;
  title: string;
  description: string;
  metrics: string; // e.g., "Achieve 15% increase in user engagement"
  status: GoalStatus;
  weightage?: number; // Optional weightage for the goal
}

export enum ReviewStatus {
    NOT_STARTED = 'Not Started',
    SELF_ASSESSMENT_COMPLETE = 'Self-Assessment Complete',
    MANAGER_REVIEW_COMPLETE = 'Manager Review Complete',
    CLOSED = 'Closed',
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  cycleId: string;
  status: ReviewStatus;
  selfAssessment?: string;
  managerAssessment?: string;
  selfRating?: number; // 1-5
  managerRating?: number; // 1-5
}

export interface Kudos {
  id: string;
  giverId: string;
  receiverId: string;
  message: string;
  isPublic: boolean;
  timestamp: string;
}

// Lifecycle Management Types
export enum WorkflowType {
  ONBOARDING = 'Onboarding',
  OFFBOARDING = 'Offboarding',
}

export enum WorkflowStatus {
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export enum TaskStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
}

export interface Task {
  id: string;
  workflowId: string;
  name: string;
  assigneeRole: UserRole | 'IT' | 'HR'; // Can be a role or a department
  assigneeId?: string; // Specific user if assigned
  status: TaskStatus;
  dueDate: string; // Relative to start date, e.g., "D+1" (Day 1)
  completedAt?: string;
}

export interface Workflow {
  id: string;
  employeeId: string;
  type: WorkflowType;
  status: WorkflowStatus;
  startDate: string; // Joining date for onboarding, LWD for offboarding
  tasks: Task[];
}

export enum DocumentStatus {
  PENDING = 'Pending',
  SUBMITTED = 'Submitted',
  VERIFIED = 'Verified',
  REJECTED = 'Rejected'
}

export interface EmployeeDocument {
    id: string;
    employeeId: string;
    documentName: string; // e.g., 'Aadhar Card', 'PAN Card'
    status: DocumentStatus;
    submittedAt?: string;
    verifiedAt?: string;
    rejectionReason?: string;
}

// Learning & Development
export enum LearningStatus {
    ASSIGNED = 'Assigned',
    COMPLETED = 'Completed',
}

export interface LearningAssignment {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  link: string;
  assignedById: string; // Manager ID
  assignedAt: string; // ISO Date
  dueDate?: string; // ISO Date
  status: LearningStatus;
  completedAt?: string; // ISO Date
}

// Expense Management
export enum ExpenseCategory {
    TRAVEL = 'Travel',
    FOOD = 'Food & Dining',
    ACCOMMODATION = 'Accommodation',
    MISCELLANEOUS = 'Miscellaneous',
}

export enum ExpenseStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export interface ExpenseRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    expenseDate: string; // YYYY-MM-DD
    category: ExpenseCategory;
    amount: number;
    reason: string;
    status: ExpenseStatus;
    submissionDate: string; // YYYY-MM-DD
    receiptAttached?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string; // ISO 8601
}
