import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Calendar, Briefcase, Coffee } from 'lucide-react';

interface GlobalAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (action: 'holiday' | 'week_off' | 'working') => void;
    date: string;
}

const GlobalAttendanceModal: React.FC<GlobalAttendanceModalProps> = ({ isOpen, onClose, onUpdate, date }) => {

    const handleHolidayClick = () => {
        onUpdate('holiday');
    };
    
    const handleWeekOffClick = () => {
        onUpdate('week_off');
    };

    const handleWorkingClick = () => {
        onUpdate('working');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Update status for ${new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric'})}`}>
            <div className="space-y-4">
                <p className="text-sm text-slate-600">Choose an action for this date. This will apply to all employees who are not on approved leave.</p>
                
                <button 
                    onClick={handleHolidayClick}
                    className="w-full flex items-start text-left p-4 rounded-lg border border-slate-200 hover:bg-yellow-50 hover:border-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                    <div className="p-2 bg-yellow-100 rounded-full mr-4">
                        <Calendar size={20} className="text-yellow-700"/>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">Mark as Holiday</h4>
                        <p className="text-xs text-slate-500 mt-1">Declare a public or company-specific holiday.</p>
                    </div>
                </button>

                <button 
                    onClick={handleWeekOffClick}
                    className="w-full flex items-start text-left p-4 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                    <div className="p-2 bg-red-100 rounded-full mr-4">
                        <Coffee size={20} className="text-red-700"/>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">Mark as Week Off</h4>
                        <p className="text-xs text-slate-500 mt-1">Set a day as a non-working weekly off day (e.g., Sunday).</p>
                    </div>
                </button>
                
                <button 
                    onClick={handleWorkingClick}
                    className="w-full flex items-start text-left p-4 rounded-lg border border-slate-200 hover:bg-green-50 hover:border-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                    <div className="p-2 bg-green-100 rounded-full mr-4">
                        <Briefcase size={20} className="text-green-700"/>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">Mark as Working Day</h4>
                        <p className="text-xs text-slate-500 mt-1">Revert any 'Holiday' or 'Week Off' status to 'Absent' (default). It will not affect employees already marked as 'Present' or 'On Leave'.</p>
                    </div>
                </button>

                <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </Modal>
    );
};

export default GlobalAttendanceModal;