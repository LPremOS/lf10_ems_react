import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import type { Employee } from "../../types/Employee"

type EmployeeTableRowProps = {
    employee:Employee;
    onView:(id:string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string, vorname: string, nachname: string) => void;
}

export function EmployeeTableRow({
    employee,
    onView,
    onEdit,
    onDelete,
}: EmployeeTableRowProps) {
    return(
        <tr key={employee.id}>
            <td>{employee.vorname}</td>
            <td>{employee.nachname}</td>
            <td>{employee.standort}</td>
            <td>
                <div className="qualifications">
                    {employee.qualifikationen.length > 0 ? (
                        employee.qualifikationen.map((qualification) => (
                            <span key={qualification} className="qualification-badge">
                                {qualification}
                            </span>
                        ))
                    ) : (
                        <span className="text-muted">Keine Qualifikationen</span>
                    )}
                </div>
            </td>
            <td>
                <div className="action-buttons">
                    <button
                        className="action-btn"
                        onClick={() => onView(employee.id)}
                        title="Mitarbeiter ansehen"
                    >
                        <AiOutlineEye />
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => onEdit(employee.id)}
                        title="Mitarbeiter bearbeiten"
                    >
                        <AiOutlineEdit />
                    </button>
                    <button
                        className="action-btn action-btn-delete"
                        title="Mitarbeiter löschen"
                        onClick={() => onDelete(employee.id, employee.vorname, employee.nachname)}
                    >
                        <AiOutlineDelete />
                    </button>
                </div>
            </td>
        </tr>
    )
}