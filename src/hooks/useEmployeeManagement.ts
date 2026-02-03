import { useCallback, useEffect, useState } from "react";
import { useEmployeeApi } from "./useEmployeeApi";
import type { Employee } from "../types/Employee";

export function useEmployeeManagement() {
    const { fetchEmployees, loading, error } = useEmployeeApi();
    const [employees, setEmployees] = useState<Employee[]>([]);

    const refreshEmployees = useCallback(async () => {
        const data = await fetchEmployees();
        if (Array.isArray(data)) {
            setEmployees(data);
        }
    }, [fetchEmployees]);

    useEffect(() => {
        refreshEmployees();
    }, [refreshEmployees]);

    return {
        employees,
        loading,
        error,
        refreshEmployees,
    };
}
