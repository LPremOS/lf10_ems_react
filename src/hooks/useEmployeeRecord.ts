import { useEffect, useState } from "react";
import type { Employee } from "../types/Employee";

type FetchEmployeeById = (id: string) => Promise<Employee | null>;

export function useEmployeeRecord(id: string | undefined, fetchEmployeeById: FetchEmployeeById) {
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

    return employee;
}
