
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const AddCandidatePage: React.FC = () => {
    const { employees, roles, addCandidateAndScheduleInterview } = useAuth();
    const navigate = useNavigate();

    const [candidateData, setCandidateData] = useState({
        name: '',
        email: '',
        phone: '',
        applyingForRole: '',
    });

    const [interviewData, setInterviewData] = useState({
        interviewerId: '',
        date: '',
        time: '',
        meetingLink: '',
    });

    const handleCandidateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCandidateData({ ...candidateData, [e.target.name]: e.target.value });
    };

    const handleInterviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setInterviewData({ ...interviewData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const scheduledAt = new Date(`${interviewData.date}T${interviewData.time}`).toISOString();

        addCandidateAndScheduleInterview(
            { ...candidateData },
            { 
                interviewerId: interviewData.interviewerId,
                scheduledAt,
                meetingLink: interviewData.meetingLink
            }
        );
        
        navigate('/recruitment/pipeline');
    };

    return (
        <PageWrapper title="Add New Candidate">
            <form onSubmit={handleSubmit}>
                <Card title="Candidate Details" className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input id="name" name="name" label="Full Name" value={candidateData.name} onChange={handleCandidateChange} required />
                        <Select id="applyingForRole" name="applyingForRole" label="Applying for Role" value={candidateData.applyingForRole} onChange={handleCandidateChange} required>
                            <option value="">Select a role</option>
                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                        </Select>
                        <Input id="email" name="email" label="Email Address" type="email" value={candidateData.email} onChange={handleCandidateChange} required />
                        <Input id="phone" name="phone" label="Phone Number" type="tel" value={candidateData.phone} onChange={handleCandidateChange} required />
                    </div>
                </Card>

                <Card title="Schedule First Interview">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select id="interviewerId" name="interviewerId" label="Assign Interviewer" value={interviewData.interviewerId} onChange={handleInterviewChange} required>
                            <option value="">Select an interviewer</option>
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                        </Select>
                        <Input id="meetingLink" name="meetingLink" label="Meeting Link (e.g., Google Meet, Zoom)" value={interviewData.meetingLink} onChange={handleInterviewChange} required />
                        <Input id="date" name="date" label="Interview Date" type="date" value={interviewData.date} onChange={handleInterviewChange} required />
                        <Input id="time" name="time" label="Interview Time" type="time" value={interviewData.time} onChange={handleInterviewChange} required />
                    </div>
                </Card>
                
                <div className="mt-6 flex justify-end gap-4">
                    <Button type="button" variant="secondary" onClick={() => navigate('/recruitment/pipeline')}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        Save Candidate & Schedule
                    </Button>
                </div>
            </form>
        </PageWrapper>
    );
};

export default AddCandidatePage;
