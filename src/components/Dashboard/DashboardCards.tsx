
import { FiUsers, FiAward } from "react-icons/fi";

interface DashboardCardsProps {
  employeesCount: number;
  qualificationsCount: number;
  loadingEmployees: boolean;
  loadingQualifications: boolean;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ employeesCount, qualificationsCount, loadingEmployees, loadingQualifications }) => (
  <div className="dashboard-cards-row">
    <div className="dashboard-card">
      <div className="dashboard-card-value">{loadingEmployees ? '...' : employeesCount}</div>
      <div className="dashboard-card-label">Mitarbeiter insgesamt</div>
      <span className="dashboard-employees-icon"><FiUsers /></span>
    </div>
    <div className="dashboard-card">
      <div className="dashboard-card-value">{loadingQualifications ? '...' : qualificationsCount}</div>
      <div className="dashboard-card-label">Qualifikationen insgesamt</div>
      <span className="dashboard-qualifications-icon"><FiAward /></span>
    </div>
  </div>
);
