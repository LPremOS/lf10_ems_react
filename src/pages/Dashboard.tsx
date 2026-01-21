import React from "react";
import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();
    return (
        <>
            <div className="dashboard-content-wrapper">
                <h1 className="dashboard-title">Dashboard</h1>
                <div className="dashboard-cards-row">
                    <div className="dashboard-card">
                        <div className="dashboard-card-value"> TEMP 100</div>
                        <div className="dashboard-card-label">Mitarbeiter insgesamt</div>
                            <span className="dashboard-employees-icon">[icon]</span>
                    </div>
                    <div className="dashboard-card">
                        <div className="dashboard-card-value">TEMP 5</div>
                        <div className="dashboard-card-label">Qualifikationen insgesamt</div>
                            <span className="dashboard-qualifications-icon">[icon]</span>
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
                        <div>
                            <div className="dashboard-quicklink-title">Mitarbeiterverwaltung</div>
                            <div className="dashboard-quicklink-desc">Alle Mitarbeiterdaten verwalten und neue hinzufügen.</div>
                        </div>
                        <span className="dashboard-quicklink-arrow">→</span>
                    </div>
                    <div
                        className="dashboard-quicklink-card"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/qualifications')}
                    >
                        <div>
                            <div className="dashboard-quicklink-title">Qualifikationsverwaltung</div>
                            <div className="dashboard-quicklink-desc">Qualifikationen einsehen und bearbeiten.</div>
                        </div>
                        <span className="dashboard-quicklink-arrow">→</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;