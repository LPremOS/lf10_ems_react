import { EmployeeDetailsView } from "./EmployeeDetailsView";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useEmployeeApi } from '../hooks/useEmployeeApi';
import type { Employee } from '../types/Employee';

export function EmployeeDetails() {
    const { id } = useParams<{ id: string }>();
    const { fetchEmployeeById, loading, error } = useEmployeeApi();
    const [employee, setEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        const loadEmployee = async () => {
            if (id) {
                const data = await fetchEmployeeById(id);
                setEmployee(data);
            }
        };
        loadEmployee();
    }, [fetchEmployeeById, id]);

    if (error) {
        return <div className="text-danger">Fehler: {error}</div>;
    }

    return (
        <EmployeeDetailsView employee={employee} loading={loading} />
    );
}
