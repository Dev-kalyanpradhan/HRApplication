import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { SalaryComponent } from '../../types';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface ConfigureComponentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    components: SalaryComponent[];
    onSave: (newComponents: SalaryComponent[]) => void;
}

const ConfigureComponentsModal: React.FC<ConfigureComponentsModalProps> = ({ isOpen, onClose, components, onSave }) => {
    const [localComponents, setLocalComponents] = useState<SalaryComponent[]>(
        [...components].sort((a, b) => a.order - b.order)
    );

    const handleAddComponent = () => {
        const newOrder = localComponents.length > 0 ? Math.max(...localComponents.map(c => c.order)) + 1 : 1;
        const newComponent: SalaryComponent = {
            id: `new_${Date.now()}`,
            name: 'New Component',
            type: 'earning',
            calculationType: 'fixed_amount',
            value: 0,
            isEditable: true,
            order: newOrder,
        };
        setLocalComponents([...localComponents, newComponent]);
    };

    const handleRemoveComponent = (id: string) => {
        setLocalComponents(localComponents.filter(c => c.id !== id));
    };

    const handleComponentChange = (id: string, field: keyof SalaryComponent, value: any) => {
        setLocalComponents(prev =>
            prev.map(c => {
                if (c.id === id) {
                    let finalValue = value;
                    if (field === 'calculationType' && value === 'balance_component') {
                         return { ...c, [field]: finalValue, type: 'earning', value: 0 };
                    }
                     if (field === 'type' && c.calculationType === 'balance_component') {
                         finalValue = 'earning';
                    }
                    return { ...c, [field]: finalValue };
                }
                return c;
            })
        );
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newComponents = [...localComponents];
        if (direction === 'up' && index > 0) {
            [newComponents[index - 1], newComponents[index]] = [newComponents[index], newComponents[index - 1]];
            setLocalComponents(newComponents);
        } else if (direction === 'down' && index < newComponents.length - 1) {
            [newComponents[index + 1], newComponents[index]] = [newComponents[index], newComponents[index + 1]];
            setLocalComponents(newComponents);
        }
    };

    const handleSave = () => {
        // Basic validation
        if (localComponents.filter(c => c.calculationType === 'balance_component').length !== 1) {
            alert("Exactly one 'earning' component must be set to 'Balance Component' type.");
            return;
        }
        for (const comp of localComponents) {
            if (!comp.name.trim()) {
                alert('All components must have a name.');
                return;
            }
        }
        const finalComponents = localComponents.map((c, index) => ({
            ...c,
            order: c.type === 'earning' ? index + 1 : 200 + index + 1, // Simple ordering, earnings first
        }));
        onSave(finalComponents);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configure Salary Components" size="xl">
            <div className="space-y-4">
                <p className="text-sm text-slate-600">
                    Define the earnings and deductions that make up the salary structure. Reorder components using the arrows.
                    Exactly one 'earning' component must be set to 'Balance Component' to ensure the final CTC matches.
                </p>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-12 gap-x-3 items-center px-3 py-1 text-xs font-medium text-slate-500">
                        <div className="col-span-1">Order</div>
                        <div className="col-span-3">Component Name</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-3">Calculation</div>
                        <div className="col-span-2">Value/Percent</div>
                        <div className="col-span-1 text-center">Action</div>
                    </div>

                    {localComponents.map((component, index) => (
                         <div key={component.id} className="grid grid-cols-12 gap-x-3 items-end p-2 border rounded-lg bg-slate-50">
                            <div className="col-span-1 flex flex-col justify-center">
                                <Button variant="ghost" size="sm" className="!p-1 h-6 w-6 text-slate-500 hover:bg-slate-200" onClick={() => handleMove(index, 'up')} disabled={index === 0}>
                                    <ChevronUp size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" className="!p-1 h-6 w-6 text-slate-500 hover:bg-slate-200" onClick={() => handleMove(index, 'down')} disabled={index === localComponents.length - 1}>
                                    <ChevronDown size={16} />
                                </Button>
                            </div>
                            <div className="col-span-3">
                               <Input label="" id={`name-${component.id}`} value={component.name} onChange={e => handleComponentChange(component.id, 'name', e.target.value)} disabled={!component.isEditable} />
                            </div>
                             <div className="col-span-2">
                                <Select label="" id={`type-${component.id}`} value={component.type} onChange={e => handleComponentChange(component.id, 'type', e.target.value)} disabled={!component.isEditable || component.calculationType === 'balance_component'}>
                                    <option value="earning">Earning</option>
                                    <option value="deduction">Deduction</option>
                                </Select>
                             </div>
                             <div className="col-span-3">
                                 <Select label="" id={`calc-${component.id}`} value={component.calculationType} onChange={e => handleComponentChange(component.id, 'calculationType', e.target.value)} disabled={!component.isEditable}>
                                    <option value="percentage_ctc">% of Monthly CTC</option>
                                    <option value="percentage_basic">% of Basic</option>
                                    <option value="fixed_amount">Fixed Amount</option>
                                    <option value="balance_component">Balance Component</option>
                                 </Select>
                             </div>
                             <div className="col-span-2">
                                 <Input label="" id={`value-${component.id}`} type="number" value={component.value} onChange={e => handleComponentChange(component.id, 'value', parseFloat(e.target.value))} disabled={!component.isEditable || component.calculationType === 'balance_component'} />
                             </div>
                            <div className="col-span-1 flex justify-center">
                                {component.isEditable && (
                                     <Button variant="ghost" size="sm" className="!p-2 text-red-500 hover:bg-red-100" onClick={() => handleRemoveComponent(component.id)}>
                                        <Trash2 size={16} />
                                     </Button>
                                )}
                            </div>
                         </div>
                    ))}
                </div>

                <Button variant="secondary" onClick={handleAddComponent} leftIcon={<Plus size={16} />}>
                    Add New Component
                </Button>

                <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={handleSave}>Save Configuration</Button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfigureComponentsModal;
