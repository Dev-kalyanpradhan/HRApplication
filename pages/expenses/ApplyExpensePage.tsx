
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { ExpenseCategory } from '../../types';
import { UploadCloud } from 'lucide-react';

const ApplyExpensePage: React.FC = () => {
    const { addExpenseRequest } = useAuth();
    const navigate = useNavigate();

    const [expenseDate, setExpenseDate] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.TRAVEL);
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [receiptAttached, setReceiptAttached] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!expenseDate || !category || !amount || !reason) {
            alert("Please fill all fields.");
            return;
        }

        addExpenseRequest({
            expenseDate,
            category,
            amount: Number(amount),
            reason,
            receiptAttached
        });

        navigate('/expenses/my-requests');
    };

    return (
        <PageWrapper title="Apply for Expense Reimbursement">
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                    <p className="text-sm text-slate-600">
                        Fill out the form to submit an expense claim. Your request will be sent to your manager for approval.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input id="expenseDate" label="Date of Expense" type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required />
                        <Input id="amount" label="Amount (INR)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                    </div>
                    <Select id="category" label="Expense Category" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
                        {Object.values(ExpenseCategory).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </Select>
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">
                            Description / Reason
                        </label>
                        <textarea
                            id="reason"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g., Taxi fare for client visit to HSR Layout"
                            required
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Attach Receipt
                        </label>
                        <div 
                            onClick={() => setReceiptAttached(!receiptAttached)}
                            className={`p-6 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                receiptAttached 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                            }`}
                        >
                            <UploadCloud className={`mx-auto h-10 w-10 ${receiptAttached ? 'text-green-600' : 'text-slate-400'}`} />
                            <p className={`mt-2 text-sm font-semibold ${receiptAttached ? 'text-green-800' : 'text-slate-600'}`}>
                                {receiptAttached ? 'Receipt Attached (Simulation)' : 'Click to attach receipt (Simulation)'}
                            </p>
                            <p className="text-xs text-slate-500">In a real app, this would open a file dialog.</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="submit">Submit Claim</Button>
                    </div>
                </form>
            </Card>
        </PageWrapper>
    );
};

export default ApplyExpensePage;
