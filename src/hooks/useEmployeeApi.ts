import {useAuth} from "react-oidc-context";
import {useState} from "react";

export function useEmployeeApi() {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            if (auth.user?.access_token) {
                headers['Authorization'] = `Bearer ${auth.user.access_token}`;
            }

            const response = await fetch('http://localhost:8089/employees', {headers});
            if (!response.ok) {
                setError("Fehler beim Laden der Mitarbeiter");
            }
            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeeById = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            if (auth.user?.access_token) {
                headers['Authorization'] = `Bearer ${auth.user.access_token}`;
            }

            const response = await fetch(`http://localhost:8089/employees/${id}`, {headers});
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
    };

    return {fetchEmployees, fetchEmployeeById, loading, error};
}