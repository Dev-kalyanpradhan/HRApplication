import { Employee, UserRole, WorkLocation, EmploymentType, ConfirmationStatus } from '../types';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to map DB columns (snake_case) to Frontend types (camelCase)
const mapDbEmployeeToFrontend = (dbEmp: any): Employee => {
  return {
    id: dbEmp.id?.toString() || dbEmp.emp_code || 'UNKNOWN',
    password: 'password', // Default password as DB shouldn't return it directly for security in this simple demo
    firstName: dbEmp.first_name || '',
    lastName: dbEmp.last_name || '',
    name: `${dbEmp.first_name} ${dbEmp.last_name}`.trim(),
    email: dbEmp.email || '',
    role: dbEmp.role_id || 'Employee', // Assuming role_id stores the role name for simplicity in this demo
    userRole: dbEmp.is_admin ? UserRole.ADMIN : (dbEmp.is_manager ? UserRole.MANAGER : UserRole.EMPLOYEE),
    department: dbEmp.department_id || 'General', // Assuming department_id stores name
    reportingManagerId: null, // Needs complex mapping if relations exist in DB
    functionalManagerId: null,
    joiningDate: dbEmp.date_of_joining ? new Date(dbEmp.date_of_joining).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    workLocation: WorkLocation.OFFICE,
    leaveBalance: { casual: 12, sick: 10, earned: 15 }, // Defaults
    functionAccess: [], // Defaults
    employmentType: EmploymentType.REGULAR,
    confirmationStatus: ConfirmationStatus.CONFIRMED,
    ctc: 0
  };
};

export const apiService = {
  getEmployees: async (): Promise<Employee[] | null> => {
    try {
      const response = await fetch(`${API_URL}/employees`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      return data.map(mapDbEmployeeToFrontend);
    } catch (error) {
      console.error("API Error (getEmployees):", error);
      return null; // Return null to indicate failure/fallback needed
    }
  },

  createEmployee: async (employee: any) => {
    try {
        const dbPayload = {
            emp_code: employee.id,
            first_name: employee.firstName,
            last_name: employee.lastName,
            email: employee.email,
            date_of_joining: employee.joiningDate,
            // Add other fields as needed by your DB schema
        };
        
        const response = await fetch(`${API_URL}/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dbPayload)
        });
        if (!response.ok) throw new Error('Failed to create employee');
        return await response.json();
    } catch (error) {
        console.error("API Error (createEmployee):", error);
        throw error;
    }
  }
};