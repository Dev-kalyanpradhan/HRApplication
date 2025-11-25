import { Employee, LeaveRequest, LeaveType, LeaveStatus, Candidate, InterviewStatus, InterviewResult, PayrollRecord, UserRole, TravelRequest, TravelStatus, AttendanceRecord, AttendanceStatus, Interview, InvestmentDeclaration, DeclarationStatus, EmployeeLoan, LoanStatus, VariablePayment, SalaryChangeRequest, SalaryChangeStatus, Notification, PerformanceCycle, PerformanceCycleStatus, Goal, GoalStatus, PerformanceReview, ReviewStatus, Kudos, Workflow, Task, EmployeeDocument, WorkflowType, WorkflowStatus, TaskStatus, DocumentStatus, LearningAssignment, LearningStatus, WorkLocation, PunchRecord, EmploymentType, ConfirmationStatus, ConfirmationRequest, AttendanceCorrectionRequest, AttendanceCorrectionStatus, ExpenseRequest, ExpenseCategory, ExpenseStatus, Announcement } from '../types';
import { ALL_FUNCTIONS, MANAGER_DEFAULT_ACCESS, EMPLOYEE_DEFAULT_ACCESS, INDIAN_HOLIDAYS } from '../constants';

// Data parsed from the user's provided spreadsheet image
const rawEmployeeData = [
    { code: 'AI4S_FuncLead', password: 'Functional@', first: 'Functional', middle: '', last: 'Lead', designation: 'Functional Lead', department: 'Functional', email: 'functional.lead@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: null, maritalStatus: null, bloodGroup: null, fatherName: null, motherName: null, access: 'Employee' },
    { code: 'AI4S_Govind', password: 'Govind@', first: 'Govind', middle: '', last: 'Rao', designation: 'Associate MM Consultant', department: 'Functional', email: 'govind.r@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: null, maritalStatus: 'Single', bloodGroup: null, fatherName: null, motherName: null, access: 'Employee' },
    { code: 'AI4S302', password: 'Kalyan@1998', first: 'Kalyan', middle: '', last: 'Pradhan', designation: 'SAP BTP Solution Architect', department: 'Technical', email: 'kalyan.p@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: '23-11-1998', maritalStatus: 'Single', bloodGroup: 'B+', fatherName: 'Mr. Arabinda Pradhan', motherName: 'Mrs. Gouri Pradhan', access: 'Admin' },
    { code: 'AI4S_MM', password: 'MM@', first: 'MM', middle: '', last: 'Consultant', designation: 'Associate MM Consultant', department: 'Functional', email: 'mm.consultant@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: null, maritalStatus: null, bloodGroup: null, fatherName: null, motherName: null, access: 'Employee' },
    { code: 'AI4S_Pawan', password: 'Pawan@', first: 'Pawan', middle: '', last: 'Srivastav', designation: 'Administration', department: 'Functional', email: 'pawan.srivastav@ai4spro.com', reportingManagerCode: 'AI4S001', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: null, maritalStatus: null, bloodGroup: null, fatherName: null, motherName: null, access: 'Employee' },
    { code: 'AI4S_Pradip', password: 'Pradip@', first: 'Pradip', middle: '', last: 'Singh', designation: 'Chief Development Officer(CDO)', department: 'Functional', email: 'pradip.singh@ai4spro.com', reportingManagerCode: 'AI4S001', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: null, maritalStatus: null, bloodGroup: null, fatherName: null, motherName: null, access: 'Employee' },
    { code: 'AI4S205', password: 'Priyanka@3011', first: 'Priyanka', middle: '', last: 'Banerjee', designation: 'Senior FICO/MM Consultant', department: 'Functional', email: 'priyanka.banerjee@ai4spro.com', reportingManagerCode: 'AI4S001', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: '10-06-1982', maritalStatus: 'Married', bloodGroup: 'O+', fatherName: null, motherName: null, access: 'Employee' },
    { code: 'AI4S_Project', password: 'Project@', first: 'Project', middle: '', last: 'Manager', designation: 'Project Manager', department: 'Functional', email: 'project.manager@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: null, maritalStatus: null, bloodGroup: null, fatherName: null, motherName: null, access: 'Employee' },
    { code: 'AI4S303', password: 'Sachin@3760', first: 'Sachin', middle: 'Mahesh', last: 'Singh', designation: 'SAP Cloud ALM Administrator', department: 'Technical', email: 'sachin@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: '14-12-2002', maritalStatus: 'Single', bloodGroup: 'B+', fatherName: 'Mr. Mahesh Singh', motherName: 'Mrs. Mamta Singh', access: 'Employee' },
    { code: 'AI4S001', password: 'Saurabh@', first: 'Saurabh', middle: '', last: 'Mishra', designation: 'Chief Executive Officer(CEO)', department: 'Technical', email: 'saurabh.mishra@ai4spro.com', reportingManagerCode: null, functionalManagerCode: null, doj: '15-08-2025', dob: null, maritalStatus: null, bloodGroup: null, fatherName: null, motherName: null, access: 'Admin' },
    { code: 'AI4S_Shekhar', password: 'Shekhar@', first: 'Shekhar', middle: '', last: 'Singh', designation: 'Developer Admin', department: 'Functional', email: 'shekhar@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: null, maritalStatus: null, bloodGroup: null, fatherName: null, motherName: null, access: 'Employee' },
    { code: 'AI4S304', password: 'Subhasis@3630', first: 'Subhasis', middle: '', last: 'Mahavoi', designation: 'SAP Build App Developer', department: 'Technical', email: 'subhasis.m@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: '28-05-1999', maritalStatus: 'Single', bloodGroup: 'B+', fatherName: 'Mr. Ajay Kumar Mahavoi', motherName: 'Mrs. Babina Das', access: 'Employee' },
    { code: 'AI4S306', password: 'Vishal@3732', first: 'Vishal', middle: '', last: 'Saini', designation: 'SAP Full Stack Solution Developer', department: 'Technical', email: 'vishal.saini@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: '12-03-2002', maritalStatus: 'Single', bloodGroup: 'A+', fatherName: 'Mr. Rakesh Kumar Saini', motherName: 'Mrs. Babli Saini', access: 'Employee' },
    { code: 'AI4S203', password: 'Dharmendra@3484', first: 'Dharmendra', middle: '', last: 'Thatikayala', designation: 'Associate FICO Consultant', department: 'Functional', email: 'dharmendra@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: '26-05-1995', maritalStatus: 'Single', bloodGroup: 'O+', fatherName: 'Mr. Yesu babu T', motherName: 'Mrs. Subhadra', access: 'Employee' },
    { code: 'AI4S201', password: 'Abhishek@3352', first: 'Abhishek', middle: '', last: 'Das', designation: 'Associate MM Consultant', department: 'Functional', email: 'abhishek.das@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: '18-10-1991', maritalStatus: 'Single', bloodGroup: 'B+', fatherName: 'Mr. Pulak Das', motherName: 'Mrs. Jaya Das', access: 'Employee' },
    { code: 'AI4S202', password: 'Anish@', first: 'Anish', middle: '', last: 'Choudhary', designation: 'Associate FICO Consultant', department: 'Functional', email: 'anish.choudhary@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: null, maritalStatus: null, bloodGroup: null, fatherName: null, motherName: null, access: 'Employee' },
    { code: 'AI4S301', password: 'apurva@3813', first: 'apurva', middle: '', last: 'pandey', designation: 'SAP Cloud Platform & System Architect', department: 'Technical', email: 'apurva.pandey@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: '01-06-2004', maritalStatus: 'Single', bloodGroup: 'AB+', fatherName: 'Mr. Balkrishna Pandey', motherName: 'Mrs. Kanchan Pandey', access: 'Employee' },
    { code: 'AI4S_Bicky', password: 'Bicky@', first: 'Bicky', middle: 'Kumar', last: 'Ojha', designation: 'Associate FICO Consultant', department: 'Functional', email: 'b.ojha@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: null, maritalStatus: null, bloodGroup: null, fatherName: null, motherName: null, access: 'Employee' },
    { code: 'AI4S305', password: 'Vikrant@3704', first: 'Vikrant', middle: 'Kumar', last: 'Singh', designation: 'SAP Integration Architect', department: 'Technical', email: 'vikrant.singh@ai4spro.com', reportingManagerCode: 'AI4S205', functionalManagerCode: 'AI4S001', doj: '15-08-2025', dob: '07-06-2001', maritalStatus: 'Single', bloodGroup: 'A+', fatherName: 'Mr. Pradeep Kr. Singh', motherName: 'Mrs. Rebi Ranjan Singh', access: 'Employee' },
];

const normalizeDate = (dateStr: string | null): string => {
    if (!dateStr) return '1970-01-01'; // Default date if null
    try {
      const parts = dateStr.replace(/[.\/]/g, '-').split('-');
      let year, month, day;
      if (parts[2] && parts[2].length >= 4) { // DD-MM-YYYY or similar
        [day, month, year] = parts;
      } else if (parts[0].length === 4) { // YYYY-MM-DD
        [year, month, day] = parts;
      } else {
         const d = new Date(dateStr);
         if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
         return '1970-01-01';
      }
      // Pad month and day
      month = month.padStart(2, '0');
      day = day.padStart(2, '0');
      
      const d = new Date(`${year}-${month}-${day}`);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      return '1970-01-01';
    } catch(e) {
      return '1970-01-01';
    }
};

const roleBaseCtc: { [key: string]: number } = {
    'Chief Executive Officer(CEO)': 5000000,
    'Chief Development Officer(CDO)': 4500000,
    'Senior FICO/MM Consultant': 2500000,
    'SAP BTP Solution Architect': 2200000,
    'SAP Integration Architect': 2000000,
    'SAP Cloud Platform & System Architect': 2000000,
    'Project Manager': 1800000,
    'SAP Full Stack Solution Developer': 1700000,
    'SAP Build App Developer': 1500000,
    'SAP Cloud ALM Administrator': 1400000,
    'Associate FICO Consultant': 1200000,
    'Associate MM Consultant': 1200000,
    'Developer Admin': 1100000,
    'Functional Lead': 1500000,
    'Administration': 900000,
};

const processEmployees = (): Employee[] => {
    const managerCodes = new Set(rawEmployeeData.flatMap(e => [e.reportingManagerCode, e.functionalManagerCode]).filter(Boolean));

    return rawEmployeeData.map(raw => {
      const name = [raw.first, raw.middle, raw.last].filter(Boolean).join(' ');
      
      let userRole: UserRole;
      const isAdmin = raw.access === 'Admin';
      if (isAdmin) {
          userRole = UserRole.ADMIN;
      } else if (managerCodes.has(raw.code)) {
          userRole = UserRole.MANAGER;
      } else {
          userRole = UserRole.EMPLOYEE;
      }

      let functionAccess: string[];
      if (userRole === UserRole.ADMIN) {
        functionAccess = ALL_FUNCTIONS;
      } else if (userRole === UserRole.MANAGER) {
        functionAccess = MANAGER_DEFAULT_ACCESS;
      } else {
        functionAccess = EMPLOYEE_DEFAULT_ACCESS;
      }
      
      const isTrainee = ['Associate FICO Consultant', 'Associate MM Consultant'].includes(raw.designation);
      const employmentType = isTrainee ? EmploymentType.TRAINEE : EmploymentType.REGULAR;
      
      const joiningDate = normalizeDate(raw.doj);
      const joiningDateObj = new Date(joiningDate);
      let probationEndDate: string | null = null;
      let trainingEndDate: string | null = null;

      if (joiningDate !== '1970-01-01') {
        if (employmentType === EmploymentType.REGULAR) {
            const date = new Date(joiningDateObj);
            date.setMonth(date.getMonth() + 6);
            probationEndDate = date.toISOString().split('T')[0];
        } else {
            const date = new Date(joiningDateObj);
            date.setFullYear(date.getFullYear() + 1);
            trainingEndDate = date.toISOString().split('T')[0];
        }
      }

      const employee: Employee = {
          id: raw.code,
          password: raw.password,
          firstName: raw.first,
          lastName: raw.last,
          middleName: raw.middle || undefined,
          name: name,
          email: raw.email,
          role: raw.designation,
          department: raw.department,
          joiningDate: joiningDate,
          workLocation: ['AI4S304', 'AI4S306'].includes(raw.code) ? WorkLocation.HOME : WorkLocation.OFFICE,
          ipRestrictionExempt: isAdmin, // Admins are exempt by default
          dateOfBirth: normalizeDate(raw.dob),
          maritalStatus: raw.maritalStatus || undefined,
          bloodGroup: raw.bloodGroup || undefined,
          fatherName: raw.fatherName || undefined,
          motherName: raw.motherName || undefined,
          reportingManagerId: raw.reportingManagerCode,
          functionalManagerId: raw.functionalManagerCode,
          leaveBalance: { casual: 12, sick: 10, earned: 15 },
          ctc: roleBaseCtc[raw.designation] || 700000,
          userRole,
          functionAccess,
          declarations: [], // Initialize with empty declarations
          employmentType,
          probationEndDate,
          trainingEndDate,
          confirmationStatus: employmentType === EmploymentType.REGULAR ? ConfirmationStatus.IN_PROBATION : ConfirmationStatus.IN_TRAINING,
          // Initialize new fields with some mock data for specific employees
          permanentAddress: undefined,
          currentAddress: undefined,
          emergencyContact: undefined,
          bankDetails: undefined,
          statutoryDetails: undefined,
          educationRecords: [],
          previousEmployment: [],
      };

      // Add detailed mock data for a few employees
      if (raw.code === 'AI4S302') { // Kalyan Pradhan
          employee.permanentAddress = "Bidanasi, Cuttack, Odisha, 753014";
          employee.currentAddress = "A-304, Prestige Lakeside Habitat, Varthur, Bangalore, 560087";
          employee.emergencyContact = { name: 'Arabinda Pradhan', relationship: 'Father', phone: '9876543210', email: 'arabinda.p@example.com' };
          employee.bankDetails = { bankName: 'HDFC Bank', accountNumber: '50100123456789', ifscCode: 'HDFC0000001' };
          employee.statutoryDetails = { panNumber: 'ASDFG1234H', aadhaarNumber: '1234 5678 9012', uanNumber: '100987654321' };
          employee.educationRecords = [{ degree: 'B.Tech in Computer Science', institution: 'NIT Rourkela', yearOfCompletion: '2020' }];
          employee.previousEmployment = [{ companyName: 'Tech Mahindra', role: 'Software Engineer', startDate: '2020-07-15', endDate: '2023-08-10' }];
      }

      if (raw.code === 'AI4S205') { // Priyanka Banerjee
          employee.permanentAddress = "Salt Lake, Kolkata, West Bengal";
          employee.currentAddress = "Whitefield, Bangalore, Karnataka";
          employee.emergencyContact = { name: 'Amit Banerjee', relationship: 'Spouse', phone: '9988776655' };
          employee.bankDetails = { bankName: 'ICICI Bank', accountNumber: '000101543210', ifscCode: 'ICIC0000001' };
          employee.statutoryDetails = { panNumber: 'ZXCVB5678K', aadhaarNumber: '9876 5432 1098' };
          employee.previousEmployment = [{ companyName: 'Wipro', role: 'SAP Consultant', startDate: '2010-06-01', endDate: '2018-12-31' }];
      }


      return employee;
    });
};


export const mockEmployees: Employee[] = processEmployees();

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

export const mockLeaveRequests: LeaveRequest[] = [
  { id: '1', employeeId: 'AI4S201', employeeName: 'Abhishek Das', leaveType: LeaveType.CASUAL, startDate: '2024-07-20', endDate: '2024-07-21', reason: 'Family function', status: LeaveStatus.APPROVED, submissionDate: '2024-07-18' },
  { id: '2', employeeId: 'AI4S306', employeeName: 'Vishal Saini', leaveType: LeaveType.SICK, startDate: todayStr, endDate: todayStr, reason: 'Fever', status: LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL, submissionDate: todayStr },
  { id: '3', employeeId: 'AI4S305', employeeName: 'Vikrant Kumar Singh', leaveType: LeaveType.EARNED, startDate: '2024-08-01', endDate: '2024-08-10', reason: 'Vacation', status: LeaveStatus.PENDING_FUNCTIONAL_MANAGER_APPROVAL, submissionDate: '2024-07-20' },
  { id: '4', employeeId: 'AI4S_Govind', employeeName: 'Govind Rao', leaveType: LeaveType.CASUAL, startDate: todayStr, endDate: new Date(today.setDate(today.getDate() + 2)).toISOString().split('T')[0], reason: 'Personal work', status: LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL, submissionDate: todayStr },
  { id: 'ot1', employeeId: 'AI4S_Shekhar', employeeName: 'Shekhar Singh', leaveType: LeaveType.ON_DUTY, startDate: todayStr, endDate: todayStr, reason: 'Critical server maintenance', status: LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL, submissionDate: todayStr, startTime: '18:00', endTime: '22:00' },
  { id: 'ot2', employeeId: 'AI4S304', employeeName: 'Subhasis Mahavoi', leaveType: LeaveType.ON_DUTY, startDate: new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0], endDate: new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0], reason: 'Urgent client deployment', status: LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL, submissionDate: new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0], startTime: '20:00', endTime: '23:00' },
  { id: 'ot3', employeeId: 'AI4S306', employeeName: 'Vishal Saini', leaveType: LeaveType.ON_DUTY, startDate: new Date(today.setDate(today.getDate() - 2)).toISOString().split('T')[0], endDate: new Date(today.setDate(today.getDate() - 2)).toISOString().split('T')[0], reason: 'Project deadline support', status: LeaveStatus.APPROVED, submissionDate: new Date(today.setDate(today.getDate() - 2)).toISOString().split('T')[0], startTime: '19:00', endTime: '21:30' },
];

export const mockTravelRequests: TravelRequest[] = [
  { id: '1', employeeId: 'AI4S302', employeeName: 'Kalyan Pradhan', destination: 'Bangalore', purpose: 'Client Meeting', startDate: '2024-08-05', endDate: '2024-08-07', estimatedCost: 25000, status: TravelStatus.APPROVED, submissionDate: '2024-08-01' },
  { id: '2', employeeId: 'AI4S304', employeeName: 'Subhasis Mahavoi', destination: 'Pune', purpose: 'Tech Conference', startDate: '2024-08-12', endDate: '2024-08-14', estimatedCost: 18000, status: TravelStatus.PENDING, submissionDate: '2024-08-05' },
];

export const mockExpenseRequests: ExpenseRequest[] = [
    {
        id: 'exp_1',
        employeeId: 'AI4S306', // Vishal Saini
        employeeName: 'Vishal Saini',
        expenseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: ExpenseCategory.TRAVEL,
        amount: 1250,
        reason: 'Cab fare for client meeting',
        status: ExpenseStatus.PENDING,
        submissionDate: new Date().toISOString().split('T')[0],
        receiptAttached: true,
    },
    {
        id: 'exp_2',
        employeeId: 'AI4S304', // Subhasis Mahavoi
        employeeName: 'Subhasis Mahavoi',
        expenseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: ExpenseCategory.FOOD,
        amount: 800,
        reason: 'Team lunch during project deployment',
        status: ExpenseStatus.APPROVED,
        submissionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        receiptAttached: true,
    },
    {
        id: 'exp_3',
        employeeId: 'AI4S306', // Vishal Saini
        employeeName: 'Vishal Saini',
        expenseDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: ExpenseCategory.MISCELLANEOUS,
        amount: 2500,
        reason: 'Software license purchase',
        status: ExpenseStatus.REJECTED,
        submissionDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
];


export const mockCandidates: Candidate[] = [
    {
        id: 'cand_1',
        name: 'Rohan Joshi',
        email: 'rohan.joshi@example.com',
        phone: '9876543210',
        applyingForRole: 'SAP Full Stack Solution Developer',
        submittedBy: 'AI4S302', // Kalyan Pradhan (Admin)
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        interviews: [
            {
                id: 'int_1_1',
                interviewerId: 'AI4S306', // Vishal Saini
                interviewerName: 'Vishal Saini',
                scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                meetingLink: 'https://meet.google.com/abc-def-ghi',
                status: InterviewStatus.SCHEDULED,
            }
        ]
    }
];


export const mockPayrollHistory: PayrollRecord[] = [];

export let mockPunchRecords: PunchRecord[] = [];

export const mockConfirmationRequests: ConfirmationRequest[] = [
    {
        id: 'conf_1',
        employeeId: 'AI4S306', // Vishal Saini, Regular
        employeeName: 'Vishal Saini',
        status: ConfirmationStatus.PENDING_REPORTING_MANAGER_APPROVAL,
        requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

export const mockAttendanceCorrectionRequests: AttendanceCorrectionRequest[] = [
    {
        id: 'acr_1',
        employeeId: 'AI4S306',
        employeeName: 'Vishal Saini',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
        requestedPunchIn: '09:35',
        requestedPunchOut: '18:40',
        reason: 'Forgot to punch in, was working on a critical deployment.',
        status: AttendanceCorrectionStatus.PENDING,
        submissionDate: new Date().toISOString().split('T')[0],
    },
    {
        id: 'acr_2',
        employeeId: 'AI4S304',
        employeeName: 'Subhasis Mahavoi',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
        requestedPunchIn: null, // Missed punch-out only
        requestedPunchOut: '19:05',
        reason: 'Forgot to punch out after the late-night call.',
        status: AttendanceCorrectionStatus.APPROVED,
        submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
];

export const mockAnnouncements: Announcement[] = [
    {
        id: 'ann_1',
        title: 'Q3 2024 Company-Wide Holiday',
        content: 'Dear Team,\n\nPlease note that the office will be closed on Friday, October 31st, for Diwali. We wish you and your families a happy and prosperous festival of lights!\n\nEnjoy the long weekend!',
        authorId: 'AI4S001', // Saurabh Mishra (CEO)
        authorName: 'Saurabh Mishra',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'ann_2',
        title: 'New Health Insurance Partner: MediCare Plus',
        content: 'We are excited to announce our new health insurance partnership with MediCare Plus, effective from the 1st of next month. An orientation session will be held next Wednesday to discuss the new policy benefits. Please check your calendar for the invite.',
        authorId: 'AI4S_Pawan', // Pawan Srivastav (Administration/HR)
        authorName: 'Pawan Srivastav',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

const generateMockPunches = () => {
    const records: PunchRecord[] = [];
    const today = new Date();
    
    mockEmployees.forEach(emp => {
        // Generate for the last 30 days
        for (let i = 1; i <= 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Skip some days randomly to simulate missed punches
            if (Math.random() > 0.85) continue;
            
            // Introduce some late arrivals
            const isLate = Math.random() > 0.7;
            const punchInHour = isLate ? 9 + Math.floor(Math.random() * 2) : 9; // 9-10 AM for late, 9 AM for on-time
            const punchInMinute = isLate ? 30 + Math.floor(Math.random() * 30) : Math.floor(Math.random() * 30); // After 9:30 for late

            const punchIn = new Date(date.getFullYear(), date.getMonth(), date.getDate(), punchInHour, punchInMinute).toISOString();

            // Simulate missed punch-out
            const punchOut = Math.random() > 0.1 ? (() => {
                const punchOutHour = 18 + Math.floor(Math.random() * 2); // 6-7 PM
                const punchOutMinute = Math.floor(Math.random() * 60);
                return new Date(date.getFullYear(), date.getMonth(), date.getDate(), punchOutHour, punchOutMinute).toISOString();
            })() : null;

            records.push({
                id: `punch_${emp.id}_${dateStr}`,
                employeeId: emp.id,
                date: dateStr,
                punchIn,
                punchOut,
            });
        }
    });
    mockPunchRecords = records;
};

generateMockPunches();


const generateInitialAttendanceData = (): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const today = new Date();
    const daysToGenerate = 30;

    for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();

        for (const employee of mockEmployees) {
            let status: AttendanceStatus | null = null;

            // Check for Holiday
            if (INDIAN_HOLIDAYS.some(h => h.date === dateStr)) {
                status = AttendanceStatus.HOLIDAY;
            }
            // Check for Week Off (e.g., Sunday)
            else if (dayOfWeek === 0) {
                status = AttendanceStatus.WEEK_OFF;
            }
            // Check for approved leave
            else if (mockLeaveRequests.some(lr => 
                lr.employeeId === employee.id && 
                lr.status === LeaveStatus.APPROVED &&
                dateStr >= lr.startDate && dateStr <= lr.endDate
            )) {
                status = AttendanceStatus.ON_LEAVE;
            }
            // Check for punches
            else {
                const punch = mockPunchRecords.find(p => p.employeeId === employee.id && p.date === dateStr);
                if (punch && punch.punchIn && punch.punchOut) {
                    status = AttendanceStatus.PRESENT;
                } else {
                    status = AttendanceStatus.ABSENT;
                }
            }

            if (status) {
                 records.push({
                    id: `att_${employee.id}_${dateStr}`,
                    employeeId: employee.id,
                    date: dateStr,
                    status,
                });
            }
        }
    }
    return records;
};

export const mockAttendance: AttendanceRecord[] = generateInitialAttendanceData();

export const mockInvestmentDeclarations: InvestmentDeclaration[] = [
    { id: 'decl_1', employeeId: 'AI4S306', financialYear: '2024-2025', section: '80C', declaredAmount: 150000, status: DeclarationStatus.APPROVED },
    { id: 'decl_2', employeeId: 'AI4S201', financialYear: '2024-2025', section: 'HRA', declaredAmount: 120000, status: DeclarationStatus.PENDING },
];

export const mockEmployeeLoans: EmployeeLoan[] = [
    { id: 'loan_1', employeeId: 'AI4S305', loanAmount: 200000, emi: 10000, startDate: '2024-05-01', endDate: '2026-01-01', status: LoanStatus.ACTIVE, repayments: [{month: 5, year: 2024, amount: 10000}, {month: 6, year: 2024, amount: 10000}] },
];

export const mockVariablePayments: VariablePayment[] = [
    { id: 'var_1', employeeId: 'AI4S302', month: 7, year: 2024, description: 'Project Completion Bonus', type: 'earning', amount: 50000 },
];

export const mockSalaryChangeRequests: SalaryChangeRequest[] = [
    {
        id: 'scr_1',
        employeeId: 'AI4S306', // Vishal Saini
        requesterId: 'AI4S302', // Kalyan Pradhan (Admin)
        approverId: 'AI4S001', // Saurabh Mishra (CEO)
        oldCtc: 1700000,
        newCtc: 1850000,
        status: SalaryChangeStatus.PENDING,
        requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'scr_2',
        employeeId: 'AI4S201', // Abhishek Das
        requesterId: 'AI4S302', // Kalyan Pradhan (Admin)
        approverId: 'AI4S001', // Saurabh Mishra
        oldCtc: 1200000,
        newCtc: 1250000,
        status: SalaryChangeStatus.APPROVED,
        requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        approvalDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
     {
        id: 'scr_3',
        employeeId: 'AI4S203', // Dharmendra
        requesterId: 'AI4S302', // Kalyan Pradhan (Admin)
        approverId: 'AI4S205', // Priyanka Banerjee (Manager)
        oldCtc: 1200000,
        newCtc: 1225000,
        status: SalaryChangeStatus.REJECTED,
        requestDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        approvalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

export const mockPerformanceCycles: PerformanceCycle[] = [
    { id: 'cycle1', name: 'Annual Review 2024', startDate: '2024-01-01', endDate: '2024-12-31', status: PerformanceCycleStatus.ACTIVE },
    { id: 'cycle2', name: 'H1 2025', startDate: '2025-01-01', endDate: '2025-06-30', status: PerformanceCycleStatus.UPCOMING },
];

export const mockGoals: Goal[] = [
    { id: 'goal1', employeeId: 'AI4S306', cycleId: 'cycle1', title: 'Refactor Authentication Module', description: 'Improve security and performance of the login and session management services.', metrics: 'Reduce average login time by 20% and achieve a 95 score on security audit.', status: GoalStatus.ON_TRACK },
    { id: 'goal2', employeeId: 'AI4S306', cycleId: 'cycle1', title: 'Mentor Junior Developer', description: 'Provide guidance and support to Apurva Pandey on the new cloud platform architecture.', metrics: 'Conduct weekly code review sessions and help them complete their first major feature.', status: GoalStatus.NOT_STARTED },
    { id: 'goal3', employeeId: 'AI4S301', cycleId: 'cycle1', title: 'Deploy Staging Environment on SAP BTP', description: 'Successfully set up and deploy the application to a BTP staging environment.', metrics: 'Staging environment live and accessible by the QA team by Q3.', status: GoalStatus.AT_RISK },
];

export const mockPerformanceReviews: PerformanceReview[] = [
    { id: 'rev1', employeeId: 'AI4S306', cycleId: 'cycle1', status: ReviewStatus.SELF_ASSESSMENT_COMPLETE, selfAssessment: 'I believe I am on track with the authentication module refactor. I have started documenting the mentorship plan for Apurva.' },
    { id: 'rev2', employeeId: 'AI4S301', cycleId: 'cycle1', status: ReviewStatus.NOT_STARTED },
];

export const mockKudos: Kudos[] = [
    { id: 'kudo1', giverId: 'AI4S302', receiverId: 'AI4S306', message: 'Great job on the quick bug fix for the payroll module! You saved us a lot of time.', isPublic: true, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'kudo2', giverId: 'AI4S205', receiverId: 'AI4S304', message: 'Subhasis has shown incredible creativity in the new UI designs. Really impressed!', isPublic: true, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

// --- Lifecycle Management Mocks ---
export const onboardingTemplate: Omit<Task, 'id'|'workflowId'|'status'|'completedAt'>[] = [
    { name: 'Submit Personal Information', assigneeRole: UserRole.EMPLOYEE, dueDate: 'D+0' },
    { name: 'Submit Statutory Documents (Aadhaar, PAN)', assigneeRole: UserRole.EMPLOYEE, dueDate: 'D+0' },
    { name: 'Submit Educational & Professional History', assigneeRole: UserRole.EMPLOYEE, dueDate: 'D+1' },
    { name: 'Sign & Submit Offer Letter and NDA', assigneeRole: UserRole.EMPLOYEE, dueDate: 'D+0' },

    { name: 'Verify Employee Documents', assigneeRole: 'HR', assigneeId: 'AI4S_Pawan', dueDate: 'D+2' },
    { name: 'Create Email Account & Grant System Access', assigneeRole: 'IT', assigneeId: 'AI4S_Shekhar', dueDate: 'D+1' },
    { name: 'Assign Hardware (Laptop, etc.)', assigneeRole: 'IT', assigneeId: 'AI4S_Shekhar', dueDate: 'D+2' },
    { name: 'Schedule HR Orientation', assigneeRole: 'HR', assigneeId: 'AI4S_Pawan', dueDate: 'D+2' },
    { name: 'Introduce to Team', assigneeRole: UserRole.MANAGER, dueDate: 'D+0' },
];

export const offboardingTemplate: Omit<Task, 'id'|'workflowId'|'status'|'completedAt'>[] = [
    { name: 'Knowledge Transfer Session', assigneeRole: UserRole.EMPLOYEE, dueDate: 'LWD-5' },
    { name: 'Recover Company Assets', assigneeRole: UserRole.MANAGER, dueDate: 'LWD-0' },
    { name: 'Disable System Access', assigneeRole: 'IT', assigneeId: 'AI4S_Shekhar', dueDate: 'LWD-0' },
    { name: 'Conduct Exit Interview', assigneeRole: 'HR', assigneeId: 'AI4S_Pawan', dueDate: 'LWD-1' },
    { name: 'Process Final Settlement', assigneeRole: 'HR', assigneeId: 'AI4S_Pawan', dueDate: 'LWD+30' },
];


export const mockWorkflows: Workflow[] = [
    {
        id: 'wf_onboard_1',
        employeeId: 'AI4S303', // Sachin
        type: WorkflowType.ONBOARDING,
        status: WorkflowStatus.IN_PROGRESS,
        startDate: '2024-12-20',
        tasks: onboardingTemplate.map((task, i) => ({
            ...task,
            id: `task_onboard_1_${i}`,
            workflowId: 'wf_onboard_1',
            status: i < 2 ? TaskStatus.COMPLETED : TaskStatus.PENDING,
            assigneeId: task.assigneeRole === UserRole.MANAGER ? 'AI4S205' : task.assigneeId
        }))
    }
];

export const mockEmployeeDocuments: EmployeeDocument[] = [
    { id: 'doc_1', employeeId: 'AI4S303', documentName: 'Aadhar Card', status: DocumentStatus.VERIFIED },
    { id: 'doc_2', employeeId: 'AI4S303', documentName: 'PAN Card', status: DocumentStatus.SUBMITTED },
    { id: 'doc_3', employeeId: 'AI4S303', documentName: 'Bank Account Proof', status: DocumentStatus.PENDING },
];

export const mockLearningAssignments: LearningAssignment[] = [
    {
        id: 'la_1',
        employeeId: 'AI4S306', // Vishal Saini
        title: 'Advanced React Hooks',
        description: 'Deep dive into React Hooks, patterns, and performance optimizations.',
        link: 'https://react.dev/learn',
        assignedById: 'AI4S205', // Priyanka Banerjee
        assignedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: LearningStatus.ASSIGNED,
    },
    {
        id: 'la_2',
        employeeId: 'AI4S301', // apurva pandey
        title: 'Introduction to SAP BTP',
        description: 'Official SAP documentation and tutorials for beginners on the Business Technology Platform.',
        link: 'https://www.sap.com/products/technology-platform.html',
        assignedById: 'AI4S205', // Priyanka Banerjee
        assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: LearningStatus.COMPLETED,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
     {
        id: 'la_3',
        employeeId: 'AI4S306', // Vishal Saini
        title: 'Project Management Fundamentals',
        description: 'A course on the basics of project management, including planning, execution, and delivery.',
        link: 'https://www.pmi.org/',
        assignedById: 'AI4S205', // Priyanka Banerjee
        assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: LearningStatus.ASSIGNED,
    },
];


export let mockNotifications: Notification[] = [];

// Function to generate initial notifications from other mock data
function generateInitialNotifications() {
    const notifications: Notification[] = [];
    
    // From leave requests
    mockLeaveRequests.forEach(req => {
        const employee = mockEmployees.find(e => e.id === req.employeeId);
        if (!employee) return;

        if (req.status === LeaveStatus.PENDING_REPORTING_MANAGER_APPROVAL && employee.reportingManagerId) {
             notifications.push({
                id: `notif_leave_${req.id}_req`,
                recipientId: employee.reportingManagerId,
                actorId: req.employeeId,
                message: `${req.employeeName} requested for ${req.leaveType}.`,
                link: '/leave/requests',
                isRead: true,
                timestamp: new Date(new Date(req.submissionDate).getTime() + 1000).toISOString()
            });
        }
        if (req.status === LeaveStatus.APPROVED || req.status === LeaveStatus.REJECTED) {
            notifications.push({
                id: `notif_leave_${req.id}_res`,
                recipientId: req.employeeId,
                actorId: employee.functionalManagerId || employee.reportingManagerId || 'AI4S001',
                message: `Your ${req.leaveType} request was ${req.status.toLowerCase()}.`,
                link: '/leave/requests',
                isRead: false,
                timestamp: new Date(new Date(req.submissionDate).getTime() + 86400000).toISOString() // 1 day later
            });
        }
    });

    // From expense requests
    mockExpenseRequests.forEach(req => {
        const employee = mockEmployees.find(e => e.id === req.employeeId);
        if (!employee || !employee.reportingManagerId) return;

        if (req.status === ExpenseStatus.PENDING) {
             notifications.push({
                id: `notif_expense_${req.id}_req`,
                recipientId: employee.reportingManagerId,
                actorId: req.employeeId,
                message: `${req.employeeName} submitted an expense claim for ₹${req.amount}.`,
                link: '/requests/expenses',
                isRead: false,
                timestamp: new Date(new Date(req.submissionDate).getTime() + 2000).toISOString()
            });
        }
         if (req.status === ExpenseStatus.APPROVED || req.status === ExpenseStatus.REJECTED) {
            notifications.push({
                id: `notif_expense_${req.id}_res`,
                recipientId: req.employeeId,
                actorId: employee.reportingManagerId,
                message: `Your expense claim for ${req.category} was ${req.status.toLowerCase()}.`,
                link: '/expenses/my-requests',
                isRead: false,
                timestamp: new Date(new Date(req.submissionDate).getTime() + 86400000).toISOString() // 1 day later
            });
        }
    });

    // From salary change requests
    mockSalaryChangeRequests.forEach(req => {
         const employee = mockEmployees.find(e => e.id === req.employeeId);
         if (!employee) return;

         if (req.status === SalaryChangeStatus.PENDING) {
             notifications.push({
                 id: `notif_sal_${req.id}_req`,
                 recipientId: req.approverId,
                 actorId: req.requesterId,
                 message: `Salary change approval requested for ${employee.name}.`,
                 link: '/requests/salary',
                 isRead: false,
                 timestamp: req.requestDate
             });
         }
         if (req.status === SalaryChangeStatus.APPROVED || req.status === SalaryChangeStatus.REJECTED) {
             notifications.push({
                 id: `notif_sal_${req.id}_res_admin`,
                 recipientId: req.requesterId,
                 actorId: req.approverId,
                 message: `Salary change request for ${employee.name} was ${req.status}.`,
                 link: '/payroll/assignment',
                 isRead: true,
                 timestamp: req.approvalDate || new Date().toISOString()
             });
              notifications.push({
                 id: `notif_sal_${req.id}_res_emp`,
                 recipientId: req.employeeId,
                 actorId: req.approverId,
                 message: `Your salary revision has been ${req.status}.`,
                 link: '/finance/my-payslips',
                 isRead: false,
                 timestamp: req.approvalDate || new Date().toISOString()
             });
         }
    });

    // From confirmation requests
    mockConfirmationRequests.forEach(req => {
        const employee = mockEmployees.find(e => e.id === req.employeeId);
        if (!employee) return;

        if (req.status === ConfirmationStatus.PENDING_REPORTING_MANAGER_APPROVAL && employee.reportingManagerId) {
             notifications.push({
                id: `notif_conf_${req.id}_req`,
                recipientId: employee.reportingManagerId,
                actorId: 'AI4S001', // System/Admin initiated
                message: `Confirmation approval for ${employee.name} requires your attention.`,
                link: '/requests/confirmation',
                isRead: false,
                timestamp: req.requestDate
            });
        }
    });

    // From recruitment
    mockCandidates.forEach(candidate => {
        candidate.interviews.forEach(interview => {
            if (interview.status === InterviewStatus.SCHEDULED) {
                notifications.push({
                    id: `notif_interview_${interview.id}`,
                    recipientId: interview.interviewerId,
                    actorId: candidate.submittedBy,
                    message: `You are scheduled to interview ${candidate.name} for ${candidate.applyingForRole}.`,
                    link: '/recruitment/my-interviews',
                    isRead: false,
                    timestamp: interview.scheduledAt
                });
            }
        });
    });
    
    // From performance management
    mockKudos.forEach(kudo => {
        const giver = mockEmployees.find(e => e.id === kudo.giverId);
        if (!giver) return;
        notifications.push({
            id: `notif_kudo_${kudo.id}`,
            recipientId: kudo.receiverId,
            actorId: kudo.giverId,
            message: `${giver.name} gave you kudos!`,
            link: '/performance/my-goals',
            isRead: false,
            timestamp: kudo.timestamp,
        });
    });

    mockPerformanceReviews.forEach(review => {
        if(review.status === ReviewStatus.SELF_ASSESSMENT_COMPLETE) {
            const employee = mockEmployees.find(e => e.id === review.employeeId);
            if(employee && employee.reportingManagerId) {
                notifications.push({
                    id: `notif_review_${review.id}`,
                    recipientId: employee.reportingManagerId,
                    actorId: employee.id,
                    message: `${employee.name} has completed their self-assessment.`,
                    link: '/performance/team-reviews',
                    isRead: true,
                    timestamp: new Date().toISOString()
                })
            }
        }
    });

    // From Lifecycle
    mockWorkflows.forEach(wf => {
        wf.tasks.forEach(task => {
            if(task.status === TaskStatus.PENDING) {
                const employee = mockEmployees.find(e => e.id === wf.employeeId);
                let recipientId = '';
                if(task.assigneeRole === UserRole.MANAGER) recipientId = employee?.reportingManagerId || '';
                else if (task.assigneeRole === UserRole.EMPLOYEE) recipientId = employee?.id || '';
                else recipientId = task.assigneeId || '';
                
                if(recipientId && employee) {
                     notifications.push({
                        id: `notif_task_${task.id}`,
                        recipientId: recipientId,
                        actorId: 'AI4S001', // System
                        message: `You have a new task: '${task.name}' for ${employee.name}.`,
                        link: '/lifecycle/my-tasks',
                        isRead: false,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });
    });

    mockEmployeeDocuments.forEach(doc => {
         if(doc.status === DocumentStatus.SUBMITTED) {
             const employee = mockEmployees.find(e => e.id === doc.employeeId);
             if(employee) {
                  notifications.push({
                    id: `notif_doc_${doc.id}`,
                    recipientId: 'AI4S_Pawan', // HR
                    actorId: employee.id,
                    message: `${employee.name} has submitted their ${doc.documentName}.`,
                    link: '/lifecycle/document-hub',
                    isRead: false,
                    timestamp: new Date().toISOString()
                });
             }
         }
    });

    // From Learning
    mockLearningAssignments.forEach(la => {
        if(la.status === LearningStatus.ASSIGNED) {
            const assigner = mockEmployees.find(e => e.id === la.assignedById);
            if (assigner) {
                notifications.push({
                    id: `notif_learn_${la.id}`,
                    recipientId: la.employeeId,
                    actorId: la.assignedById,
                    message: `${assigner.name} assigned you a new learning item: "${la.title}".`,
                    link: '/learning/my-courses',
                    isRead: false,
                    timestamp: la.assignedAt,
                });
            }
        }
    });


    mockNotifications = notifications.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

generateInitialNotifications();