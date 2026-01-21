import './App.css'
import {Container, Nav, Navbar} from "react-bootstrap";
import {Link, Route, Routes} from "react-router-dom";
import {UnsecuredFoo} from "./pages/UnsecuredFoo.tsx";
import {SecuredBar} from "./pages/SecuredBar.tsx";
import {Home} from "./pages/Home.tsx";
import RequireAuth from "./auth/RequireAuth.tsx";
import {EmployeeTable} from "./pages/EmployeeTable.tsx";

function App() {


    return (
        <Container>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand href="/">React-Bootstrap</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/foo">Foo</Nav.Link>
                            <Nav.Link as={Link} to="/bar">Bar</Nav.Link>
                            <Nav.Link as={Link} to="/employees">Mitarbeiter</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/foo" element={<UnsecuredFoo/>}/>
                <Route path="/bar" element={
                    <RequireAuth>
                        <SecuredBar/>
                    </RequireAuth>
                }/>
                <Route path="/employees" element={
                    <RequireAuth>
                        <EmployeeTable/>
                    </RequireAuth>
                }/>
            </Routes>
        </Container>
    )
}

export default App
