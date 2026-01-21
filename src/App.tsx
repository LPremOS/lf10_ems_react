import './App.css'
import {Route, Routes, Navigate} from "react-router-dom";
import {UnsecuredFoo} from "./pages/UnsecuredFoo.tsx";
import RequireAuth from "./auth/RequireAuth.tsx";
import {EmployeeTable} from "./pages/EmployeeTable.tsx";
import Dashboard from './pages/Dashboard';
import {SecuredBar} from "./pages/SecuredBar.tsx";
import { AppLayout } from './components/layout/AppLayout.tsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />}/>
            <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/foo" element={<UnsecuredFoo/>}/>
                <Route path="/bar" element={
                    <RequireAuth>
                        <SecuredBar/>
                    </RequireAuth>
                }/>
                <Route path="/employees" element={<EmployeeTable/>}/>
            </Route>
        </Routes>
    )
}

export default App