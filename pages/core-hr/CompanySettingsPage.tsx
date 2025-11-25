

import React, { useState, useRef } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Upload, Trash2 } from 'lucide-react';

const CompanySettingsPage: React.FC = () => {
    const { departments, roles, addDepartment, addRole, companyLogo, updateCompanyLogo } = useAuth();
    const [newDepartment, setNewDepartment] = useState('');
    const [newRole, setNewRole] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoError, setLogoError] = useState('');

    const handleAddDepartment = () => {
        if(newDepartment.trim()) {
            addDepartment(newDepartment.trim());
            setNewDepartment('');
        }
    };

    const handleAddRole = () => {
        if(newRole.trim()) {
            addRole(newRole.trim());
            setNewRole('');
        }
    };
    
    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'image/png') {
            setLogoError('Please upload a PNG file.');
            return;
        }
        if (file.size > 1 * 1024 * 1024) { // 1MB limit
            setLogoError('File size must be less than 1MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            updateCompanyLogo(reader.result as string);
            setLogoError('');
        };
        reader.onerror = () => {
            setLogoError('Failed to read the file.');
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        updateCompanyLogo(null);
    };

    return (
        <PageWrapper title="Company Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card title="Company Logo" className="md:col-span-2">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-slate-100 rounded-md flex items-center justify-center border-2 border-dashed">
                            {companyLogo ? (
                                <img src={companyLogo} alt="Company Logo" className="object-contain h-full w-full p-2" />
                            ) : (
                                <span className="text-xs text-slate-500 text-center">No Logo</span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <input type="file" accept="image/png" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
                            <Button onClick={() => fileInputRef.current?.click()} leftIcon={<Upload size={16}/>}>Upload PNG</Button>
                            {companyLogo && <Button variant="secondary" onClick={handleRemoveLogo} leftIcon={<Trash2 size={16}/>}>Remove Logo</Button>}
                            {logoError && <p className="text-xs text-red-500">{logoError}</p>}
                        </div>
                    </div>
                </Card>
                <Card title="Manage Departments">
                    <div className="space-y-3">
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                            {departments.sort().map(dept => (
                                <div key={dept} className="bg-slate-100 p-2 rounded-md text-sm text-slate-700">{dept}</div>
                            ))}
                        </div>
                        <div className="flex gap-2 pt-3 border-t">
                            <Input id="newDepartment" label="" value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} placeholder="New department name..." />
                            <Button onClick={handleAddDepartment} className="self-end" leftIcon={<Plus size={18} />}>Add</Button>
                        </div>
                    </div>
                </Card>
                <Card title="Manage Roles">
                    <div className="space-y-3">
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                            {roles.sort().map(role => (
                                <div key={role} className="bg-slate-100 p-2 rounded-md text-sm text-slate-700">{role}</div>
                            ))}
                        </div>
                        <div className="flex gap-2 pt-3 border-t">
                            <Input id="newRole" label="" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="New role name..." />
                            <Button onClick={handleAddRole} className="self-end" leftIcon={<Plus size={18} />}>Add</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </PageWrapper>
    );
}

export default CompanySettingsPage;
