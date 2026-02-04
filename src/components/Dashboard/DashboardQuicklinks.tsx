import React from "react";
import { FiArrowRight, FiUsers, FiAward } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export const DashboardQuicklinks: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="dashboard-quicklinks-row">
      <div
        className="dashboard-quicklink-card"
        tabIndex={0}
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/employees')}
      >
        <span className="dashboard-quicklink-icon">
          <FiUsers />
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
          <FiAward />
        </span>
        <div className="dashboard-quicklink-content">
          <div className="dashboard-quicklink-title">Qualifikationsverwaltung</div>
          <div className="dashboard-quicklink-desc">Qualifikationen einsehen und bearbeiten.</div>
        </div>
        <span className="dashboard-quicklink-arrow"><FiArrowRight /></span>
      </div>
    </div>
  );
};
