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

    const runJsonRequest = useCallback(async <T,>(
        url: string,
        init: RequestInit,
        actionLabel: string,
    ): Promise<MutationResult<T>> => {
        try {
            const response = await fetch(url, init);
            if (!response.ok) {
                const message = getStatusMessage(response.status, actionLabel);
                setError(message);
                return { success: false, error: message };
            }

            const data = await response.json() as T;
            return { success: true, data };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    const runNoContentRequest = useCallback(async (
        url: string,
        init: RequestInit,
        actionLabel: string,
    ): Promise<MutationResult<null>> => {
        try {
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

    const fetchQualificationLookup = useCallback(async (headers: Record<string, string>): Promise<MutationResult<Map<string, number>>> => {
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

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
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

            return result.data.map(fromApiFormat);
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, runJsonRequest]);

    const fetchEmployeeById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
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

            return fromApiFormat(result.data);
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, runJsonRequest]);

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
                if (!lookupResult.success) {
                    return lookupResult;
                }
                qualificationLookup = lookupResult.data;
            }

            const payload = toApiFormat(employee, qualificationLookup);
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

            return { success: true, data: fromApiFormat(result.data) };
        } finally {
            setLoading(false);
        }
    }, [fetchQualificationLookup, getAuthHeaders, runJsonRequest]);

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
                if (!lookupResult.success) {
                    return lookupResult;
                }
                qualificationLookup = lookupResult.data;
            }

            const payload = toApiFormat(employee, qualificationLookup);
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

            return { success: true, data: fromApiFormat(result.data) };
        } finally {
            setLoading(false);
        }
    }, [fetchQualificationLookup, getAuthHeaders, runJsonRequest]);

    const deleteEmployee = useCallback(async (id: string): Promise<MutationResult<null>> => {
        setLoading(true);
        setError(null);

        try {
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
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, runNoContentRequest]);

    const deleteQualificationFromEmployee = useCallback(async (eId: string, qId:number): Promise<MutationResult<null>> => {
        setLoading(true);
        setError(null);

        try {
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
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, runNoContentRequest]);

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
