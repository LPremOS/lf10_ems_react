import './App.css'
import {Route, Routes, Navigate} from "react-router-dom";
import {EmployeeTable} from "./pages/EmployeeTable.tsx";
import Dashboard from './pages/Dashboard';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { QualificationsOverview } from './pages/QualificationsOverview.tsx';
import { useAuth } from 'react-oidc-context';
import { Login } from './pages/Login.tsx';
import { Callback } from './pages/Callback.tsx';
import { Loader } from './components/common/Loader.tsx';
import { EmployeeAdd } from './pages/EmployeeAdd.tsx';
import { EmployeeEdit } from './pages/EmployeeEdit.tsx';
import { EmployeeDetails } from './pages/EmployeeDetails.tsx';

function App() {
    const auth = useAuth();

    if(auth.isLoading) {
        return(
            <Loader />
        )
    }
    
    return (
        <Routes>
            <Route path="/callback" element={<Callback />} />

            {!auth.isAuthenticated && (
                <Route path="*" element={<Login />} />
            )}

            {auth.isAuthenticated && ( 
                <>
                    <Route path="/" element={<Navigate to="/dashboard" replace />}/>
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="/employees" element={<EmployeeTable/>}/>
                        <Route path="/employees/new" element={<EmployeeAdd/>}/>
                        <Route path="/employees/:id" element={<EmployeeDetails/>}/>
                        <Route path="/employees/:id/edit" element={<EmployeeEdit/>}/>
                        <Route path="/qualifications" element={<QualificationsOverview/>} />
                    </Route>
                </>
            )}
        </Routes>
    )
}

export default App