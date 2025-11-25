

import React, { useState, useMemo, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceRecord, AttendanceStatus, Employee, LeaveType } from '../../types';
import Button from '../../components/ui/Button';
import { Search, Download, Upload, Loader, List, Grid } from 'lucide-react';
import { INDIAN_HOLIDAYS } from '../../constants';
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar';
import GlobalAttendanceModal from '../../components/attendance/GlobalAttendanceModal';
import MonthlyAttendanceSheet from '../../components/attendance/MonthlyAttendanceSheet';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';


const statusAbbreviation: Record<AttendanceStatus, string> = {
    [AttendanceStatus.PRESENT]: 'P',
    [AttendanceStatus.ABSENT]: 'A',
    [AttendanceStatus.ON_LEAVE]: 'L',
    [AttendanceStatus.HOLIDAY]: 'H',
    [AttendanceStatus.WEEK_OFF]: 'WO',
    [AttendanceStatus.HALF_DAY_LEAVE]: 'HD',
    [AttendanceStatus.HALF_DAY_PRESENT_ABSENT]: 'HA',
};

const abbreviationToStatus: { [key: string]: AttendanceStatus | undefined } = Object.fromEntries(
  Object.entries(statusAbbreviation).map(([key, value]) => [value.toUpperCase(), key as AttendanceStatus])
);

interface LeaveDeductionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (leaveType: LeaveType) => void;
    employee: Employee | null;
    date: string;
}

const LeaveDeductionModal: React.FC<LeaveDeductionModalProps> = ({ isOpen, onClose, onConfirm, employee, date }) => {
    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | ''>('');

    if (!employee) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedLeaveType) {
            onConfirm(selectedLeaveType);
        }
    };

    const leaveBalance = employee.leaveBalance;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Mark Leave for ${employee.name} on ${new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { timeZone: 'UTC' })}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm text-slate-600">Select which leave balance to deduct from. The employee's current balances are shown below.</p>
                <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                name="leaveType"
                                value={LeaveType.CASUAL}
                                checked={selectedLeaveType === LeaveType.CASUAL}
                                onChange={() => setSelectedLeaveType(LeaveType.CASUAL)}
                                className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                                disabled={leaveBalance.casual <= 0}
                            />
                            <span className="ml-3 text-sm font-medium text-slate-700">{LeaveType.CASUAL}</span>
                        </div>
                        <span className={`text-sm font-medium ${leaveBalance.casual <= 0 ? 'text-slate-400' : ''}`}>Balance: <span className="font-bold text-blue-700">{leaveBalance.casual}</span></span>
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300">
                         <div className="flex items-center">
                            <input
                                type="radio"
                                name="leaveType"
                                value={LeaveType.SICK}
                                checked={selectedLeaveType === LeaveType.SICK}
                                onChange={() => setSelectedLeaveType(LeaveType.SICK)}
                                className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                                disabled={leaveBalance.sick <= 0}
                            />
                            <span className="ml-3 text-sm font-medium text-slate-700">{LeaveType.SICK}</span>
                        </div>
                        <span className={`text-sm font-medium ${leaveBalance.sick <= 0 ? 'text-slate-400' : ''}`}>Balance: <span className="font-bold text-amber-700">{leaveBalance.sick}</span></span>
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300">
                         <div className="flex items-center">
                            <input
                                type="radio"
                                name="leaveType"
                                value={LeaveType.EARNED}
                                checked={selectedLeaveType === LeaveType.EARNED}
                                onChange={() => setSelectedLeaveType(LeaveType.EARNED)}
                                className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                                disabled={leaveBalance.earned <= 0}
                            />
                            <span className="ml-3 text-sm font-medium text-slate-700">{LeaveType.EARNED}</span>
                        </div>
                        <span className={`text-sm font-medium ${leaveBalance.earned <= 0 ? 'text-slate-400' : ''}`}>Balance: <span className="font-bold text-green-700">{leaveBalance.earned}</span></span>
                    </label>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={!selectedLeaveType}>Confirm & Deduct Leave</Button>
                </div>
            </form>
        </Modal>
    );
};


const BulkManagementView: React.FC = () => {
    const { employees, attendance, markDayAsHoliday, markDayAsWeekOff, markDayAsWorking, bulkUpdateAttendance, markAttendanceAndDeductLeave } = useAuth();
    
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
    const [selectedGlobalDate, setSelectedGlobalDate] = useState<string>('');
    
    const [monthlyRecords, setMonthlyRecords] = useState<AttendanceRecord[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    const [isLeaveDeductionModalOpen, setIsLeaveDeductionModalOpen] = useState(false);
    const [leaveDeductionData, setLeaveDeductionData] = useState<{employeeId: string, date: string} | null>(null);

    const defaultFilters = {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        searchTerm: '',
        highlightStartDate: '',
        highlightEndDate: '',
    };

    const [filterInputs, setFilterInputs] = useState(defaultFilters);
    const [activeFilters, setActiveFilters] = useState(defaultFilters);
    
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

    const {
        year: sheetYear, 
        month: sheetMonth, 
        searchTerm: activeSearchTerm, 
        highlightStartDate: activeHighlightStart, 
        highlightEndDate: activeHighlightEnd
    } = activeFilters;
    
    const filteredEmployees = useMemo(() => {
        if (!activeSearchTerm.trim()) {
            return employees;
        }
        return employees.filter(
            (emp) =>
                emp.name.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
                emp.id.toLowerCase().includes(activeSearchTerm.toLowerCase())
        );
    }, [employees, activeSearchTerm]);

    useEffect(() => {
        const records = attendance.filter(r => {
            const d = new Date(r.date);
            return d.getFullYear() === sheetYear && d.getMonth() + 1 === sheetMonth;
        });
        setMonthlyRecords(records);
        setHasChanges(false);
    }, [sheetYear, sheetMonth, attendance]);
    
    const handleGlobalDayClick = (date: string) => {
        setSelectedGlobalDate(date);
        setIsGlobalModalOpen(true);
    };
    
    const handleGlobalUpdate = (action: 'holiday' | 'week_off' | 'working') => {
        if (action === 'holiday') markDayAsHoliday(selectedGlobalDate);
        else if (action === 'week_off') markDayAsWeekOff(selectedGlobalDate);
        else markDayAsWorking(selectedGlobalDate);
        setIsGlobalModalOpen(false);
    };

    const handleRecordsChange = (newRecordsFn: React.SetStateAction<AttendanceRecord[]>) => {
        setMonthlyRecords(newRecordsFn);
        if (!hasChanges) {
            setHasChanges(true);
        }
    };

    const handleSaveChanges = () => {
        bulkUpdateAttendance(monthlyRecords, sheetYear, sheetMonth);
        setHasChanges(false);
    };
    
    const handleCancelChanges = () => {
        const records = attendance.filter(r => {
            const d = new Date(r.date);
            return d.getFullYear() === sheetYear && d.getMonth() + 1 === sheetMonth;
        });
        setMonthlyRecords(records);
        setHasChanges(false);
    };

    const handleFilterInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilterInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = () => {
        setActiveFilters(filterInputs);
    };

    const handleClearFilters = () => {
        setFilterInputs(defaultFilters);
        setActiveFilters(defaultFilters);
    };
    
    const handleDownloadTemplate = () => {
        const daysInMonth = new Date(sheetYear, sheetMonth, 0).getDate();
        const headers = ['Employee ID', 'Employee Name', ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
        
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayOfWeekRow = ['', '', ...Array.from({ length: daysInMonth }, (_, i) => {
            const dayOfWeek = new Date(sheetYear, sheetMonth - 1, i + 1).getDay();
            return weekDays[dayOfWeek];
        })];
        
        const rows = filteredEmployees.map(emp => {
            const row = [emp.id, `"${emp.name.replace(/"/g, '""')}"`];
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${sheetYear}-${String(sheetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const record = monthlyRecords.find(r => r.employeeId === emp.id && r.date === dateStr);
                row.push(record ? statusAbbreviation[record.status] : '');
            }
            return row.join(',');
        });

        const csvContent = [headers.join(','), dayOfWeekRow.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Attendance_Template_${monthNames[sheetMonth - 1]}_${sheetYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
            setUploadStatus({ type: '', message: '' });
        }
    };

    const handleFileUpload = async () => {
        if (!uploadedFile) return;

        setIsUploading(true);
        setUploadStatus({ type: 'info', message: '' });

        try {
            const fileContent = await uploadedFile.text();
            const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length < 3) throw new Error("CSV file is empty or has no data rows. Ensure it includes the header and day of week rows.");

            const headers = lines[0].split(',').map(h => h.trim());
            const expectedHeaders = ['Employee ID', 'Employee Name'];
            if (headers[0] !== expectedHeaders[0] || headers[1] !== expectedHeaders[1]) {
                throw new Error("Invalid CSV headers. Expected 'Employee ID' and 'Employee Name'.");
            }
            
            const newRecords: AttendanceRecord[] = [];
            const daysInMonth = new Date(sheetYear, sheetMonth, 0).getDate();

            for (let i = 2; i < lines.length; i++) {
                const data = lines[i].split(',');
                const employeeId = data[0].trim();
                
                if (!employees.some(e => e.id === employeeId)) {
                    console.warn(`Skipping unknown employee ID: ${employeeId}`);
                    continue;
                }

                for (let day = 1; day <= daysInMonth; day++) {
                    const statusStr = (data[day + 1] || '').trim().toUpperCase();
                    if (!statusStr) continue;

                    const status = abbreviationToStatus[statusStr];
                    if (!status) {
                         throw new Error(`Invalid status code "${statusStr}" for employee ${employeeId} on day ${day}.`);
                    }
                    
                    const dateStr = `${sheetYear}-${String(sheetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    newRecords.push({
                        id: `${employeeId}-${dateStr}`,
                        employeeId,
                        date: dateStr,
                        status,
                    });
                }
            }

            bulkUpdateAttendance(newRecords, sheetYear, sheetMonth);
            setUploadStatus({ type: 'success', message: `Successfully processed ${lines.length - 2} rows and updated attendance.` });
        } catch (error: any) {
            setUploadStatus({ type: 'error', message: error.message || 'Failed to process file.' });
        } finally {
            setIsUploading(false);
            setUploadedFile(null);
            const fileInput = document.getElementById('attendance-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        }
    };
    
    const handleMarkLeave = (employeeId: string, day: number) => {
        const dateStr = `${sheetYear}-${String(sheetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setLeaveDeductionData({ employeeId, date: dateStr });
        setIsLeaveDeductionModalOpen(true);
    };

    const handleConfirmLeaveDeduction = (leaveType: LeaveType) => {
        if (leaveDeductionData) {
            markAttendanceAndDeductLeave(leaveDeductionData.employeeId, leaveDeductionData.date, leaveType);
        }
        setIsLeaveDeductionModalOpen(false);
        setLeaveDeductionData(null);
    };

    const employeeForModal = useMemo(() => {
        if (!leaveDeductionData) return null;
        return employees.find(e => e.id === leaveDeductionData.employeeId) || null;
    }, [leaveDeductionData, employees]);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const availableYears = [...new Set(attendance.map(p => new Date(p.date).getFullYear()))].sort((a,b) => b-a);

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 flex-wrap gap-4">
                    <h3 className="text-lg font-semibold text-center">Global Holiday Management</h3>
                    <p className="text-sm text-slate-500">Click a day to mark it as a holiday or working day for all employees.</p>
                </div>
                <AttendanceCalendar 
                    year={calendarDate.getFullYear()}
                    month={calendarDate.getMonth()}
                    records={attendance}
                    holidays={INDIAN_HOLIDAYS}
                    isEditable={true}
                    onDayClick={handleGlobalDayClick}
                />
            </Card>
            <Card title="Bulk Attendance Upload">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                    <div className="p-4 bg-slate-50 border rounded-lg">
                        <h4 className="font-semibold text-slate-700">Step 1: Download Template</h4>
                        <p className="text-sm text-slate-500 mt-1">Download the CSV template for the selected month below. It will be pre-filled with current data and a row indicating the day of the week to help identify Sundays.</p>
                        <Button onClick={handleDownloadTemplate} variant="secondary" className="mt-4" leftIcon={<Download size={16}/>}>
                            Download Template
                        </Button>
                    </div>
                    <div className="p-4 bg-slate-50 border rounded-lg">
                        <h4 className="font-semibold text-slate-700">Step 2: Upload File</h4>
                        <p className="text-sm text-slate-500 mt-1">Once you've filled the template, upload it here to update the attendance records for the selected month.</p>
                        <div className="flex items-end gap-2 mt-4">
                            <Input type="file" id="attendance-upload" label="" accept=".csv" onChange={handleFileChange} className="!p-1.5" />
                            <Button onClick={handleFileUpload} disabled={!uploadedFile || isUploading} leftIcon={isUploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16}/>}>
                                {isUploading ? 'Processing...' : 'Upload'}
                            </Button>
                        </div>
                        {uploadStatus.message && (
                            <p className={`mt-2 text-sm font-medium ${uploadStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {uploadStatus.message}
                            </p>
                        )}
                    </div>
                </div>
            </Card>
            <Card
                title="Monthly Attendance Editor"
                actions={
                    hasChanges && (
                        <div className="flex items-center gap-2">
                            <Button onClick={handleCancelChanges} variant="secondary">Cancel</Button>
                            <Button onClick={handleSaveChanges} >Save Changes</Button>
                        </div>
                    )
                }
            >
                <div className="p-4 border rounded-lg bg-slate-50 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <Select id="month" name="month" label="Month" value={filterInputs.month} onChange={handleFilterInputChange}>
                            {monthNames.map((name, index) => <option key={name} value={index+1}>{name}</option>)}
                        </Select>
                        <Select id="year" name="year" label="Year" value={filterInputs.year} onChange={handleFilterInputChange}>
                            {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </Select>
                        <Input id="searchTerm" name="searchTerm" label="Search Employee" value={filterInputs.searchTerm} onChange={handleFilterInputChange} placeholder="By name or ID..." />
                        <Input type="date" id="highlightStartDate" name="highlightStartDate" label="Highlight From" value={filterInputs.highlightStartDate} onChange={handleFilterInputChange} />
                        <Input type="date" id="highlightEndDate" name="highlightEndDate" label="Highlight To" value={filterInputs.highlightEndDate} onChange={handleFilterInputChange} />
                    </div>
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200">
                        <Button variant="secondary" onClick={handleClearFilters}>Clear</Button>
                        <Button onClick={handleApplyFilters} leftIcon={<Search size={16}/>}>Search</Button>
                    </div>
                </div>
                <MonthlyAttendanceSheet 
                    year={sheetYear} 
                    month={sheetMonth} 
                    employees={filteredEmployees}
                    records={monthlyRecords}
                    onRecordsChange={handleRecordsChange}
                    onMarkLeave={handleMarkLeave}
                    highlightStartDate={activeHighlightStart}
                    highlightEndDate={activeHighlightEnd}
                />
            </Card>
            {isGlobalModalOpen && (
                <GlobalAttendanceModal 
                    isOpen={isGlobalModalOpen}
                    onClose={() => setIsGlobalModalOpen(false)}
                    onUpdate={handleGlobalUpdate}
                    date={selectedGlobalDate}
                />
            )}
            {isLeaveDeductionModalOpen && (
                <LeaveDeductionModal 
                    isOpen={isLeaveDeductionModalOpen}
                    onClose={() => {
                        setIsLeaveDeductionModalOpen(false);
                        setLeaveDeductionData(null);
                    }}
                    onConfirm={handleConfirmLeaveDeduction}
                    employee={employeeForModal}
                    date={leaveDeductionData?.date || ''}
                />
            )}
        </div>
    );
};

const PunchLogReportView: React.FC = () => {
    const { employees, punchRecords } = useAuth();
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRecords = useMemo(() => {
        const searchFilteredEmployees = employees.filter(e => 
            e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const employeeIdSet = new Set(searchFilteredEmployees.map(e => e.id));

        return punchRecords
            .filter(r => {
                const recordDate = r.date;
                return recordDate >= startDate && recordDate <= endDate && employeeIdSet.has(r.employeeId);
            })
            .map(r => ({
                ...r,
                employee: employees.find(e => e.id === r.employeeId)
            }))
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.employee!.name.localeCompare(b.employee!.name));
    }, [startDate, endDate, searchTerm, punchRecords, employees]);

    const formatPunchTime = (isoString: string | null) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const calculateDuration = (punchIn: string | null, punchOut: string | null): string => {
        if (!punchIn || !punchOut) return '-';
        const diffMs = new Date(punchOut).getTime() - new Date(punchIn).getTime();
        if (diffMs < 0) return 'Error';
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    const handleDownloadReport = () => {
        const headers = ['Employee ID', 'Employee Name', 'Date', 'Punch In', 'Punch Out', 'Duration (H:M)'];
        const rows = filteredRecords.map(r => [
            r.employeeId,
            `"${r.employee?.name.replace(/"/g, '""')}"`,
            r.date,
            r.punchIn ? new Date(r.punchIn).toLocaleTimeString('en-IN') : 'N/A',
            r.punchOut ? new Date(r.punchOut).toLocaleTimeString('en-IN') : 'N/A',
            calculateDuration(r.punchIn, r.punchOut)
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Punch_Log_Report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input id="start-date" label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <Input id="end-date" label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    <Input id="search-employee" label="Search Employee" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Name or ID..." />
                </div>
            </Card>
            <Card title={`Displaying ${filteredRecords.length} Records`} actions={<Button onClick={handleDownloadReport} leftIcon={<Download size={16}/>}>Download Report</Button>}>
                <div className="overflow-x-auto max-h-[60vh]">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm sticky top-0">
                            <tr>
                                <th className="p-3 font-semibold">Employee</th>
                                <th className="p-3 font-semibold">Date</th>
                                <th className="p-3 font-semibold text-center">Punch In</th>
                                <th className="p-3 font-semibold text-center">Punch Out</th>
                                <th className="p-3 font-semibold text-center">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map(record => (
                                <tr key={record.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={record.employee?.name || ''} size="md" />
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{record.employee?.name}</p>
                                                <p className="text-xs text-slate-500 font-mono">{record.employeeId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 font-medium text-slate-700">{new Date(record.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric'})}</td>
                                    <td className="p-3 text-center text-green-700 font-mono">{formatPunchTime(record.punchIn)}</td>
                                    <td className="p-3 text-center text-red-700 font-mono">{formatPunchTime(record.punchOut)}</td>
                                    <td className="p-3 text-center font-semibold text-slate-700">{calculateDuration(record.punchIn, record.punchOut)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredRecords.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <p>No punch records found for the selected criteria.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};


const AttendanceAdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('report');

    return (
        <PageWrapper title="Attendance Administration">
            <div className="flex border-b border-slate-200 mb-6">
                <button 
                    onClick={() => setActiveTab('report')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'report' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <List size={16}/> Punch Log Report
                </button>
                <button 
                    onClick={() => setActiveTab('bulk')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'bulk' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Grid size={16}/> Bulk Management
                </button>
            </div>
            {activeTab === 'report' && <PunchLogReportView />}
            {activeTab === 'bulk' && <BulkManagementView />}
        </PageWrapper>
    );
};

export default AttendanceAdminPage;
