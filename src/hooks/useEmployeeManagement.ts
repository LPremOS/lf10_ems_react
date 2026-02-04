import { useCallback, useEffect, useState } from "react";
import { useEmployeeApi } from "./useEmployeeApi";
import type { Employee } from "../types/Employee";

// Higher-Level Hook fuer die Mitarbeiterliste.
// Kapselt Laden + Refresh, damit Komponenten schlank bleiben.
export function useEmployeeManagement() {
    const { fetchEmployees, loading, error } = useEmployeeApi();
    const [employees, setEmployees] = useState<Employee[]>([]);

    const refreshEmployees = useCallback(async () => {
        // Defensive Abfrage, damit der State immer ein Array erhaelt.
        const data = await fetchEmployees();
        if (Array.isArray(data)) {
            setEmployees(data);
        }
    }, [fetchEmployees]);

    useEffect(() => {
        // Initiales Laden direkt beim Mount.
        refreshEmployees();
    }, [refreshEmployees]);

    return {
        employees,
        loading,
        error,
        refreshEmployees,
    };
}
