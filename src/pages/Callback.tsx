import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

export function Callback() {
    const auth = useAuth();
    const navigate = useNavigate();

        useEffect(() => {
        if (auth.isAuthenticated) {
            navigate("/dashboard");
        }
    }, [auth.isAuthenticated, navigate]);

    if (auth.error) {
        return (
            <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                <h2>Authentifizierungsfehler</h2>
                <p style={{ color: 'red' }}>{auth.error.message}</p>
                <button onClick={() => window.location.href = "/"} className="btn btn-primary">
                    Zurück zum Login
                </button>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '5rem' }}>
            <p>Authentifizierung wird verarbeitet...</p>
            <p style={{ fontSize: '12px', color: '#999' }}>Bitte warten Sie...</p>
        </div>
    );
}