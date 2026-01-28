import "./DashboardCards.css";


const DashboardCards = ({ employeecount, qualificationscount }) => (
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