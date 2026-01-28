import {useAuth} from "react-oidc-context";
import {useState} from "react";
import type { QualificationType } from "../types/QualificationType";

export function useQualifiactionApi() {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchQualifications = async () => {
        setLoading(true);
        setError(null);

        try {
            if(!auth.isAuthenticated) {
                setError("Nicht authentifiziert");
                return[];
            }

            if(!auth.user?.access_token) {
                setError("Kein Authentifizierungs-Token vorhanden");
                return [];
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.user.access_token}`
            };

            console.log("Auth: " + auth.user.access_token);

            const response = await fetch('http://localhost:8089/qualifications', {headers});
            if (!response.ok) {
                setError("Fehler beim Laden der Qualifikationen");

            }
            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };

    const fetchQualificationById = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            if (auth.user?.access_token) {
                headers['Authorization'] = `Bearer ${auth.user.access_token}`;
            }

            const response = await fetch(`http://localhost:8089/qualifications/${id}`, {headers});
            if (!response.ok) {
                setError("Fehler beim Laden der Qualifikation");
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

     const addQualification = async (skillName:string) => {
        setLoading(true);
        setError(null);

        try {
            if(!auth.isAuthenticated) {
                setError("Nicht authentifiziert");
                return[];
            }

            if(!auth.user?.access_token) {
                setError("Kein Authentifizierungs-Token vorhanden");
                return [];
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.user.access_token}`
            };

            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ skill: skillName})
            };

            const response = await fetch('http://localhost:8089/qualifications', requestOptions);
            if (!response.ok) {
                setError("Fehler beim hinzufügen der Qualifikationen");
            }
            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };

    const deleteQualification = async (id:number) => {
        setLoading(true);
        setError(null);

        try {
            if(!auth.isAuthenticated) {
                setError("Nicht authentifiziert");
                return[];
            }

            if(!auth.user?.access_token) {
                setError("Kein Authentifizierungs-Token vorhanden");
                return [];
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.user.access_token}`
            };

            const requestOptions = {
                method: 'DELETE',
                headers: headers,
            };

            const response = await fetch('http://localhost:8089/qualifications/'+id, requestOptions);
            if (!response.ok) {
                setError("Fehler beim löschen der Qualifikationen");
            }
            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };

    const editQualification = async (id:number, skillInput:string) => {
        setLoading(true);
        setError(null);

        try {
            if(!auth.isAuthenticated) {
                setError("Nicht authentifiziert");
                return[];
            }

            if(!auth.user?.access_token) {
                setError("Kein Authentifizierungs-Token vorhanden");
                return [];
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.user.access_token}`
            };

            const requestOptions = {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({ skill: skillInput})
            };

            const response = await fetch('http://localhost:8089/qualifications/'+id, requestOptions);
            if (!response.ok) {
                setError("Fehler beim Laden der Qualifikationen");
            }
            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };



    return {fetchQualifications, fetchQualificationById, addQualification, deleteQualification, editQualification, loading, error};
}