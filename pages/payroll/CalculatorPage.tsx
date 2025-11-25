import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import CTCCalculator from '../../components/payroll/CTCCalculator';

const CalculatorPage: React.FC = () => {
    return (
        <PageWrapper title="CTC Calculator">
            <CTCCalculator />
        </PageWrapper>
    );
};

export default CalculatorPage;