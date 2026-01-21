import './App.css'
import {Route, Routes, Navigate} from "react-router-dom";
import {UnsecuredFoo} from "./pages/UnsecuredFoo.tsx";
import RequireAuth from "./auth/RequireAuth.tsx";
import {EmployeeTable} from "./pages/EmployeeTable.tsx";
import Dashboard from './pages/Dashboard';
import { Layout } from './components/Layout';
import {SecuredBar} from "./pages/SecuredBar.tsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />}/>
            <Route path="/dashboard" element={<Layout><Dashboard/></Layout>}/>
            <Route path="/foo" element={<Layout><UnsecuredFoo/></Layout>}/>
            <Route path="/bar" element={
                <Layout>
                  <RequireAuth>
                      <SecuredBar/>
                  </RequireAuth>
                </Layout>
            }/>
            <Route path="/employees" element={<Layout><EmployeeTable/></Layout>}/>
        </Routes>
    )
}

export default App