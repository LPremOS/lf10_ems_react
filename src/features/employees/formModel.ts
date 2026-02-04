import type { Employee } from "../../types/Employee";

// Formularmodell fuer Create/Edit (ohne ID, da diese vom Backend stammt).
export type EmployeeFormData = Omit<Employee, "id">;
// Alle klassischen Textfelder im Formular (ohne Qualifikationsliste).
export type EmployeeFormFieldName = Exclude<keyof EmployeeFormData, "qualifikationen">;
// Fehlerobjekt: pro Feld optional eine Fehlermeldung.
export type EmployeeFormErrors = Partial<Record<EmployeeFormFieldName, string>>;

// Liste fuer Feld-zu-Feld Vergleich in areEmployeeFormDataEqual.
const BASIC_FORM_FIELDS: EmployeeFormFieldName[] = [
    "vorname",
    "nachname",
    "telefonnummer",
    "standort",
    "street",
    "postcode",
];

// Validierungsregeln fuer einfache Formularpruefungen.
export const POSTCODE_PATTERN = /^[0-9]{5}$/;
export const PHONE_PATTERN = /^[0-9+()\-/\s]{6,20}$/;

export function createEmployeeFormData(initialData?: EmployeeFormData | null): EmployeeFormData {
    // Liefert immer ein vollstaendiges Objekt, damit Inputs "controlled" bleiben.
    return {
        vorname: initialData?.vorname ?? "",
        nachname: initialData?.nachname ?? "",
        telefonnummer: initialData?.telefonnummer ?? "",
        standort: initialData?.standort ?? "",
        street: initialData?.street ?? "",
        postcode: initialData?.postcode ?? "",
        qualifikationen: initialData?.qualifikationen ?? [],
    };
}

export function toEmployeeFormData(employee: Employee): EmployeeFormData {
    // Hilfsfunktion fuer Edit: API-Modell -> Form-Modell.
    return {
        vorname: employee.vorname,
        nachname: employee.nachname,
        telefonnummer: employee.telefonnummer,
        standort: employee.standort,
        street: employee.street,
        postcode: employee.postcode,
        qualifikationen: employee.qualifikationen,
    };
}

export function validateEmployeeForm(data: EmployeeFormData): EmployeeFormErrors {
    // Nur die fachlich benoetigten Pflicht-/Formatpruefungen.
    const errors: EmployeeFormErrors = {};

    if (!data.vorname.trim()) errors.vorname = "Bitte geben Sie einen Vornamen ein.";
    if (!data.nachname.trim()) errors.nachname = "Bitte geben Sie einen Nachnamen ein.";
    if (!data.standort.trim()) errors.standort = "Bitte geben Sie einen Ort ein.";
    if (!data.street.trim()) errors.street = "Bitte geben Sie eine Straße ein.";
    if (!POSTCODE_PATTERN.test(data.postcode.trim())) errors.postcode = "Bitte geben Sie eine 5-stellige PLZ ein.";
    if (!PHONE_PATTERN.test(data.telefonnummer.trim())) errors.telefonnummer = "Bitte geben Sie eine gültige Telefonnummer ein.";

    return errors;
}

export function areEmployeeFormDataEqual(left: EmployeeFormData, right: EmployeeFormData): boolean {
    // Vergleich der Standardfelder.
    const hasSameFieldValues = BASIC_FORM_FIELDS.every((field) => left[field] === right[field]);
    if (!hasSameFieldValues) {
        return false;
    }

    if (left.qualifikationen.length !== right.qualifikationen.length) {
        return false;
    }

    // Reihenfolge bleibt bewusst Teil des Vergleichs (wie im aktuellen UI-Verhalten).
    return left.qualifikationen.every((qualification, index) => qualification === right.qualifikationen[index]);
}
