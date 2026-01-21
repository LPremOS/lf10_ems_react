import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Sidebar } from "./Sidebar";
import "./AppLayout.css";

export function AppLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const auth = useAuth();

    const handleToggle = () => {
        setIsCollapsed((prev) => !prev);
    };

    const handleLogout = async () => {
        try {
            await auth.removeUser();
            await auth.signoutRedirect();
            navigate("/");
        } catch (error) {
            console.error("Logout fehlgeschlagen:", error);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar
                isCollapsed={isCollapsed}
                onToggle={handleToggle}
                onLogout={handleLogout}
            />
            <main className="app-layout__content">
                <Outlet />
            </main>
        </div>
    );
}
