import { useParams } from "react-router-dom";
import { useEmployeeApi } from "../hooks/useEmployeeApi";
import { useEmployeeRecord } from "../hooks/useEmployeeRecord";
import { EmployeeDetailsView } from "./EmployeeDetailsView";

export function EmployeeDetails() {
    const { id } = useParams<{ id: string }>();
    const { fetchEmployeeById, loading, error } = useEmployeeApi();
    const employee = useEmployeeRecord(id, fetchEmployeeById);

    return <EmployeeDetailsView employee={employee} loading={loading} error={error} />;
}
