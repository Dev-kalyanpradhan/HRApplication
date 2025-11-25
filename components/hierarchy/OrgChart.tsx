import React, { useMemo } from 'react';
import { stratify, tree } from 'd3-hierarchy';
import { linkVertical } from 'd3-shape';
import { Employee, UserRole } from '../../types';
import { getSubordinateIds } from '../../utils/hierarchyUtils';
import Avatar from '../ui/Avatar';


interface OrgChartProps {
  data: Employee[];
  focalEmployeeId?: string;
  userRole?: UserRole;
  scale: number;
}

const OrgChart: React.FC<OrgChartProps> = ({ data, focalEmployeeId, userRole, scale }) => {
  const chartData = useMemo(() => {
    if (!focalEmployeeId || userRole === UserRole.ADMIN) {
        return data;
    }
    if (userRole === UserRole.MANAGER) {
        const subordinateIds = getSubordinateIds(focalEmployeeId, data);
        return data.filter(e => e.id === focalEmployeeId || subordinateIds.includes(e.id));
    }
    if (userRole === UserRole.EMPLOYEE) {
        const currentUser = data.find(e => e.id === focalEmployeeId);
        if (!currentUser || !currentUser.reportingManagerId) return [currentUser].filter(Boolean) as Employee[];

        const manager = data.find(e => e.id === currentUser.reportingManagerId);
        const peers = data.filter(e => e.reportingManagerId === currentUser.reportingManagerId);
        
        return [...peers, ...(manager ? [manager] : [])];
    }
    return data;
  }, [data, focalEmployeeId, userRole]);


  const { nodes, links } = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { nodes: [], links: [] };
    }

    // For manager view, we need to nullify the reportingManagerId of the root so d3.stratify works
    const dataForStratify = chartData.map(e => (userRole === UserRole.MANAGER && e.id === focalEmployeeId) ? { ...e, reportingManagerId: null } : e)
     
    const root = stratify<Employee>()
      .id(d => d.id)
      .parentId(d => d.reportingManagerId)(dataForStratify.filter(e => e.id));
    
    if (!root) {
        // Handle cases where data isn't a single tree (e.g. multiple roots)
        // For simplicity, we'll just show nodes without links if stratify fails
        const flatNodes = chartData.map((d,i) => ({ ...d, x: (i % 5) * 250, y: Math.floor(i / 5) * 150, depth: 0, height: 0, parent: null, children: undefined, data: d }));
        // @ts-ignore
        return { nodes: flatNodes, links: [] };
    }

    const nodeWidth = 200;
    const nodeHeight = 80;
    const verticalGap = 60;
    const horizontalGap = 30;

    const treeLayout = tree<Employee>()
      .nodeSize([nodeWidth + horizontalGap, nodeHeight + verticalGap])
      .separation(() => 1);
      
    treeLayout(root);

    const nodes = root.descendants();
    const links = root.links();
    
    return { nodes, links };
  }, [chartData, userRole, focalEmployeeId]);
  
  if (nodes.length === 0) {
    return <div className="text-center py-10 text-slate-500">No organizational data to display.</div>;
  }

  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const viewWidth = maxX - minX + 300;
  const viewHeight = maxY - minY + 200;


  return (
    <div className="w-full h-full overflow-auto bg-slate-50 p-4 flex items-center justify-center">
      <svg 
        width={viewWidth} 
        height={viewHeight} 
        viewBox={`${minX - 150} ${minY-100} ${viewWidth} ${viewHeight}`}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          transition: 'transform 0.2s ease-out',
        }}
      >
        <g>
          {links.map((link, i) => (
            <path
              key={i}
              d={linkVertical()({
                source: [link.source.x, link.source.y],
                target: [link.target.x, link.target.y],
              }) || ''}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
          ))}
          {nodes.map((node, i) => (
            <g key={i} transform={`translate(${node.x}, ${node.y})`}>
              <rect
                x={-100}
                y={-40}
                width={200}
                height={80}
                rx="8"
                ry="8"
                fill={node.data.id === focalEmployeeId ? '#e0f2fe' : 'white'}
                stroke={node.data.id === focalEmployeeId ? '#0284c7' : '#e2e8f0'}
                strokeWidth="1.5"
              />
              <foreignObject x={-90} y={-30} width={40} height={40} className="overflow-visible">
                 <Avatar name={node.data.name} size="md" />
              </foreignObject>
              <text x={-40} y={-15} textAnchor="start" className="text-sm font-bold fill-current text-slate-800">
                {node.data.name}
              </text>
              <text x={-40} y={5} textAnchor="start" className="text-xs fill-current text-blue-600">
                {node.data.role}
              </text>
              <text x={-40} y={25} textAnchor="start" className="text-xs fill-current text-slate-500">
                {node.data.department}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default OrgChart;