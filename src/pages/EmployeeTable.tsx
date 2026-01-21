import {Button, Container, Table} from "react-bootstrap";
import {useEmployeeApi} from "../hooks/useEmployeeApi.ts";
import {useState} from "react";

export function EmployeeTable() {

    const {fetchEmployees, loading, error} = useEmployeeApi();
    const [employees, setEmployees] = useState([]);

    const handleLoadEmployees = () => {
        fetchEmployees().then(data => setEmployees(data)).catch(err => console.error(err));
    }

    if (loading) {
        return <div>Lade Mitarbeiter...</div>;
    }

    if (error) {
        return <div> {error}</div>;
    }

    console.log(employees);

    return (
        <Container>
            <Button onClick={handleLoadEmployees}>
                Mitarbeiter laden
            </Button>
            <Table>
                <thead>
                <tr>
                    <th>Vorname</th>
                    <th>Nachname</th>
                </tr>
                </thead>
                <tbody>
                {employees.map((employee, index) => (
                    <tr key={index}>
                        <td>{employee.firstName}</td>
                        <td>{employee.lastName}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </Container>
    )
}