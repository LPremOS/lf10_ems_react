import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEmployeeApi } from "../hooks/useEmployeeApi";
import type { Employee } from "../types/Employee";
import { EmployeeDetailsView } from "./EmployeeDetailsView";

export function EmployeeDetails() {
    const { id } = useParams<{ id: string }>();
    const { fetchEmployeeById, loading, error } = useEmployeeApi();
    const [employee, setEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        let isActive = true;

        const loadEmployee = async () => {
            if (!id) {
                if (isActive) {
                    setEmployee(null);
                }
                return;
            }

            const data = await fetchEmployeeById(id);
            if (isActive) {
                setEmployee(data);
            }
        };

        loadEmployee();
        return () => {
            isActive = false;
        };
    }, [fetchEmployeeById, id]);

    return <EmployeeDetailsView employee={employee} loading={loading} error={error} />;
}
