import { useAuth } from "react-oidc-context";
import { useCallback, useState } from "react";
import type { QualificationType } from "../types/QualificationType";

const QUALIFICATIONS_URL = "http://localhost:8089/qualifications";

type AuthHeaderResult =
    | { ok: true; headers: Record<string, string> }
    | { ok: false; error: string };

export type QualificationMutationResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

function getStatusMessage(status: number, actionLabel: string): string {
    if (status === 400) return `${actionLabel} fehlgeschlagen. Bitte prüfen Sie die Eingaben.`;
    if (status === 401 || status === 403) return "Ihre Sitzung ist abgelaufen oder Sie haben keine Berechtigung.";
    if (status === 404) return "Die gewünschte Qualifikation wurde nicht gefunden.";
    if (status === 409) return "Diese Qualifikation existiert bereits.";
    if (status >= 500) return "Der Server ist aktuell nicht erreichbar. Bitte später erneut versuchen.";
    return `${actionLabel} fehlgeschlagen.`;
}

export function useQualificationApi() {
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

    const fetchQualifications = useCallback(async (): Promise<QualificationType[]> => {
        setLoading(true);
        setError(null);

        try {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return [];
            }

            const response = await fetch(QUALIFICATIONS_URL, { headers: authResult.headers });
            if (!response.ok) {
                setError(getStatusMessage(response.status, "Laden der Qualifikationen"));
                return [];
            }

            return await response.json() as QualificationType[];
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.");
            return [];
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    const fetchQualificationById = useCallback(async (id: string): Promise<QualificationType | null> => {
        setLoading(true);
        setError(null);

        try {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return null;
            }

            const response = await fetch(`${QUALIFICATIONS_URL}/${id}`, { headers: authResult.headers });
            if (!response.ok) {
                setError(getStatusMessage(response.status, "Laden der Qualifikation"));
                return null;
            }

            return await response.json() as QualificationType;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.");
            return null;
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    const addQualification = useCallback(async (skillName: string): Promise<QualificationMutationResult<QualificationType>> => {
        setLoading(true);
        setError(null);

        try {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return { success: false, error: authResult.error };
            }

            const response = await fetch(QUALIFICATIONS_URL, {
                method: "POST",
                headers: authResult.headers,
                body: JSON.stringify({ skill: skillName }),
            });

            if (!response.ok) {
                const message = getStatusMessage(response.status, "Anlegen der Qualifikation");
                setError(message);
                return { success: false, error: message };
            }

            const data = await response.json() as QualificationType;
            return { success: true, data };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    const deleteQualification = useCallback(async (id: number): Promise<QualificationMutationResult<null>> => {
        setLoading(true);
        setError(null);

        try {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return { success: false, error: authResult.error };
            }

            const response = await fetch(`${QUALIFICATIONS_URL}/${id}`, {
                method: "DELETE",
                headers: authResult.headers,
            });
            if (!response.ok) {
                const message = getStatusMessage(response.status, "Löschen der Qualifikation");
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

    const editQualification = useCallback(async (id: number, skillInput: string): Promise<QualificationMutationResult<QualificationType>> => {
        setLoading(true);
        setError(null);

        try {
            const authResult = getAuthHeaders();
            if (!authResult.ok) {
                return { success: false, error: authResult.error };
            }

            const response = await fetch(`${QUALIFICATIONS_URL}/${id}`, {
                method: "PUT",
                headers: authResult.headers,
                body: JSON.stringify({ skill: skillInput }),
            });
            if (!response.ok) {
                const message = getStatusMessage(response.status, "Bearbeiten der Qualifikation");
                setError(message);
                return { success: false, error: message };
            }

            const data = await response.json() as QualificationType;
            return { success: true, data };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    return {
        fetchQualifications,
        fetchQualificationById,
        addQualification,
        deleteQualification,
        editQualification,
        loading,
        error,
    };
}
