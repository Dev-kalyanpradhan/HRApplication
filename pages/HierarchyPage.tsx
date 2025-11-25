import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import OrgChart from '../components/hierarchy/OrgChart';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { ZoomIn, ZoomOut } from 'lucide-react';

const HierarchyPage: React.FC = () => {
  const { employees, currentUser, userRole } = useAuth();
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.15, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.15, 0.2));

  return (
    <PageWrapper 
      title="Organizational Hierarchy"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleZoomOut} aria-label="Zoom Out" className="!p-2">
            <ZoomOut size={18} />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleZoomIn} aria-label="Zoom In" className="!p-2">
            <ZoomIn size={18} />
          </Button>
        </div>
      }
    >
      <div className="bg-white rounded-xl shadow-md overflow-hidden h-[calc(100vh_-_12rem)]">
        <OrgChart data={employees} focalEmployeeId={currentUser?.id} userRole={userRole} scale={scale} />
      </div>
    </PageWrapper>
  );
};

export default HierarchyPage;