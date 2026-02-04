import { useAuth } from "react-oidc-context";
import { useCallback, useState } from "react";
import type { Employee } from "../types/Employee";
import {
    EMPLOYEES_URL,
    QUALIFICATIONS_URL,
    type EmployeeApiResponse,
    type QualificationApiItem,
    fromEmployeeApiResponse,
    toEmployeeApiPayload,
} from "../features/employees/apiModel";

// Ergebnis von Header-Erzeugung inkl. Auth-Pruefung.
type AuthHeaderResult =
    | { ok: true; headers: Record<string, string> }
    | { ok: false; error: string };

// Einheitliches Ergebnisformat fuer alle Mutation-Operationen.
export type EmployeeMutationResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };
export type MutationResult<T> = EmployeeMutationResult<T>;

function getStatusMessage(status: number, actionLabel: string): string {
    // Zentralisierte, nutzerfreundliche Fehlermeldungen pro HTTP-Status.
    if (status === 400) return `${actionLabel} fehlgeschlagen. Bitte prüfen Sie die Eingaben.`;
    if (status === 401 || status === 403) return "Ihre Sitzung ist abgelaufen oder Sie haben keine Berechtigung.";
    if (status === 404) return "Der angeforderte Datensatz wurde nicht gefunden.";
    if (status === 409) return "Der Datensatz steht in Konflikt mit bestehenden Daten.";
    if (status >= 500) return "Der Server ist aktuell nicht erreichbar. Bitte später erneut versuchen.";
    return `${actionLabel} fehlgeschlagen.`;
}

// API-Hook fuer die komplette Mitarbeiterverwaltung (CRUD + Qualifikationszuordnung).
export function useEmployeeApi() {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = useCallback((): AuthHeaderResult => {
        // Ohne gueltige Session duerfen keine Backend-Requests gestartet werden.
        if (!auth.isAuthenticated) {
            const message = "Nicht authentifiziert. Bitte melden Sie sich erneut an.";
            setError(message);
            return { ok: false, error: message };
        }

        if (!auth.user?.access_token) {
            const message = "Kein Authentifizierungs-Token vorhanden.";
            setError(message);
            return { ok: false, error: message };
        }

        return {
            ok: true,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${auth.user.access_token}`,
            },
        };
    }, [auth.isAuthenticated, auth.user?.access_token]);

    const withLoading = useCallback(async <T,>(operation: () => Promise<T>): Promise<T> => {
        // Standardrahmen fuer Ladezustand + Fehler-Reset.
        setLoading(true);
        setError(null);

        try {
            return await operation();
        } finally {
            setLoading(false);
        }
    }, []);

    const runJsonRequest = useCallback(async <T,>(
        url: string,
        init: RequestInit,
        actionLabel: string,
    ): Promise<EmployeeMutationResult<T>> => {
        try {
            // Standard-Request fuer Endpunkte mit JSON-Response.
            const response = await fetch(url, init);
            if (!response.ok) {
                const message = getStatusMessage(response.status, actionLabel);
                setError(message);
                return { success: false, error: message };
            }

            const data = await response.json() as T;
            return { success: true, data };
        } catch (err) {
            // Netz-/Parsingfehler landen ebenfalls im globalen error-State.
            const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    const runNoContentRequest = useCallback(async (
        url: string,
        init: RequestInit,
        actionLabel: string,
    ): Promise<EmployeeMutationResult<null>> => {
        try {
            // Standard-Request fuer DELETE/204-Operationen ohne Body.
            const response = await fetch(url, init);
            if (!response.ok) {
                const message = getStatusMessage(response.status, actionLabel);
                setError(message);
                return { success: false, error: message };
            }

            return { success: true, data: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    const fetchQualificationLookup = useCallback(async (headers: Record<string, string>): Promise<EmployeeMutationResult<Map<string, number>>> => {
        // Mapping "Skillname -> Skill-ID" fuer POST/PUT-Payload.
        const result = await runJsonRequest<QualificationApiItem[]>(
            QUALIFICATIONS_URL,
            { headers },
            "Laden der Qualifikationen",
        );

        if (!result.success) {
            return result;
        }

        return {
            success: true,
            data: new Map(result.data.map((qualification) => [qualification.skill, qualification.id])),
        };
    }, [runJsonRequest]);

    const fetchEmployees = useCallback(async (): Promise<Employee[]> => {
        return withLoading(async () => {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return [];
            }

            const result = await runJsonRequest<EmployeeApiResponse[]>(
                EMPLOYEES_URL,
                { headers: authResult.headers },
                "Laden der Mitarbeiter",
            );

            if (!result.success) {
                return [];
            }

            // API-Modell -> UI-Modell.
            return result.data.map(fromEmployeeApiResponse);
        });
    }, [getAuthHeaders, runJsonRequest, withLoading]);

    const fetchEmployeeById = useCallback(async (id: string): Promise<Employee | null> => {
        return withLoading(async () => {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return null;
            }

            const result = await runJsonRequest<EmployeeApiResponse>(
                `${EMPLOYEES_URL}/${id}`,
                { headers: authResult.headers },
                "Laden des Mitarbeiters",
            );

            if (!result.success) {
                return null;
            }

            // API-Modell -> UI-Modell.
            return fromEmployeeApiResponse(result.data);
        });
    }, [getAuthHeaders, runJsonRequest, withLoading]);

    const addEmployee = useCallback(async (employee: Omit<Employee, "id">): Promise<EmployeeMutationResult<Employee>> => {
        return withLoading(async () => {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return { success: false, error: authResult.error };
            }

            let qualificationLookup = new Map<string, number>();
            if (employee.qualifikationen.length > 0) {
                // Nur laden, wenn wir Qualifikationen wirklich mappen muessen.
                const lookupResult = await fetchQualificationLookup(authResult.headers);
                if (!lookupResult.success) {
                    return lookupResult;
                }
                qualificationLookup = lookupResult.data;
            }

            const payload = toEmployeeApiPayload(employee, qualificationLookup);
            const result = await runJsonRequest<EmployeeApiResponse>(
                EMPLOYEES_URL,
                {
                    method: "POST",
                    headers: authResult.headers,
                    body: JSON.stringify(payload),
                },
                "Hinzufügen des Mitarbeiters",
            );

            if (!result.success) {
                return result;
            }

            // Rueckgabe immer im Frontend-Employee-Format.
            return { success: true, data: fromEmployeeApiResponse(result.data) };
        });
    }, [fetchQualificationLookup, getAuthHeaders, runJsonRequest, withLoading]);

    const updateEmployee = useCallback(async (id: string, employee: Partial<Employee>): Promise<EmployeeMutationResult<Employee>> => {
        return withLoading(async () => {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return { success: false, error: authResult.error };
            }

            let qualificationLookup = new Map<string, number>();
            const qualificationList = employee.qualifikationen;
            if (Array.isArray(qualificationList) && qualificationList.length > 0) {
                // Bei Qualifikations-Update ebenfalls Name->ID Mapping laden.
                const lookupResult = await fetchQualificationLookup(authResult.headers);
                if (!lookupResult.success) {
                    return lookupResult;
                }
                qualificationLookup = lookupResult.data;
            }

            const payload = toEmployeeApiPayload(employee, qualificationLookup);
            const result = await runJsonRequest<EmployeeApiResponse>(
                `${EMPLOYEES_URL}/${id}`,
                {
                    method: "PUT",
                    headers: authResult.headers,
                    body: JSON.stringify(payload),
                },
                "Speichern der Änderungen",
            );

            if (!result.success) {
                return result;
            }

            // Rueckgabe immer im Frontend-Employee-Format.
            return { success: true, data: fromEmployeeApiResponse(result.data) };
        });
    }, [fetchQualificationLookup, getAuthHeaders, runJsonRequest, withLoading]);

    const deleteEmployee = useCallback(async (id: string): Promise<EmployeeMutationResult<null>> => {
        return withLoading(async () => {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return { success: false, error: authResult.error };
            }

            return await runNoContentRequest(
                `${EMPLOYEES_URL}/${id}`,
                {
                    method: "DELETE",
                    headers: authResult.headers,
                },
                "Löschen des Mitarbeiters",
            );
        });
    }, [getAuthHeaders, runNoContentRequest, withLoading]);

    const deleteQualificationFromEmployee = useCallback(async (eId: string, qId: number): Promise<EmployeeMutationResult<null>> => {
        return withLoading(async () => {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return { success: false, error: authResult.error };
            }

            return await runNoContentRequest(
                `${EMPLOYEES_URL}/${eId}/qualifications/${qId}`,
                {
                    method: "DELETE",
                    headers: authResult.headers,
                },
                "Löschen der Qualifikation eines Mitarbeiters",
            );
        });
    }, [getAuthHeaders, runNoContentRequest, withLoading]);

    return {
        fetchEmployees,
        fetchEmployeeById,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        deleteQualificationFromEmployee,
        loading,
        error,
    };
}
