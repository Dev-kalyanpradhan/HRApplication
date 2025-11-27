import React, { useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { Employee } from '../types';

const HierarchyPage: React.FC = () => {
  const { employees } = useAuth();

  const buildHierarchy = (managerId: string | null): any[] => {
      return employees
        .filter(e => e.reportingManagerId === managerId)
        .map(e => ({
            ...e,
            children: buildHierarchy(e.id)
        }));
  };

  const hierarchy = useMemo(() => buildHierarchy(null), [employees]);

  const TreeNode: React.FC<{ node: any; level?: number }> = ({ node, level = 0 }) => {
      return (
          <div className="ml-6 border-l-2 border-slate-200 pl-6 py-2">
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm hover:shadow-md transition-shadow w-fit">
                  <Avatar name={node.name} size="sm" />
                  <div>
                      <p className="font-semibold text-slate-800 text-sm">{node.name}</p>
                      <p className="text-xs text-slate-500">{node.role}</p>
                  </div>
              </div>
              {node.children && node.children.length > 0 && (
                  <div className="mt-2">
                      {node.children.map((child: any) => (
                          <TreeNode key={child.id} node={child} level={level + 1} />
                      ))}
                  </div>
              )}
          </div>
      );
  };

  return (
    <PageWrapper title="Organizational Hierarchy">
      <Card className="overflow-x-auto min-h-[500px]">
        <div className="p-4">
            {hierarchy.map(rootNode => (
                <div key={rootNode.id} className="mb-4">
                     <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg shadow-sm w-fit mb-2">
                        <Avatar name={rootNode.name} size="md" />
                        <div>
                            <p className="font-bold text-slate-800">{rootNode.name}</p>
                            <p className="text-xs text-slate-600">{rootNode.role}</p>
                        </div>
                    </div>
                    {rootNode.children && rootNode.children.map((child: any) => (
                        <TreeNode key={child.id} node={child} />
                    ))}
                </div>
            ))}
             {hierarchy.length === 0 && (
                <div className="text-center text-slate-500 py-10">
                    No hierarchy data available.
                </div>
            )}
        </div>
      </Card>
    </PageWrapper>
  );
};

export default HierarchyPage;