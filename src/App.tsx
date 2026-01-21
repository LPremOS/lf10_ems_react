import './App.css'
import {Route, Routes, Navigate} from "react-router-dom";
import {UnsecuredFoo} from "./pages/UnsecuredFoo.tsx";
import { AppLayout } from "./components/layout/AppLayout";
import RequireAuth from "./auth/RequireAuth.tsx";
import {EmployeeTable} from "./pages/EmployeeTable.tsx";
import {SecuredBar} from "./pages/SecuredBar.tsx";
import {Home} from "./pages/Home.tsx";

function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/employees" replace />}/>
                <Route path="/dashboard" element={<Home />}/>
                <Route path="/employees" element={<EmployeeTable/>}/>
                <Route path="/qualifications" element={<div>Qualifikationen (Coming Soon)</div>}/>
                <Route path="/foo" element={<UnsecuredFoo/>}/>
                <Route path="/bar" element={
                    <RequireAuth>
                        <SecuredBar/>
                    </RequireAuth>
                }/>
            </Route>
        </Routes>
    )
}

export default App