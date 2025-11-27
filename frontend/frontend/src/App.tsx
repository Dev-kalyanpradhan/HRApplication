import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import LeavePage from './pages/LeavePage';
import HierarchyPage from './pages/HierarchyPage';
import TravelPage from './pages/TravelPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AddCandidatePage from './pages/AddCandidatePage';
import NetworkGuard from './components/auth/NetworkGuard';

// New Notice Board page
import NoticeBoardPage from './pages/notice-board/NoticeBoardPage';

// New Attendance pages
import AttendanceAdminPage from './pages/attendance/AttendanceAdminPage';
import ApplyODPage from './pages/attendance/ApplyODPage';
import MyAttendancePage from './pages/attendance/MyAttendancePage';
import ApplyCorrectionPage from './pages/attendance/ApplyCorrectionPage';
import AttendanceDashboardPage from './pages/attendance/AttendanceDashboardPage';

// New Modular pages
import ApplyLeavePage from './pages/leave/ApplyLeavePage';
import ApplyTravelPage from './pages/travel/ApplyTravelPage';
import HistoryPage from './pages/payroll/HistoryPage';
import RunPayrollPage from './pages/payroll/RunPayrollPage';
import CalculatorPage from './pages/payroll/CalculatorPage';
import PipelinePage from './pages/recruitment/PipelinePage';
import MyInterviewsPage from './pages/recruitment/MyInterviewsPage';
import AccessControlPage from './pages/core-hr/AccessControlPage';
import CompanySettingsPage from './pages/core-hr/CompanySettingsPage';
import SalaryAssignmentPage from './pages/payroll/SalaryAssignmentPage';
import SqlEditorPage from './pages/core-hr/SqlEditorPage';

// New Finance and Payroll pages
import MyPayslipsPage from './pages/finance/MyPayslipsPage';
import TaxPlanningPage from './pages/finance/TaxPlanningPage';
import LoanManagementPage from './pages/payroll/LoanManagementPage';
import VariablePayPage from './pages/payroll/VariablePayPage';
import StatutoryReportsPage from './pages/payroll/StatutoryReportsPage';

// New Employee Request pages
import SalaryApprovalsPage from './pages/requests/SalaryApprovalsPage';
import DeclarationApprovalsPage from './pages/requests/DeclarationApprovalsPage';
import LeaveBalancesPage from './pages/leave/LeaveBalancesPage';
import ConfirmationApprovalsPage from './pages/requests/ConfirmationApprovalsPage';
import AttendanceCorrectionsPage from './pages/requests/AttendanceCorrectionsPage';
import ExpenseApprovalsPage from './pages/requests/ExpenseApprovalsPage';


// New Performance Management pages
import MyGoalsPage from './pages/performance/MyGoalsPage';
import TeamReviewsPage from './pages/performance/TeamReviewsPage';
import GiveKudosPage from './pages/performance/GiveKudosPage';
import CompanyFeedPage from './pages/performance/CompanyFeedPage';
import ManageCyclesPage from './pages/performance/ManageCyclesPage';

// New Lifecycle Management pages
import MyTasksPage from './pages/lifecycle/MyTasksPage';
import OnboardingPage from './pages/lifecycle/OnboardingPage';
import OffboardingPage from './pages/lifecycle/OffboardingPage';
import DocumentHubPage from './pages/lifecycle/DocumentHubPage';

// New Learning pages
import MyLearningPage from './pages/learning/MyLearningPage';
import TeamLearningPage from './pages/learning/TeamLearningPage';

// New Engagement page
import SurveysPage from './pages/engagement/SurveysPage';

// New Expense Management pages
import MyExpensesPage from './pages/expenses/MyExpensesPage';
import ApplyExpensePage from './pages/expenses/ApplyExpensePage';


const MainApp: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
      <div className="flex h-screen bg-slate-100 text-slate-800">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
            <Routes>
              {/* Core Routes */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/notice-board" element={<NoticeBoardPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/hierarchy" element={<HierarchyPage />} />
              
              {/* My Finance */}
              <Route path="/finance/my-payslips" element={<MyPayslipsPage />} />
              <Route path="/finance/tax-planning" element={<TaxPlanningPage />} />

              {/* Lifecycle Management */}
              <Route path="/lifecycle/my-tasks" element={<MyTasksPage />} />
              <Route path="/lifecycle/onboarding" element={<OnboardingPage />} />
              <Route path="/lifecycle/offboarding" element={<OffboardingPage />} />
              <Route path="/lifecycle/document-hub" element={<DocumentHubPage />} />

              {/* Leave Management */}
              <Route path="/leave/requests" element={<LeavePage />} />
              <Route path="/leave/apply" element={<ApplyLeavePage />} />
              <Route path="/leave/balances" element={<LeaveBalancesPage />} />

              {/* Attendance */}
              <Route path="/attendance/dashboard" element={<AttendanceDashboardPage />} />
              <Route path="/attendance/my-attendance" element={<MyAttendancePage />} />
              <Route path="/attendance/admin" element={<AttendanceAdminPage />} />
              <Route path="/attendance/apply-od" element={<ApplyODPage />} />
              <Route path="/attendance/apply-correction" element={<ApplyCorrectionPage />} />

              {/* Travel */}
              <Route path="/travel/requests" element={<TravelPage />} />
              <Route path="/travel/apply" element={<ApplyTravelPage />} />

              {/* Expense Management */}
              <Route path="/expenses/my-requests" element={<MyExpensesPage />} />
              <Route path="/expenses/apply" element={<ApplyExpensePage />} />
              
              {/* Recruitment */}
              <Route path="/recruitment/pipeline" element={<PipelinePage />} />
              <Route path="/recruitment/my-interviews" element={<MyInterviewsPage />} />
              <Route path="/recruitment/add" element={<AddCandidatePage />} />

              {/* Performance Management */}
              <Route path="/performance/my-goals" element={<MyGoalsPage />} />
              <Route path="/performance/team-reviews" element={<TeamReviewsPage />} />
              <Route path="/performance/kudos" element={<GiveKudosPage />} />
              <Route path="/performance/feed" element={<CompanyFeedPage />} />
              <Route path="/performance/cycles" element={<ManageCyclesPage />} />
              
              {/* Learning & Development */}
              <Route path="/learning/my-courses" element={<MyLearningPage />} />
              <Route path="/learning/team-progress" element={<TeamLearningPage />} />

              {/* Payroll */}
              <Route path="/payroll/run" element={<RunPayrollPage />} />
              <Route path="/payroll/calculator" element={<CalculatorPage />} />
              <Route path="/payroll/assignment" element={<SalaryAssignmentPage />} />
              <Route path="/payroll/history" element={<HistoryPage />} />
              <Route path="/payroll/loans" element={<LoanManagementPage />} />
              <Route path="/payroll/variable-pay" element={<VariablePayPage />} />
              <Route path="/payroll/reports" element={<StatutoryReportsPage />} />

              {/* Core HR */}
              <Route path="/core-hr/access" element={<AccessControlPage />} />
              <Route path="/core-hr/settings" element={<CompanySettingsPage />} />
              <Route path="/core-hr/sql-editor" element={<SqlEditorPage />} />

              {/* Employee Requests (Approvals) */}
              <Route path="/requests/salary" element={<SalaryApprovalsPage />} />
              <Route path="/requests/declarations" element={<DeclarationApprovalsPage />} />
              <Route path="/requests/confirmation" element={<ConfirmationApprovalsPage />} />
              <Route path="/requests/attendance" element={<AttendanceCorrectionsPage />} />
              <Route path="/requests/expenses" element={<ExpenseApprovalsPage />} />

              {/* Engagement - Placeholder for route stability */}
              <Route path="/engagement/surveys" element={<SurveysPage />} />

            </Routes>
          </main>
        </div>
      </div>
  );
};

const App: React.FC = () => {
    return (
        <HashRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </HashRouter>
    );
};

const AppContent: React.FC = () => {
    const { currentUser } = useAuth();
    return currentUser ? (
        <NetworkGuard>
            <MainApp />
        </NetworkGuard>
    ) : (
        <LoginPage />
    );
}

export default App;
