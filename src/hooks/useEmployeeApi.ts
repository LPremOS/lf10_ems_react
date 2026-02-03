import { useAuth } from "react-oidc-context";
import { useCallback, useState } from "react";
import type { Employee } from "../types/Employee";

const EMPLOYEES_URL = "http://localhost:8089/employees";
const QUALIFICATIONS_URL = "http://localhost:8089/qualifications";

interface QualificationApiItem {
    id: number;
    skill: string;
}

interface EmployeeApiPayload {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    street?: string;
    postcode?: string;
    skillSet?: number[];
}

interface EmployeeApiResponse {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    street: string;
    postcode: string;
    skillSet?: QualificationApiItem[];
}

type AuthHeaderResult =
    | { ok: true; headers: Record<string, string> }
    | { ok: false; error: string };

type QualificationLookupResult =
    | { ok: true; lookup: Map<string, number> }
    | { ok: false; error: string };

export type MutationResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

function toApiFormat(employee: Partial<Employee>, qualificationBySkill: Map<string, number>): EmployeeApiPayload {
    const payload: EmployeeApiPayload = {};

    if (employee.vorname !== undefined) payload.firstName = employee.vorname;
    if (employee.nachname !== undefined) payload.lastName = employee.nachname;
    if (employee.telefonnummer !== undefined) payload.phone = employee.telefonnummer;
    if (employee.standort !== undefined) payload.city = employee.standort;
    if (employee.street !== undefined) payload.street = employee.street;
    if (employee.postcode !== undefined) payload.postcode = employee.postcode;

    if (employee.qualifikationen !== undefined) {
        payload.skillSet = employee.qualifikationen
            .map((skill) => qualificationBySkill.get(skill))
            .filter((id): id is number => typeof id === "number");
    }

    return payload;
}

function fromApiFormat(apiEmployee: EmployeeApiResponse): Employee {
    return {
        id: String(apiEmployee.id),
        vorname: apiEmployee.firstName ?? "",
        nachname: apiEmployee.lastName ?? "",
        telefonnummer: apiEmployee.phone ?? "",
        standort: apiEmployee.city ?? "",
        street: apiEmployee.street ?? "",
        postcode: apiEmployee.postcode ?? "",
        qualifikationen: (apiEmployee.skillSet ?? []).map((qualification) => qualification.skill),
    };
}

function getStatusMessage(status: number, actionLabel: string): string {
    if (status === 400) return `${actionLabel} fehlgeschlagen. Bitte prüfen Sie die Eingaben.`;
    if (status === 401 || status === 403) return "Ihre Sitzung ist abgelaufen oder Sie haben keine Berechtigung.";
    if (status === 404) return "Der angeforderte Datensatz wurde nicht gefunden.";
    if (status === 409) return "Der Datensatz steht in Konflikt mit bestehenden Daten.";
    if (status >= 500) return "Der Server ist aktuell nicht erreichbar. Bitte später erneut versuchen.";
    return `${actionLabel} fehlgeschlagen.`;
}

export function useEmployeeApi() {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = useCallback((): AuthHeaderResult => {
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

    const fetchQualificationLookup = useCallback(async (headers: Record<string, string>): Promise<QualificationLookupResult> => {
        try {
            const response = await fetch(QUALIFICATIONS_URL, { headers });
            if (!response.ok) {
                const message = getStatusMessage(response.status, "Laden der Qualifikationen");
                setError(message);
                return { ok: false, error: message };
            }
            const qualifications = await response.json() as QualificationApiItem[];
            return {
                ok: true,
                lookup: new Map(qualifications.map((qualification) => [qualification.skill, qualification.id])),
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
            setError(message);
            return { ok: false, error: message };
        }
    }, []);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return [];
            }

            const response = await fetch(EMPLOYEES_URL, { headers: authResult.headers });
            if (!response.ok) {
                const message = getStatusMessage(response.status, "Laden der Mitarbeiter");
                setError(message);
                return [];
            }

            const data = await response.json() as EmployeeApiResponse[];
            return data.map(fromApiFormat);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
            setError(message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    const fetchEmployeeById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return null;
            }

            const response = await fetch(`${EMPLOYEES_URL}/${id}`, { headers: authResult.headers });
            if (!response.ok) {
                const message = getStatusMessage(response.status, "Laden des Mitarbeiters");
                setError(message);
                return null;
            }

            const data = await response.json() as EmployeeApiResponse;
            return fromApiFormat(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    const addEmployee = useCallback(async (employee: Omit<Employee, "id">): Promise<MutationResult<Employee>> => {
        setLoading(true);
        setError(null);

        try {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return { success: false, error: authResult.error };
            }

            let qualificationLookup = new Map<string, number>();
            if (employee.qualifikationen.length > 0) {
                const lookupResult = await fetchQualificationLookup(authResult.headers);
                if (!lookupResult.ok) {
                    return { success: false, error: lookupResult.error };
                }
                qualificationLookup = lookupResult.lookup;
            }

            const payload = toApiFormat(employee, qualificationLookup);
            const response = await fetch(EMPLOYEES_URL, {
                method: "POST",
                headers: authResult.headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const message = getStatusMessage(response.status, "Hinzufügen des Mitarbeiters");
                setError(message);
                return { success: false, error: message };
            }

            const result = await response.json() as EmployeeApiResponse;
            return { success: true, data: fromApiFormat(result) };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, [fetchQualificationLookup, getAuthHeaders]);

    const updateEmployee = useCallback(async (id: string, employee: Partial<Employee>): Promise<MutationResult<Employee>> => {
        setLoading(true);
        setError(null);

        try {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return { success: false, error: authResult.error };
            }

            let qualificationLookup = new Map<string, number>();
            const qualificationList = employee.qualifikationen;
            if (Array.isArray(qualificationList) && qualificationList.length > 0) {
                const lookupResult = await fetchQualificationLookup(authResult.headers);
                if (!lookupResult.ok) {
                    return { success: false, error: lookupResult.error };
                }
                qualificationLookup = lookupResult.lookup;
            }

            const payload = toApiFormat(employee, qualificationLookup);
            const response = await fetch(`${EMPLOYEES_URL}/${id}`, {
                method: "PUT",
                headers: authResult.headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const message = getStatusMessage(response.status, "Speichern der Änderungen");
                setError(message);
                return { success: false, error: message };
            }

            const result = await response.json() as EmployeeApiResponse;
            return { success: true, data: fromApiFormat(result) };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, [fetchQualificationLookup, getAuthHeaders]);

    const deleteEmployee = useCallback(async (id: string): Promise<MutationResult<null>> => {
        setLoading(true);
        setError(null);

        try {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return { success: false, error: authResult.error };
            }

            const response = await fetch(`${EMPLOYEES_URL}/${id}`, {
                method: "DELETE",
                headers: authResult.headers,
            });

            if (!response.ok) {
                const message = getStatusMessage(response.status, "Löschen des Mitarbeiters");
                setError(message);
                return { success: false, error: message };
            }

            return { success: true, data: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    return {
        fetchEmployees,
        fetchEmployeeById,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        loading,
        error,
    };
}
