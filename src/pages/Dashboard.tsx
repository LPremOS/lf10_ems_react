import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeApi } from "../hooks/useEmployeeApi";
import { useQualificationApi } from "../hooks/useQualificationApi";
import type { Employee as EmployeeType } from "../types/Employee";
import type { QualificationType } from "../types/QualificationType";
import "./Dashboard.css";
import { DashboardCards } from "../components/dashboard/DashboardCards";
import { DashboardQuicklinks } from "../components/dashboard/DashboardQuicklinks";

const Dashboard = () => {
    const navigate = useNavigate();
    const { fetchEmployees, loading: loadingEmployees } = useEmployeeApi();
    const { fetchQualifications, loading: loadingQualifications } = useQualificationApi();
    const [employees, setEmployees] = useState<EmployeeType[]>([]);
    const [qualifications, setQualifications] = useState<QualificationType[]>([]);

    useEffect(() => {
        const loadEmployees = async () => {
            const data = await fetchEmployees();
            if (Array.isArray(data)) {
                setEmployees(data);
            }
        };

        loadEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        const loadQualifications = async () => {
            const data = await fetchQualifications();
            if (Array.isArray(data)) {
                setQualifications(data);
            }
        };

        loadQualifications();
    }, [fetchQualifications]);

    return (
        <div>
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
        </div>
    );
};

export default Dashboard;
