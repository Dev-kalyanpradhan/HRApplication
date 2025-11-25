
import React, { useState, useMemo } from 'react';
import { Employee, ConfirmationStatus, DocumentStatus } from '../../types';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { Mail, Briefcase, Building, Bell, User, ArrowRight, Phone, MapPin, Calendar, Heart, Droplets, UserCheck, FileText, Banknote, BookUser, Building2, School } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatRelativeTime } from '../../utils/dateUtils';

interface EmployeeProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee;
}

const InfoItem: React.FC<{ icon: React.ReactNode, label: string, value?: string | null }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="text-slate-400 mt-1 flex-shrink-0 w-5 h-5">{icon}</div>
        <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="font-medium text-slate-700">{value || <span className="text-slate-400 italic">Not provided</span>}</p>
        </div>
    </div>
);


const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({ isOpen, onClose, employee }) => {
    const { employees, notifications, employeeDocuments } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'notifications'>('profile');
    
    const reportingManager = useMemo(() => employees.find(e => e.id === employee.reportingManagerId), [employees, employee]);
    const functionalManager = useMemo(() => employees.find(e => e.id === employee.functionalManagerId), [employees, employee]);

    const ProfileTab = () => (
        <div className="space-y-8">
            {/* Personal Info */}
            <section>
                <h4 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                     <InfoItem icon={<Calendar size={20}/>} label="Date of Birth" value={employee.dateOfBirth && new Date(employee.dateOfBirth+'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                     <InfoItem icon={<Heart size={20}/>} label="Marital Status" value={employee.maritalStatus} />
                     <InfoItem icon={<Droplets size={20}/>} label="Blood Group" value={employee.bloodGroup} />
                     <InfoItem icon={<Phone size={20}/>} label="Phone Number" value={employee.phone} />
                     <div className="sm:col-span-2"><InfoItem icon={<MapPin size={20}/>} label="Current Address" value={employee.currentAddress} /></div>
                     <div className="sm:col-span-2"><InfoItem icon={<MapPin size={20}/>} label="Permanent Address" value={employee.permanentAddress} /></div>
                </div>
            </section>
             {/* Emergency Contact */}
             <section>
                <h4 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                     <InfoItem icon={<User size={20}/>} label="Name" value={employee.emergencyContact?.name} />
                     <InfoItem icon={<BookUser size={20}/>} label="Relationship" value={employee.emergencyContact?.relationship} />
                     <InfoItem icon={<Phone size={20}/>} label="Phone" value={employee.emergencyContact?.phone} />
                     <InfoItem icon={<Mail size={20}/>} label="Email" value={employee.emergencyContact?.email} />
                </div>
            </section>
             {/* Professional Details */}
             <section>
                <h4 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Professional Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                     <InfoItem icon={<Briefcase size={20}/>} label="Role" value={employee.role} />
                     <InfoItem icon={<Building size={20}/>} label="Department" value={employee.department} />
                     <InfoItem icon={<Calendar size={20}/>} label="Joining Date" value={new Date(employee.joiningDate).toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'})} />
                     <InfoItem icon={<UserCheck size={20}/>} label="Employment Status" value={`${employee.employmentType} - ${employee.confirmationStatus}`} />
                     <InfoItem icon={<User size={20}/>} label="Reporting Manager" value={reportingManager?.name} />
                     <InfoItem icon={<User size={20}/>} label="Functional Manager" value={functionalManager?.name} />
                </div>
            </section>
            {/* Education & History */}
            <section>
                <h4 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Education & Work History</h4>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h5 className="font-semibold text-slate-600 flex items-center gap-2"><School size={16}/> Education</h5>
                        {employee.educationRecords && employee.educationRecords.length > 0 ? employee.educationRecords.map((edu, i) => (
                             <div key={i} className="pl-6 text-sm"><p className="font-medium text-slate-800">{edu.degree}</p><p className="text-slate-500">{edu.institution} - {edu.yearOfCompletion}</p></div>
                        )) : <p className="pl-6 text-sm text-slate-500 italic">No education records found.</p>}
                    </div>
                     <div className="space-y-2">
                        <h5 className="font-semibold text-slate-600 flex items-center gap-2"><Building2 size={16}/> Previous Employment</h5>
                        {employee.previousEmployment && employee.previousEmployment.length > 0 ? employee.previousEmployment.map((job, i) => (
                             <div key={i} className="pl-6 text-sm"><p className="font-medium text-slate-800">{job.role} at {job.companyName}</p><p className="text-slate-500">{job.startDate} to {job.endDate}</p></div>
                        )) : <p className="pl-6 text-sm text-slate-500 italic">No employment history found.</p>}
                    </div>
                </div>
            </section>
            {/* Financial Details */}
             <section>
                <h4 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Financial & Statutory Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <InfoItem icon={<Banknote size={20}/>} label="Bank Name" value={employee.bankDetails?.bankName} />
                    <InfoItem icon={<Banknote size={20}/>} label="Account Number" value={employee.bankDetails?.accountNumber} />
                    <InfoItem icon={<FileText size={20}/>} label="PAN" value={employee.statutoryDetails?.panNumber} />
                    <InfoItem icon={<FileText size={20}/>} label="Aadhaar" value={employee.statutoryDetails?.aadhaarNumber} />
                    <InfoItem icon={<FileText size={20}/>} label="UAN (PF)" value={employee.statutoryDetails?.uanNumber} />
                </div>
            </section>
        </div>
    );
    
    const DocumentsTab = () => {
        const docs = employeeDocuments.filter(d => d.employeeId === employee.id);
        const getStatusChip = (status: DocumentStatus) => {
            const colors = {
                [DocumentStatus.PENDING]: 'bg-slate-100 text-slate-800',
                [DocumentStatus.SUBMITTED]: 'bg-yellow-100 text-yellow-800',
                [DocumentStatus.VERIFIED]: 'bg-green-100 text-green-800',
                [DocumentStatus.REJECTED]: 'bg-red-100 text-red-800',
            };
            return colors[status];
        };
        return (
            <div className="space-y-3">
                 {docs.length > 0 ? docs.map(doc => (
                     <div key={doc.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                        <div>
                             <p className="font-semibold text-slate-800">{doc.documentName}</p>
                              {doc.status === DocumentStatus.REJECTED && doc.rejectionReason && <p className="text-xs text-red-600">Reason: {doc.rejectionReason}</p>}
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(doc.status)}`}>
                            {doc.status}
                        </span>
                    </div>
                 )) : <p className="text-center py-10 text-slate-500">No documents found for this user.</p>}
            </div>
        );
    };

    const NotificationHistoryTab = () => {
        const employeeNotifications = notifications
            .filter(n => n.recipientId === employee.id || n.actorId === employee.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return (
            <div className="space-y-3">
                {employeeNotifications.length > 0 ? (
                    employeeNotifications.slice(0, 20).map(notification => {
                        const actor = employees.find(e => e.id === notification.actorId);
                        
                        return (
                            <div key={notification.id} className="p-3 bg-slate-50 rounded-lg text-sm border border-slate-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <Avatar name={actor?.name || 'System'} size="sm"/>
                                        <span className="font-semibold">{actor?.name || 'System'}</span>
                                    </div>
                                    <span className="text-xs text-slate-500 flex-shrink-0">{formatRelativeTime(notification.timestamp)}</span>
                                </div>
                                <p className="text-slate-700 pl-8">{notification.message}</p>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center py-10 text-slate-500">No notification history for this user.</p>
                )}
            </div>
        )
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Employee Profile" size="xl">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left border-b pb-6 gap-6">
                <Avatar name={employee.name} size="xl" />
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{employee.name}</h2>
                    <p className="text-slate-500">{employee.role}</p>
                    <p className="text-sm text-slate-500 font-mono mt-1">{employee.id}</p>
                </div>
            </div>
            
            <div className="mt-6">
                <div className="flex border-b mb-6">
                    <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 font-medium text-sm ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Profile</button>
                    <button onClick={() => setActiveTab('documents')} className={`px-4 py-2 font-medium text-sm ${activeTab === 'documents' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Documents</button>
                    <button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 font-medium text-sm ${activeTab === 'notifications' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Activity Feed</button>
                </div>
                <div className="max-h-[55vh] overflow-y-auto pr-2">
                    {activeTab === 'profile' && <ProfileTab />}
                    {activeTab === 'documents' && <DocumentsTab />}
                    {activeTab === 'notifications' && <NotificationHistoryTab />}
                </div>
            </div>

        </Modal>
    );
};

export default EmployeeProfileModal;
