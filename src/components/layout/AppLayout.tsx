import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Sidebar } from "./Sidebar";
import "./AppLayout.css";

export function AppLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleToggle = () => setIsCollapsed(prev => !prev);

    const toggleMobile = () => setIsMobileOpen(prev => !prev);
    const closeMobile = () => setIsMobileOpen(false);
    const navigate = useNavigate();
    const auth = useAuth();

    const handleLogout = async () => {
        try {
            await auth.removeUser();
            closeMobile();
            navigate("/login", { replace: true });
        } catch (e) {
            console.error("Logout fehlgeschlagen:", e);
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="app-layout">
            {/* Mobile hamburger (immer sichtbar, wenn mobile) */}
            <button
                className="mobile-menu-button"
                type="button"
                onClick={toggleMobile}
                aria-label={isMobileOpen ? "Menü schließen" : "Menü öffnen"}
            >
                ☰
            </button>

            {/* Backdrop nur wenn Drawer offen */}
            {isMobileOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={closeMobile}
                    aria-hidden="true"
                />
            )}

            <Sidebar
                isCollapsed={isCollapsed}
                onToggle={handleToggle}
                onLogout={handleLogout}
                isMobileOpen={isMobileOpen}
                onCloseMobile={closeMobile}
            />

            <main className="app-layout__content">
                <Outlet />
            </main>
        </div>
    );
}
