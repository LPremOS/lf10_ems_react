import "./styles/App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Loader } from "./components/common/Loader.tsx";
import { AppLayout } from "./components/layout/AppLayout.tsx";
import { Callback } from "./pages/Callback.tsx";
import Dashboard from "./pages/Dashboard";
import { EmployeeAdd } from "./pages/EmployeeAdd.tsx";
import { EmployeeDetails } from "./pages/EmployeeDetails.tsx";
import { EmployeeEdit } from "./pages/EmployeeEdit.tsx";
import { EmployeeOverview } from "./pages/EmployeeOverview.tsx";
import { Login } from "./pages/Login.tsx";
import { QualificationsOverview } from "./pages/QualificationsOverview.tsx";
import { EMPLOYEE_ROUTES } from "./features/employees/routes";

// Zentrale Route-Konfiguration der Anwendung.
function App() {
    const auth = useAuth();

    // Solange OIDC den Login-Status prueft, zeigen wir nur einen Loader.
    if (auth.isLoading) {
        return <Loader />;
    }

    return (
        <Routes>
            <Route path="/callback" element={<Callback />} />

            {/* Nicht eingeloggt: jeder Pfad fuehrt zur Login-Seite */}
            {!auth.isAuthenticated && <Route path="*" element={<Login />} />}

            {/* Eingeloggt: alle geschuetzten Seiten inkl. Mitarbeiterverwaltung */}
            {auth.isAuthenticated && (
                <>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path={EMPLOYEE_ROUTES.overview} element={<EmployeeOverview />} />
                        <Route path={EMPLOYEE_ROUTES.create} element={<EmployeeAdd />} />
                        <Route path={EMPLOYEE_ROUTES.detailsPattern} element={<EmployeeDetails />} />
                        <Route path={EMPLOYEE_ROUTES.editPattern} element={<EmployeeEdit />} />
                        <Route path="/qualifications" element={<QualificationsOverview />} />
                    </Route>
                </>
            )}
        </Routes>
    );
}

export default App;
