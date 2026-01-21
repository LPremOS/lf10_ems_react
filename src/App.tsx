import './App.css'
import {Route, Routes, Navigate} from "react-router-dom";
import {UnsecuredFoo} from "./pages/UnsecuredFoo.tsx";
import {SecuredBar} from "./pages/SecuredBar.tsx";
import RequireAuth from "./auth/RequireAuth.tsx";
import {EmployeeTable} from "./pages/EmployeeTable.tsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/employees" replace />}/>
            <Route path="/foo" element={<UnsecuredFoo/>}/>
            <Route path="/bar" element={
                <RequireAuth>
                    <SecuredBar/>
                </RequireAuth>
            }/>
            <Route path="/employees" element={<EmployeeTable/>}/>
        </Routes>
    )
}

export default App