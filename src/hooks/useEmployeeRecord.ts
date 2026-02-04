import { useEffect, useState } from "react";
import type { Employee } from "../types/Employee";

// Signatur der Ladefunktion, die aus useEmployeeApi uebergeben wird.
type FetchEmployeeById = (id: string) => Promise<Employee | null>;

// Laedt genau einen Mitarbeiterdatensatz (z.B. fuer Details/Edit).
// Der Hook verhindert State-Updates nach Unmount.
export function useEmployeeRecord(id: string | undefined, fetchEmployeeById: FetchEmployeeById) {
    const [employee, setEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        // Flag, damit asynchrone Antworten nach Unmount ignoriert werden.
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
            // Ab hier darf kein setState mehr erfolgen.
            isActive = false;
        };
    }, [fetchEmployeeById, id]);

    return employee;
}
