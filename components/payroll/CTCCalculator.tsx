import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { calculateSalaryBreakdown, SalaryBreakdownResult } from '../../utils/salaryCalculator';
import { pie as d3pie, arc as d3arc } from 'd3-shape';
import { SlidersHorizontal, Activity, Wallet, TrendingDown, Settings2 } from 'lucide-react';

import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ConfigureComponentsModal from './ConfigureComponentsModal';

const BreakdownDonutChart: React.FC<{ net: number; deductions: number }> = ({ net, deductions }) => {
    const data = [{ label: 'Net Pay', value: net }, { label: 'Deductions', value: deductions }];
    const total = net + deductions;
    if (total === 0) return null;

    const pie = d3pie<{ label: string; value: number }>().value(d => d.value).sort(null);
    const arc = d3arc().innerRadius(50).outerRadius(70);
    const colors = ['#22c55e', '#ef4444']; // green-500 for net, red-500 for deductions

    const pieData = pie(data);

    return (
        <svg width="150" height="150" viewBox="-80 -80 160 160">
            {pieData.map((d, i) => (
                <path key={d.data.label} d={arc(d as any) || ''} fill={colors[i]} />
            ))}
        </svg>
    );
};


const CTCCalculator: React.FC = () => {
    const { salaryComponents, updateSalaryComponents } = useAuth();
    const [annualCTC, setAnnualCTC] = useState<number>(1000000);
    const [isComponentsModalOpen, setIsComponentsModalOpen] = useState(false);
    
    const componentsToUse = salaryComponents;

    const breakdown: SalaryBreakdownResult | null = useMemo(() => {
        if (isNaN(annualCTC) || annualCTC < 0) return null;
        const monthlyCTC = annualCTC / 12;
        return calculateSalaryBreakdown(monthlyCTC, componentsToUse);
    }, [annualCTC, componentsToUse]);

    const handleCtcChange = (value: string | number) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        setAnnualCTC(isNaN(numValue) ? 0 : numValue);
    };
    
    const currencyFormat = (value: number, options?: Intl.NumberFormatOptions) => {
        return new Intl.NumberFormat('en-IN', options).format(value);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
             <style>{`
                input[type=range] {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 8px;
                    background: #d1d5db; /* gray-300 */
                    border-radius: 5px;
                    outline: none;
                }
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: #2563eb; /* blue-600 */
                    cursor: pointer;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 0 5px rgba(0,0,0,0.2);
                }
                input[type=range]::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    background: #2563eb;
                    cursor: pointer;
                    border-radius: 50%;
                    border: 2px solid white;
                }
            `}</style>
            
            {/* Left Panel: Controls */}
            <div className="lg:col-span-1 space-y-6">
                <Card title="Calculator Controls" actions={<SlidersHorizontal className="text-slate-400" size={20}/>}>
                    <div className="space-y-6">
                        <div>
                            <Input
                                id="annualCTC"
                                label="Annual CTC (₹)"
                                type="number"
                                value={annualCTC}
                                onChange={(e) => handleCtcChange(e.target.value)}
                                placeholder="e.g., 1000000"
                            />
                             <input 
                                type="range"
                                min="0"
                                max={Math.max(2500000, annualCTC * 1.5)}
                                step="10000"
                                value={annualCTC}
                                onChange={(e) => handleCtcChange(e.target.value)}
                                className="mt-3 w-full"
                            />
                        </div>
                         <div className="pt-6 border-t">
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => setIsComponentsModalOpen(true)}
                                leftIcon={<Settings2 size={16}/>}
                            >
                                Configure Salary Components
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right Panel: Breakdown */}
            <div className="lg:col-span-2">
                <Card title="Salary Breakdown" actions={<Activity className="text-slate-400" size={20}/>}>
                    {breakdown ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm font-medium text-green-700">Monthly In-Hand</p>
                                    <p className="text-3xl font-bold text-green-800 font-mono tracking-tight">₹{currencyFormat(breakdown.net, { maximumFractionDigits: 0 })}</p>
                                </div>
                                 <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-medium text-blue-700">Annual Gross</p>
                                    <p className="text-xl font-semibold text-blue-800 font-mono">₹{currencyFormat(breakdown.gross * 12, { maximumFractionDigits: 0 })}</p>
                                </div>
                                 <div className="p-4 bg-red-50 rounded-lg">
                                    <p className="text-sm font-medium text-red-700">Monthly Deductions</p>
                                    <p className="text-xl font-semibold text-red-800 font-mono">₹{currencyFormat(breakdown.deductions, { maximumFractionDigits: 0 })}</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6 pt-6 border-t">
                                <div className="flex-shrink-0 relative">
                                    <BreakdownDonutChart net={breakdown.net} deductions={breakdown.deductions} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-2xl font-bold font-mono text-slate-800">₹{currencyFormat(breakdown.gross, { maximumFractionDigits: 0 })}</p>
                                        <p className="text-xs text-slate-500">Gross/month</p>
                                    </div>
                                </div>
                                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    <div>
                                        <h4 className="text-md font-semibold text-slate-800 border-b pb-1 mb-2 flex items-center gap-2"><Wallet size={18} className="text-green-600"/> Earnings</h4>
                                        <ul className="space-y-1 text-sm">
                                            {Object.entries(breakdown.components).map(([name, value]) => {
                                                if (componentsToUse.find(c => c.name === name)?.type !== 'earning') return null;
                                                return (<li key={name} className="flex justify-between items-center py-0.5"><span className="text-slate-600">{name}</span><span className="font-mono text-slate-800">₹{currencyFormat(value, { minimumFractionDigits: 2 })}</span></li>);
                                            })}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-md font-semibold text-slate-800 border-b pb-1 mb-2 flex items-center gap-2"><TrendingDown size={18} className="text-red-600"/> Deductions</h4>
                                        <ul className="space-y-1 text-sm">
                                             {Object.entries(breakdown.components).map(([name, value]) => {
                                                if (componentsToUse.find(c => c.name === name)?.type !== 'deduction') return null;
                                                return (<li key={name} className="flex justify-between items-center py-0.5"><span className="text-slate-600">{name}</span><span className="font-mono text-slate-800">₹{currencyFormat(value, { minimumFractionDigits: 2 })}</span></li>);
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-xs text-slate-400 italic text-center pt-4 border-t">
                                All calculations are estimates based on the global salary structure. Final figures may vary based on payroll processing.
                            </div>
                        </div>
                    ) : (
                         <div className="text-center py-20 text-slate-500">
                            <p>Enter a valid CTC to see the breakdown.</p>
                        </div>
                    )}
                </Card>
            </div>
            {isComponentsModalOpen && (
                 <ConfigureComponentsModal
                    isOpen={isComponentsModalOpen}
                    onClose={() => setIsComponentsModalOpen(false)}
                    components={salaryComponents}
                    onSave={(newComponents) => {
                        updateSalaryComponents(newComponents);
                        setIsComponentsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default CTCCalculator;