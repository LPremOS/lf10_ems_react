import { useNavigate } from "react-router-dom";
import {FiAward, FiUsers, FiArrowRight} from "react-icons/fi";


import "./Dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();
    return (
        <>
            <div className="dashboard-content-wrapper">
                <h1 className="dashboard-title">Dashboard</h1>
                <div className="dashboard-cards-row">
                    <div className="dashboard-card">
                        <div className="dashboard-card-value"> 100</div>
                        <div className="dashboard-card-label">Mitarbeiter insgesamt</div>
                            <span className="dashboard-employees-icon"><FiUsers/></span>
                    </div>
                    <div className="dashboard-card">
                        <div className="dashboard-card-value">5</div>
                        <div className="dashboard-card-label">Qualifikationen insgesamt</div>
                            <span className="dashboard-qualifications-icon"><FiAward/></span>
                    </div>
                </div>
                <h2 className="dashboard-subtitle">Schnellzugriff</h2>
                <div className="dashboard-quicklinks-row">
                    <div
                        className="dashboard-quicklink-card"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/employees')}
                    >
                        <span className="dashboard-quicklink-icon">
                            <FiUsers/>
                        </span>
                        <div className="dashboard-quicklink-content">
                            <div className="dashboard-quicklink-title">Mitarbeiterverwaltung</div>
                            <div className="dashboard-quicklink-desc">Alle Mitarbeiterdaten verwalten und neue hinzufügen.</div>
                        </div>
                        <span className="dashboard-quicklink-arrow"><FiArrowRight /></span>
                    </div>
                    <div
                        className="dashboard-quicklink-card"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/qualifications')}
                    >
                        <span className="dashboard-quicklink-icon">
                            <FiAward/>
                        </span>
                        <div className="dashboard-quicklink-content">
                            <div className="dashboard-quicklink-title">Qualifikationsverwaltung</div>
                            <div className="dashboard-quicklink-desc">Qualifikationen einsehen und bearbeiten.</div>
                        </div>
                        <span className="dashboard-quicklink-arrow"><FiArrowRight /></span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;