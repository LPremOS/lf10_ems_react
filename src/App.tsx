import './App.css'
import {Route, Routes, Navigate} from "react-router-dom";
import {UnsecuredFoo} from "./pages/UnsecuredFoo.tsx";
import {SecuredBar} from "./pages/SecuredBar.tsx";
import RequireAuth from "./auth/RequireAuth.tsx";
import {EmployeeTable} from "./pages/EmployeeTable.tsx";
import {EmployeeDetails} from "./pages/EmployeeDetails.tsx";
import {EmployeeAdd} from "./pages/EmployeeAdd.tsx";
import {EmployeeEdit} from "./pages/EmployeeEdit.tsx";

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
            <Route path="/employees/new" element={<EmployeeAdd/>}/>
            <Route path="/employees/:id" element={<EmployeeDetails/>}/>
            <Route path="/employees/:id/edit" element={<EmployeeEdit/>}/>
        </Routes>
    )
}

export default App