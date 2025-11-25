import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';

const SurveysPage: React.FC = () => {
    return (
        <PageWrapper title="Survey Analysis">
            <Card>
                <div className="text-center py-20 text-slate-500">
                    <p>The AI Survey Analysis feature has been disabled.</p>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default SurveysPage;