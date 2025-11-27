import React from 'react';
import PageWrapper from './layout/PageWrapper';
import Card from './ui/Card';

interface Props { title: string; }

const PlaceholderPage: React.FC<Props> = ({ title }) => {
  return (
    <PageWrapper title={title}>
      <Card>
        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p>This page ({title}) is currently under construction.</p>
        </div>
      </Card>
    </PageWrapper>
  );
};

export default PlaceholderPage;
