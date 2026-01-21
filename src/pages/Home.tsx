import {Container} from "react-bootstrap";
import React from "react";
import DashboardCards from "../components/DashboardCards";


export function Home() {
    return (
        <Container>
            <h1>Dashboard</h1>
            <p>Bitte navigieren Sie über die Menüleiste zu den verschiedenen Seiten.</p>
            <p>Foo sollte ohne Login sichtbar sein, bei Klick auf Bar müsste ein Login erscheinen.</p>
       <DashboardCards employeecount={100} qualificationscount={5}/>
        </Container>
    );    
}