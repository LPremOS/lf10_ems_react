import {useAuth} from "react-oidc-context";
import {useState, useCallback} from "react";
import type {Employee} from "../types/Employee";

export function useEmployeeApi() {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (!auth.isAuthenticated) {
                setError("Nicht authentifiziert");
                return [];
            }

            if (!auth.user?.access_token) {
                setError("Kein Authentifizierungs-Token vorhanden");
                return [];
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.user.access_token}`
            };

            const response = await fetch('http://localhost:8089/employees', { headers });

            if (!response.ok) {
                setError("Fehler beim Laden der Mitarbeiter");
                return [];
            }
            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
            return [];
        } finally {
            setLoading(false);
        }
    }, [auth.isAuthenticated, auth.user?.access_token]);

    const fetchEmployeeById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            if (!auth.isAuthenticated) {
                setError("Nicht authentifiziert");
                return null;
            }

            if (!auth.user?.access_token) {
                setError("Kein Authentifizierungs-Token vorhanden");
                return null;
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.user.access_token}`
            };

            const response = await fetch(`http://localhost:8089/employees/${id}`, { headers });
            if (!response.ok) {
                setError("Fehler beim Laden des Mitarbeiters");
                return null;
            }
            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
            return null;
        } finally {
            setLoading(false);
        }
    }, [auth.isAuthenticated, auth.user?.access_token]);

    const addEmployee = useCallback(async (employee: Omit<Employee, 'id'>) => {
        setLoading(true);
        setError(null);

        try {
            if (!auth.isAuthenticated) {
                setError("Nicht authentifiziert");
                return null;
            }

            if (!auth.user?.access_token) {
                setError("Kein Authentifizierungs-Token vorhanden");
                return null;
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.user.access_token}`
            };

            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(employee)
            };

            const response = await fetch('http://localhost:8089/employees', requestOptions);
            if (!response.ok) {
                setError("Fehler beim Hinzufügen des Mitarbeiters");
                return null;
            }
            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
            return null;
        } finally {
            setLoading(false);
        }
    }, [auth.isAuthenticated, auth.user?.access_token]);

    const updateEmployee = useCallback(async (id: string, employee: Partial<Employee>) => {
        setLoading(true);
        setError(null);

        try {
            if (!auth.isAuthenticated) {
                setError("Nicht authentifiziert");
                return null;
            }

            if (!auth.user?.access_token) {
                setError("Kein Authentifizierungs-Token vorhanden");
                return null;
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.user.access_token}`
            };

            const requestOptions = {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(employee)
            };

            const response = await fetch(`http://localhost:8089/employees/${id}`, requestOptions);
            if (!response.ok) {
                setError("Fehler beim Aktualisieren des Mitarbeiters");
                return null;
            }
            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
            return null;
        } finally {
            setLoading(false);
        }
    }, [auth.isAuthenticated, auth.user?.access_token]);

    const deleteEmployee = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            if (!auth.isAuthenticated) {
                setError("Nicht authentifiziert");
                return false;
            }

            if (!auth.user?.access_token) {
                setError("Kein Authentifizierungs-Token vorhanden");
                return false;
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.user.access_token}`
            };

            const requestOptions = {
                method: 'DELETE',
                headers: headers,
            };

            const response = await fetch(`http://localhost:8089/employees/${id}`, requestOptions);
            if (!response.ok) {
                setError("Fehler beim Löschen des Mitarbeiters");
                return false;
            }
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
            return false;
        } finally {
            setLoading(false);
        }
    }, [auth.isAuthenticated, auth.user?.access_token]);

    return {
        fetchEmployees,
        fetchEmployeeById,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        loading,
        error
    };
}