import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Employee, UserRole, WorkLocation, EmploymentType, ConfirmationStatus, EducationRecord, PreviousEmployment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, Plus } from 'lucide-react';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employee: Omit<Employee, 'id' | 'leaveBalance' | 'functionAccess'>) => void;
  managers: Employee[];
}

const initialFormData = {
    firstName: '',
    lastName: '',
    middleName: '',
    password: '',
    email: '',
    role: '',
    userRole: UserRole.EMPLOYEE,
    department: '',
    reportingManagerId: null as string | null,
    functionalManagerId: null as string | null,
    joiningDate: '',
    workLocation: WorkLocation.OFFICE,
    ipRestrictionExempt: false,
    employmentType: EmploymentType.REGULAR,
    probationEndDate: '',
    trainingEndDate: '',
    confirmationStatus: ConfirmationStatus.IN_PROBATION,
    
    // Personal Info
    photoUrl: '',
    dateOfBirth: '',
    maritalStatus: '',
    bloodGroup: '',
    fatherName: '',
    motherName: '',
    phone: '',
    permanentAddress: '',
    currentAddress: '',
    emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
    },

    // Statutory and Compliance
    bankDetails: {
        bankName: '',
        accountNumber: '',
        ifscCode: ''
    },
    statutoryDetails: {
        panNumber: '',
        aadhaarNumber: '',
        passportNumber: '',
        drivingLicenseNumber: '',
        uanNumber: '',
        esiNumber: ''
    },

    // Educational and Professional Records
    educationRecords: [] as EducationRecord[],
    previousEmployment: [] as PreviousEmployment[],

    ctc: 0,
};


const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onAddEmployee, managers }) => {
  const { departments, roles } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState('core');
  
  useEffect(() => {
    // Reset form data when modal opens
    if (isOpen) {
        setFormData(initialFormData);
        setActiveTab('core');
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.joiningDate) {
        // Correct for timezone offset to prevent date-off-by-one errors
        const joiningDateObj = new Date(formData.joiningDate);
        joiningDateObj.setMinutes(joiningDateObj.getMinutes() + joiningDateObj.getTimezoneOffset());

        if (isNaN(joiningDateObj.getTime())) return;

        if (formData.employmentType === EmploymentType.REGULAR) {
            const date = new Date(joiningDateObj);
            date.setMonth(date.getMonth() + 6);
            setFormData(prev => ({
                ...prev, 
                probationEndDate: date.toISOString().split('T')[0], 
                trainingEndDate: '',
                confirmationStatus: ConfirmationStatus.IN_PROBATION
            }));
        } else if (formData.employmentType === EmploymentType.TRAINEE) {
            const date = new Date(joiningDateObj);
            date.setFullYear(date.getFullYear() + 1);
            setFormData(prev => ({
                ...prev, 
                trainingEndDate: date.toISOString().split('T')[0], 
                probationEndDate: '',
                confirmationStatus: ConfirmationStatus.IN_TRAINING
            }));
        }
    }
  }, [formData.joiningDate, formData.employmentType]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleNestedChange = (category: 'emergencyContact' | 'bankDetails' | 'statutoryDetails', e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [category]: {
            ...prev[category],
            [name]: value
        }
    }));
  };

   const handleArrayChange = (category: 'educationRecords' | 'previousEmployment', index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newArray = [...(prev[category] || [])];
            // @ts-ignore
            newArray[index] = { ...newArray[index], [name]: value };
            return { ...prev, [category]: newArray };
        });
    };

    const addArrayItem = (category: 'educationRecords' | 'previousEmployment') => {
        const newItem = category === 'educationRecords'
            ? { degree: '', institution: '', yearOfCompletion: '' }
            : { companyName: '', role: '', startDate: '', endDate: '' };
        
        setFormData(prev => ({
            ...prev,
            [category]: [...(prev[category] || []), newItem]
        }));
    };

    const removeArrayItem = (category: 'educationRecords' | 'previousEmployment', index: number) => {
        setFormData(prev => ({
            ...prev,
            [category]: (prev[category] || []).filter((_, i) => i !== index)
        }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmployee = {
      ...formData,
      name: `${formData.firstName} ${formData.middleName || ''} ${formData.lastName}`.replace(/\s+/g, ' ').trim(),
      reportingManagerId: formData.reportingManagerId || null,
      functionalManagerId: formData.functionalManagerId || null,
      ctc: Number(formData.ctc) || 0,
    };
    onAddEmployee(newEmployee);
    onClose();
  };

  const TabButton: React.FC<{tabId: string; children: React.ReactNode}> = ({ tabId, children }) => (
    <button
        type="button"
        onClick={() => setActiveTab(tabId)}
        className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === tabId ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
    >
        {children}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Employee" size="xl">
      <form onSubmit={handleSubmit}>
         <div className="flex border-b mb-6">
            <TabButton tabId="core">Core Info</TabButton>
            <TabButton tabId="personal">Personal Details</TabButton>
            <TabButton tabId="professional">Professional History</TabButton>
            <TabButton tabId="financial">Financial & Statutory</TabButton>
        </div>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {activeTab === 'core' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-6">
                        <h3 className="text-lg font-semibold text-slate-700 md:col-span-3">Core Information</h3>
                        <Input id="firstName" name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
                        <Input id="middleName" name="middleName" label="Middle Name" value={formData.middleName} onChange={handleChange} />
                        <Input id="lastName" name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required />
                        <Input id="email" name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} required />
                        <Input id="password" name="password" label="Set Initial Password" type="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <h3 className="text-lg font-semibold text-slate-700 md:col-span-3">Role & Hierarchy</h3>
                        <Select id="role" name="role" label="Role" value={formData.role} onChange={handleChange} required>
                            <option value="">Select a role</option>
                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                        </Select>
                        <Select id="department" name="department" label="Department" value={formData.department} onChange={handleChange} required>
                            <option value="">Select a department</option>
                            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </Select>
                        <Select id="userRole" name="userRole" label="User Role" value={formData.userRole} onChange={handleChange} required>
                            <option value={UserRole.EMPLOYEE}>Employee</option>
                            <option value={UserRole.MANAGER}>Manager</option>
                            <option value={UserRole.ADMIN}>Admin</option>
                        </Select>
                        <Select id="workLocation" name="workLocation" label="Work Location" value={formData.workLocation} onChange={handleChange} required>
                            <option value={WorkLocation.OFFICE}>Work from Office</option>
                            <option value={WorkLocation.HOME}>Work from Home</option>
                        </Select>
                        <Select id="reportingManagerId" name="reportingManagerId" label="Reporting Manager" value={formData.reportingManagerId || ''} onChange={handleChange}>
                            <option value="">No Manager</option>
                            {managers.map(manager => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
                        </Select>
                        <Select id="functionalManagerId" name="functionalManagerId" label="Functional Manager" value={formData.functionalManagerId || ''} onChange={handleChange}>
                            <option value="">No Manager</option>
                            {managers.map(manager => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
                        </Select>
                        <Input id="joiningDate" name="joiningDate" label="Joining Date" type="date" value={formData.joiningDate} onChange={handleChange} required />
                        <Select id="employmentType" name="employmentType" label="Employment Type" value={formData.employmentType} onChange={handleChange}>
                            <option value={EmploymentType.REGULAR}>Regular</option>
                            <option value={EmploymentType.TRAINEE}>Trainee</option>
                        </Select>
                        {formData.employmentType === EmploymentType.REGULAR && (
                            <Input id="probationEndDate" name="probationEndDate" label="Probation End Date" type="date" value={formData.probationEndDate || ''} readOnly />
                        )}
                        {formData.employmentType === EmploymentType.TRAINEE && (
                            <Input id="trainingEndDate" name="trainingEndDate" label="Training End Date" type="date" value={formData.trainingEndDate || ''} readOnly />
                        )}
                         <div className="md:col-span-3 flex items-center space-x-3 mt-4 pt-4 border-t">
                            <input type="checkbox" id="ipRestrictionExempt" name="ipRestrictionExempt" checked={formData.ipRestrictionExempt} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="ipRestrictionExempt" className="text-sm font-medium text-slate-700">Exempt from IP Address Restriction</label>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'personal' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-6">
                        <h3 className="text-lg font-semibold text-slate-700 md:col-span-3">Personal Information</h3>
                        <Input id="dateOfBirth" name="dateOfBirth" label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                        <Select id="maritalStatus" name="maritalStatus" label="Marital Status" value={formData.maritalStatus} onChange={handleChange}>
                            <option value="">Select...</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Other">Other</option>
                        </Select>
                        <Input id="bloodGroup" name="bloodGroup" label="Blood Group" value={formData.bloodGroup} onChange={handleChange} />
                        <Input id="phone" name="phone" label="Personal Phone" value={formData.phone} onChange={handleChange} />
                        <Input id="fatherName" name="fatherName" label="Father's Name" value={formData.fatherName} onChange={handleChange} />
                        <Input id="motherName" name="motherName" label="Mother's Name" value={formData.motherName} onChange={handleChange} />
                        <div className="md:col-span-3"><Input id="photoUrl" name="photoUrl" label="Passport Photo URL" value={formData.photoUrl} onChange={handleChange} placeholder="https://example.com/photo.png" /></div>
                        <div className="md:col-span-3"><Input id="currentAddress" name="currentAddress" label="Current Address" value={formData.currentAddress} onChange={handleChange} /></div>
                        <div className="md:col-span-3"><Input id="permanentAddress" name="permanentAddress" label="Permanent Address" value={formData.permanentAddress} onChange={handleChange} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <h3 className="text-lg font-semibold text-slate-700 md:col-span-2">Emergency Contact</h3>
{/* Fix: Added id props to Input components */}
                        <Input id="emergencyContactName" name="name" label="Full Name" value={formData.emergencyContact.name} onChange={(e) => handleNestedChange('emergencyContact', e)} />
                        <Input id="emergencyContactRelationship" name="relationship" label="Relationship" value={formData.emergencyContact.relationship} onChange={(e) => handleNestedChange('emergencyContact', e)} />
                        <Input id="emergencyContactPhone" name="phone" label="Phone Number" value={formData.emergencyContact.phone} onChange={(e) => handleNestedChange('emergencyContact', e)} />
                        <Input id="emergencyContactEmail" name="email" label="Email Address" type="email" value={formData.emergencyContact.email} onChange={(e) => handleNestedChange('emergencyContact', e)} />
                    </div>
                </div>
            )}
            {activeTab === 'professional' && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Education Records</h3>
                        {(formData.educationRecords || []).map((record, index) => (
                            <div key={index} className="grid grid-cols-12 gap-x-2 items-end border-b pb-3 mb-3">
{/* Fix: Added id props to Input components */}
                                <div className="col-span-4"><Input id={`edu_degree_${index}`} label="Degree" name="degree" value={record.degree} onChange={e => handleArrayChange('educationRecords', index, e)} /></div>
                                <div className="col-span-4"><Input id={`edu_institution_${index}`} label="Institution" name="institution" value={record.institution} onChange={e => handleArrayChange('educationRecords', index, e)} /></div>
                                <div className="col-span-3"><Input id={`edu_year_${index}`} label="Year" name="yearOfCompletion" value={record.yearOfCompletion} onChange={e => handleArrayChange('educationRecords', index, e)} /></div>
                                <div className="col-span-1"><Button type="button" variant="ghost" size="sm" className="!p-2 text-red-500" onClick={() => removeArrayItem('educationRecords', index)}><Trash2 size={16}/></Button></div>
                            </div>
                        ))}
                        <Button type="button" variant="secondary" size="sm" onClick={() => addArrayItem('educationRecords')} leftIcon={<Plus size={14}/>}>Add Education</Button>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2 mt-6">Previous Employment</h3>
                        {(formData.previousEmployment || []).map((record, index) => (
                            <div key={index} className="grid grid-cols-12 gap-x-2 items-end border-b pb-3 mb-3">
{/* Fix: Added id props to Input components */}
                                <div className="col-span-4"><Input id={`prev_company_${index}`} label="Company" name="companyName" value={record.companyName} onChange={e => handleArrayChange('previousEmployment', index, e)} /></div>
                                <div className="col-span-3"><Input id={`prev_role_${index}`} label="Role" name="role" value={record.role} onChange={e => handleArrayChange('previousEmployment', index, e)} /></div>
                                <div className="col-span-2"><Input id={`prev_start_date_${index}`} label="Start Date" name="startDate" type="date" value={record.startDate} onChange={e => handleArrayChange('previousEmployment', index, e)} /></div>
                                <div className="col-span-2"><Input id={`prev_end_date_${index}`} label="End Date" name="endDate" type="date" value={record.endDate} onChange={e => handleArrayChange('previousEmployment', index, e)} /></div>
                                <div className="col-span-1"><Button type="button" variant="ghost" size="sm" className="!p-2 text-red-500" onClick={() => removeArrayItem('previousEmployment', index)}><Trash2 size={16}/></Button></div>
                            </div>
                        ))}
                        <Button type="button" variant="secondary" size="sm" onClick={() => addArrayItem('previousEmployment')} leftIcon={<Plus size={14}/>}>Add Employment</Button>
                    </div>
                </div>
            )}
            {activeTab === 'financial' && (
                <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-6">
                        <h3 className="text-lg font-semibold text-slate-700 md:col-span-3">Salary & Bank Details</h3>
                        <Input id="ctc" name="ctc" label="Annual CTC (₹)" type="number" value={formData.ctc.toString()} onChange={handleChange} required />
{/* Fix: Added id props to Input components */}
                        <Input id="bankName" name="bankName" label="Bank Name" value={formData.bankDetails.bankName} onChange={e => handleNestedChange('bankDetails', e)} />
                        <Input id="accountNumber" name="accountNumber" label="Account Number" value={formData.bankDetails.accountNumber} onChange={e => handleNestedChange('bankDetails', e)} />
                        <Input id="ifscCode" name="ifscCode" label="IFSC Code" value={formData.bankDetails.ifscCode} onChange={e => handleNestedChange('bankDetails', e)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <h3 className="text-lg font-semibold text-slate-700 md:col-span-3">Statutory Details</h3>
{/* Fix: Added id props to Input components */}
                        <Input id="panNumber" name="panNumber" label="PAN Number" value={formData.statutoryDetails.panNumber} onChange={e => handleNestedChange('statutoryDetails', e)} />
                        <Input id="aadhaarNumber" name="aadhaarNumber" label="Aadhaar Number" value={formData.statutoryDetails.aadhaarNumber} onChange={e => handleNestedChange('statutoryDetails', e)} />
                        <Input id="uanNumber" name="uanNumber" label="UAN (PF Number)" value={formData.statutoryDetails.uanNumber} onChange={e => handleNestedChange('statutoryDetails', e)} />
                        <Input id="esiNumber" name="esiNumber" label="ESI Number" value={formData.statutoryDetails.esiNumber} onChange={e => handleNestedChange('statutoryDetails', e)} />
                        <Input id="passportNumber" name="passportNumber" label="Passport Number" value={formData.statutoryDetails.passportNumber} onChange={e => handleNestedChange('statutoryDetails', e)} />
                        <Input id="drivingLicenseNumber" name="drivingLicenseNumber" label="Driving License" value={formData.statutoryDetails.drivingLicenseNumber} onChange={e => handleNestedChange('statutoryDetails', e)} />
                    </div>
                </div>
            )}
        </div>
        <div className="flex justify-end gap-4 pt-4 mt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Add Employee</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEmployeeModal;