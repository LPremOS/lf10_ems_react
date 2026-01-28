import "./DashboardCards.css";

interface DashboardCardsProps {
  employeecount: number;
  qualificationscount: number;
}

const DashboardCards = ({ employeecount, qualificationscount }: DashboardCardsProps) => (
  <div className="dashboard-cards-container">
    <div className="dashboard-card">
      <div className="dashboard-card-value">{employeecount}</div>
      <div className="dashboard-card-label">Mitarbeiter</div>
    </div>
    <div className="dashboard-card">
      <div className="dashboard-card-value">{qualificationscount}</div>
      <div className="dashboard-card-label">Qualifikationen</div>
    </div>
  </div>
);

export default DashboardCards;