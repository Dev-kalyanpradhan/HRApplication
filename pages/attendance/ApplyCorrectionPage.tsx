

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import TimePicker from '../../components/ui/TimePicker';
import { AlertTriangle } from 'lucide-react';

const ApplyCorrectionPage: React.FC = () => {
    const { currentUser, punchRecords, addAttendanceCorrectionRequest } = useAuth();
    const navigate = useNavigate();

    const [date, setDate] = useState('');
    const [punchIn, setPunchIn] = useState('');
    const [punchOut, setPunchOut] = useState('');
    const [reason, setReason] = useState('');
    const [correctionType, setCorrectionType] = useState<'in' | 'out' | 'both' | null>(null);
    const [existingPunch, setExistingPunch] = useState<{ in: string | null, out: string | null }>({ in: null, out: null });
    const [error, setError] = useState('');

    const formatTime = (isoString: string | null) => {
        if (!isoString) return null;
        return new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        setCorrectionType(null);
        setPunchIn('');
        setPunchOut('');
        setError('');
        if (date && currentUser) {
            const record = punchRecords.find(r => r.employeeId === currentUser.id && r.date === date);
            const punches = {
                in: formatTime(record?.punchIn || null),
                out: formatTime(record?.punchOut || null),
            };
            setExistingPunch(punches);
        } else {
            setExistingPunch({ in: null, out: null });
        }
    }, [date, currentUser, punchRecords]);
    
    const handleCorrectionTypeChange = (type: 'in' | 'out' | 'both') => {
        setCorrectionType(type);
        setError('');
        if (type === 'out') {
            setPunchIn(existingPunch.in || ''); // Pre-fill existing, but it will be disabled
            setPunchOut(''); // Clear for user input
        } else if (type === 'in') {
            setPunchIn(''); // Clear for user input
            setPunchOut(existingPunch.out || ''); // Pre-fill existing, but it will be disabled
        } else { // 'both'
            setPunchIn('');
            setPunchOut('');
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!date || !correctionType || !reason) {
            setError("Please select a date, correction type, and provide a reason.");
            return;
        }
        if ((correctionType === 'in' || correctionType === 'both') && !punchIn) {
            setError("Please provide the punch-in time.");
            return;
        }
        if ((correctionType === 'out' || correctionType === 'both') && !punchOut) {
            setError("Please provide the punch-out time.");
            return;
        }

        // Time validation logic
        let finalPunchIn: string | null = null;
        let finalPunchOut: string | null = null;

        if (correctionType === 'in') {
            finalPunchIn = punchIn;
            finalPunchOut = existingPunch.out;
        } else if (correctionType === 'out') {
            finalPunchIn = existingPunch.in;
            finalPunchOut = punchOut;
        } else if (correctionType === 'both') {
            finalPunchIn = punchIn;
            finalPunchOut = punchOut;
        }

        const timeToMinutes = (timeStr: string | null): number | null => {
            if (!timeStr) return null;
            const parts = timeStr.split(':');
            if (parts.length !== 2) return null;
            const [hours, minutes] = parts.map(Number);
            if (isNaN(hours) || isNaN(minutes)) return null;
            return hours * 60 + minutes;
        };
        
        if (finalPunchIn && finalPunchOut) {
            const inMinutes = timeToMinutes(finalPunchIn);
            const outMinutes = timeToMinutes(finalPunchOut);

            if (inMinutes !== null && outMinutes !== null && outMinutes < inMinutes) {
                setError("Error: Punch Out time cannot be earlier than Punch In time.");
                return;
            }
        }


        addAttendanceCorrectionRequest({
            date,
            requestedPunchIn: (correctionType === 'in' || correctionType === 'both') ? punchIn : null,
            requestedPunchOut: (correctionType === 'out' || correctionType === 'both') ? punchOut : null,
            reason,
        });
        navigate('/requests/attendance');
    };

    const correctionOptions = [
        { id: 'in', label: 'Forgot Punch In' },
        { id: 'out', label: 'Forgot Punch Out' },
        { id: 'both', label: 'Forgot Both Punches' },
    ];

    return (
        <PageWrapper title="Apply for Attendance Correction">
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                    <p className="text-sm text-slate-600">
                        Forgot to punch in or out? Use this form to submit a correction request. Please provide the accurate time and a reason for the missed punch.
                    </p>
                    <Input id="date" label="Date of Correction" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    
                    {date && (
                        <Card className="!p-4 bg-slate-50 border">
                            <h4 className="font-semibold text-sm text-slate-600 mb-2">System Recorded Punches for {new Date(date + 'T00:00:00Z').toLocaleDateString('en-IN')}</h4>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-slate-500">Punch In</p>
                                    <p className="font-mono font-semibold text-lg">{existingPunch.in || '--:--'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Punch Out</p>
                                    <p className="font-mono font-semibold text-lg">{existingPunch.out || '--:--'}</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">What do you need to correct?</label>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {correctionOptions.map(opt => (
                                <label key={opt.id} className={`p-3 rounded-md border text-center text-sm font-medium cursor-pointer transition-colors ${correctionType === opt.id ? 'bg-blue-50 border-blue-400 text-blue-800' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
                                    <input
                                        type="radio"
                                        name="correctionType"
                                        value={opt.id}
                                        checked={correctionType === opt.id}
                                        onChange={() => handleCorrectionTypeChange(opt.id as 'in'|'out'|'both')}
                                        className="sr-only"
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TimePicker id="punchIn" label="Punch In Time" value={punchIn} onChange={setPunchIn} disabled={!correctionType || correctionType === 'out'}/>
                        <TimePicker id="punchOut" label="Punch Out Time" value={punchOut} onChange={setPunchOut} disabled={!correctionType || correctionType === 'in'}/>
                    </div>
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">
                            Reason for Correction
                        </label>
                        <textarea
                            id="reason"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g., Forgot to punch in upon arrival."
                            required
                        />
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                            <AlertTriangle size={20} />
                            <span>{error}</span>
                        </div>
                    )}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="submit">Submit Request</Button>
                    </div>
                </form>
            </Card>
        </PageWrapper>
    );
};

export default ApplyCorrectionPage;
