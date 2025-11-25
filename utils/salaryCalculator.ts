
import { SalaryComponent } from '../types';

export interface SalaryBreakdownResult {
  components: Record<string, number>;
  gross: number;
  deductions: number;
  net: number;
}

/**
 * Calculates a full salary breakdown from a monthly CTC amount and a set of component rules.
 * @param monthlyCTC The gross monthly salary to break down.
 * @param components The array of SalaryComponent rules.
 * @returns An object containing the component breakdown, gross, deductions, and net salary.
 */
export function calculateSalaryBreakdown(monthlyCTC: number, components: SalaryComponent[]): SalaryBreakdownResult {
    const breakdown: Record<string, number> = {};
    let calculatedBasic = 0;
    
    const sortedComponents = [...components].sort((a, b) => a.order - b.order);

    // First pass for Basic component, as others may depend on it.
    const basicComponent = sortedComponents.find(c => c.name.toLowerCase() === 'basic' && c.type === 'earning');
    if (basicComponent) {
        if (basicComponent.calculationType === 'percentage_ctc') {
            calculatedBasic = monthlyCTC * (basicComponent.value / 100);
        } else if (basicComponent.calculationType === 'fixed_amount') {
            calculatedBasic = basicComponent.value;
        }
        breakdown[basicComponent.name] = calculatedBasic;
    }

    // Second pass for all other non-balancing components
    for (const comp of sortedComponents) {
        if (comp.name.toLowerCase() === 'basic' || comp.calculationType === 'balance_component') {
            continue;
        }

        let value = 0;
        switch (comp.calculationType) {
            case 'percentage_ctc':
                value = monthlyCTC * (comp.value / 100);
                break;
            case 'percentage_basic':
                value = calculatedBasic * (comp.value / 100);
                break;
            case 'fixed_amount':
                value = comp.value;
                break;
        }
        breakdown[comp.name] = value;
    }

    // Third pass for the balancing component
    const balancingComponent = sortedComponents.find(c => c.calculationType === 'balance_component');
    if (balancingComponent) {
        const currentEarnings = Object.entries(breakdown)
            .reduce((total, [name, value]) => {
                const comp = sortedComponents.find(c => c.name === name);
                if (comp?.type === 'earning') {
                    return total + value;
                }
                return total;
            }, 0);
        
        const balanceValue = monthlyCTC - currentEarnings;
        breakdown[balancingComponent.name] = balanceValue > 0 ? balanceValue : 0;
    }
    
    const gross = Object.entries(breakdown)
        .reduce((total, [name, value]) => {
            const comp = sortedComponents.find(c => c.name === name);
            return comp?.type === 'earning' ? total + value : total;
        }, 0);
        
    const deductions = Object.entries(breakdown)
        .reduce((total, [name, value]) => {
            const comp = sortedComponents.find(c => c.name === name);
            return comp?.type === 'deduction' ? total + value : total;
        }, 0);

    const net = gross - deductions;

    return {
        components: breakdown,
        gross,
        deductions,
        net,
    };
}
