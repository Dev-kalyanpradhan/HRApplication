
import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const StatutoryReportsPage: React.FC = () => {
    const { employees } = useAuth();

    const handleDownload = (type: 'pf' | 'esi' | 'pt' | 'bank') => {
        let headers: string[] = [];
        let data: string[][] = [];
        let filename = '';
        const monthYear = new Date().toLocaleString('default', {month: 'short', year: 'numeric'});

        switch(type) {
            case 'pf':
                filename = `PF_ECR_${monthYear}.csv`;
                headers = ['UAN', 'Member Name', 'Gross Wages', 'EPF Wages', 'EPS Wages', 'EDLI Wages', 'EPF Contribution', 'EPS Contribution', 'EPF EPS Diff'];
                data = employees.slice(0, 5).map(emp => [
                    (Math.random() * 10**12).toFixed(0).padStart(12, '0'),
                    emp.name,
                    (emp.ctc || 0 / 12).toFixed(2),
                    '15000', '15000', '15000', '1800', '1250', '550'
                ]);
                break;
            case 'esi':
                filename = `ESI_Statement_${monthYear}.csv`;
                headers = ['IP Number', 'IP Name', 'No of Days', 'Total Wages', 'IP Contribution'];
                 data = employees.slice(0, 5).map(emp => [
                    (Math.random() * 10**10).toFixed(0).padStart(10, '0'),
                    emp.name,
                    '30',
                    (emp.ctc || 0 / 12).toFixed(2),
                    ((emp.ctc || 0 / 12) * 0.0075).toFixed(2) // 0.75%
                ]);
                break;
            case 'pt':
                filename = `PT_Report_${monthYear}.csv`;
                headers = ['Sr No', 'Employee Name', 'Gross Salary', 'PT Amount'];
                 data = employees.slice(0, 5).map((emp, i) => [
                    String(i+1),
                    emp.name,
                    (emp.ctc || 0 / 12).toFixed(2),
                    '200'
                ]);
                break;
            case 'bank':
                filename = `Bank_Transfer_${monthYear}.txt`;
                headers = ['Account Number', 'Amount', 'Beneficiary Name']; // For TXT, headers might just be for show
                const txtData = employees.slice(0, 5).map(emp => 
                    `${(Math.random() * 10**14).toFixed(0).padStart(14, '0')},${(emp.ctc || 0 / 12 * 0.7).toFixed(2)},${emp.name}`
                ).join('\n');
                
                downloadFile(filename, txtData, 'text/plain');
                return;
        }

        const csvContent = [headers.join(','), ...data.map(row => row.join(','))].join('\n');
        downloadFile(filename, csvContent, 'text/csv');
    };

    const downloadFile = (filename: string, content: string, mimeType: string) => {
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <PageWrapper title="Statutory & Bank Reports">
            <Card>
                <p className="text-sm text-slate-600 mb-6">
                    Generate and download mock statutory compliance reports and bank transfer statements.
                    The data generated is for demonstration purposes only.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg bg-slate-50 flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-slate-800">Provident Fund (PF) ECR</h4>
                            <p className="text-xs text-slate-500 mt-1">Generates Electronic Challan cum Return file.</p>
                        </div>
                        <Button onClick={() => handleDownload('pf')} leftIcon={<Download size={16}/>}>Download</Button>
                    </div>
                     <div className="p-4 border rounded-lg bg-slate-50 flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-slate-800">Employee State Insurance (ESI)</h4>
                            <p className="text-xs text-slate-500 mt-1">Generates monthly contribution statement.</p>
                        </div>
                        <Button onClick={() => handleDownload('esi')} leftIcon={<Download size={16}/>}>Download</Button>
                    </div>
                     <div className="p-4 border rounded-lg bg-slate-50 flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-slate-800">Professional Tax (PT)</h4>
                            <p className="text-xs text-slate-500 mt-1">Generates monthly PT report for filing.</p>
                        </div>
                        <Button onClick={() => handleDownload('pt')} leftIcon={<Download size={16}/>}>Download</Button>
                    </div>
                     <div className="p-4 border rounded-lg bg-slate-50 flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-slate-800">Bank Transfer Statement</h4>
                            <p className="text-xs text-slate-500 mt-1">Generates a salary list for bank processing.</p>
                        </div>
                        <Button onClick={() => handleDownload('bank')} leftIcon={<Download size={16}/>}>Download</Button>
                    </div>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default StatutoryReportsPage;
