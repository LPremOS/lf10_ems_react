import { useEffect, useState } from "react";
import { useEmployeeApi } from "./useEmployeeApi";
import type { Employee } from "../types/Employee";

export function useEmployeeManagement() {
    const { fetchEmployees, loading, error } = useEmployeeApi();
    const [employees, setEmployees] = useState<Employee[]>([]);

    useEffect(() => {
        const loadEmployees = async () => {
            const data = await fetchEmployees();
            if (Array.isArray(data)) {
                console.log('[useEmployeeManagement] Loaded', data.length, 'employees');
                setEmployees(data);
            }
        };

        loadEmployees();
    }, [fetchEmployees]);

    const refreshEmployees = async () => {
        const data = await fetchEmployees();
        if (Array.isArray(data)) {
            console.log('[useEmployeeManagement] Refreshed', data.length, 'employees');
            setEmployees(data);
        }
    };

    return {
        employees,
        loading,
        error,
        refreshEmployees
    };
}
