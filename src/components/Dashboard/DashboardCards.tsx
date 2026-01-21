import "./DashboardCards.css";

type DashboardCardsProps = {
  employeecount: number;
  qualificationscount: number;
};


const DashboardCards = ({ employeecount, qualificationscount }: DashboardCardsProps) => (
<div className="dashboard-cards-row">
    <div className="dashboard-card">
        <div className="dashboard-card-value">{employeecount}</div>
        <div className="dashboard-card-albel">Mitarbeiter</div>    
    </div>
    <div className="dashboard-card">
        <div className="dashboard-card-value">{qualificationscount}</div>
        <div className="dashboard-card-albel">Qualifikationen</div>    
    </div>   
</div>

);

export default DashboardCards;