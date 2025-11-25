import { Employee } from '../types';

/**
 * Recursively finds all subordinate IDs (direct and indirect) for a given manager.
 * @param managerId The ID of the manager.
 * @param employees The flat list of all employees.
 * @returns An array of subordinate employee IDs.
 */
export const getSubordinateIds = (managerId: string, employees: Employee[]): string[] => {
  const directReports = employees.filter(e => e.reportingManagerId === managerId);
  if (directReports.length === 0) {
    return [];
  }

  const subordinateIds: string[] = directReports.map(r => r.id);

  directReports.forEach(report => {
    subordinateIds.push(...getSubordinateIds(report.id, employees));
  });

  return subordinateIds;
};