import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeApi } from "../hooks/useEmployeeApi";
import { useQualifiactionApi } from "../hooks/useQualificationApi";
import "./Dashboard.css";
import { DashboardCards } from "../components/dashboard/DashboardCards";
import { DashboardQuicklinks } from "../components/dashboard/DashboardQuicklinks";

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
                <DashboardCards 
                  employeesCount={employees.length}
                  qualificationsCount={qualifications.length}
                  loadingEmployees={loadingEmployees}
                  loadingQualifications={loadingQualifications}
                />

                
                <h2 className="dashboard-subtitle">Schnellzugriff</h2>
                <DashboardQuicklinks />
            </div>
        </>
    );
};

export default Dashboard;