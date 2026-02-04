import type { Employee } from "../../types/Employee";

export const EMPLOYEES_URL = "http://localhost:8089/employees";
export const QUALIFICATIONS_URL = "http://localhost:8089/qualifications";

export interface QualificationApiItem {
    id: number;
    skill: string;
}

export interface EmployeeApiPayload {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    street?: string;
    postcode?: string;
    skillSet?: number[];
}

export interface EmployeeApiResponse {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    street: string;
    postcode: string;
    skillSet?: QualificationApiItem[];
}

export function toEmployeeApiPayload(
    employee: Partial<Employee>,
    qualificationBySkill: Map<string, number>,
): EmployeeApiPayload {
    const payload: EmployeeApiPayload = {};

    if (employee.vorname !== undefined) payload.firstName = employee.vorname;
    if (employee.nachname !== undefined) payload.lastName = employee.nachname;
    if (employee.telefonnummer !== undefined) payload.phone = employee.telefonnummer;
    if (employee.standort !== undefined) payload.city = employee.standort;
    if (employee.street !== undefined) payload.street = employee.street;
    if (employee.postcode !== undefined) payload.postcode = employee.postcode;

    if (employee.qualifikationen !== undefined) {
        payload.skillSet = employee.qualifikationen
            .map((skill) => qualificationBySkill.get(skill))
            .filter((id): id is number => typeof id === "number");
    }

    return payload;
}

export function fromEmployeeApiResponse(apiEmployee: EmployeeApiResponse): Employee {
    return {
        id: String(apiEmployee.id),
        vorname: apiEmployee.firstName ?? "",
        nachname: apiEmployee.lastName ?? "",
        telefonnummer: apiEmployee.phone ?? "",
        standort: apiEmployee.city ?? "",
        street: apiEmployee.street ?? "",
        postcode: apiEmployee.postcode ?? "",
        qualifikationen: (apiEmployee.skillSet ?? []).map((qualification) => qualification.skill),
    };
}
