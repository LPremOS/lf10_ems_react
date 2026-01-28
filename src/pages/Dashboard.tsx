import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {FiAward, FiHome, FiUsers, FiArrowRight, FiBriefcase} from "react-icons/fi";
import { useEmployeeApi } from "../hooks/useEmployeeApi";
import { useQualifiactionApi } from "../hooks/useQualificationApi";
import "./Dashboard.css";

interface Employee {
  id: string;
  vorname: string;
  nachname: string;
  ort: string;
  qualifikationen: string[];
}

interface Qualification {
  id: string;
  name: string;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const { fetchEmployees, loading: loadingEmployees } = useEmployeeApi();
    const { fetchQualifications, loading: loadingQualifications } = useQualifiactionApi();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [qualifications, setQualifications] = useState<Qualification[]>([]);

    useEffect(() => {
        const loadEmployees = async () => {
            const data = await fetchEmployees();
            if (Array.isArray(data)) setEmployees(data);
        };
        loadEmployees();        
    }, []);

    useEffect(() => {
        const loadQualifications = async () => {
            const data = await fetchQualifications();
            if (Array.isArray(data)) setQualifications(data);
        };
        loadQualifications();
    }, []);
    
    return (
        <>
            <div className="dashboard-content-wrapper">
                <h1 className="dashboard-title">Dashboard</h1>
                <div className="dashboard-cards-row">
                    <div className="dashboard-card">
                        <div className="dashboard-card-value">{loadingEmployees ? '...' : employees.length}</div>
                        <div className="dashboard-card-label">Mitarbeiter insgesamt</div>
                            <span className="dashboard-employees-icon"><FiUsers/></span>
                    </div>
                    <div className="dashboard-card">
                        <div className="dashboard-card-value">{loadingQualifications ? '...' : qualifications.length}</div>
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