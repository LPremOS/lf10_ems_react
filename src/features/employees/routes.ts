// Zentrale Sammlung aller Mitarbeiter-Routen.
// Vorteil: Route-Pfade stehen nur an einer Stelle und bleiben konsistent.
export const EMPLOYEE_ROUTES = {
    // Uebersichtsseite (Liste aller Mitarbeiter).
    overview: "/employees",
    // Seite zum Anlegen eines neuen Mitarbeiters.
    create: "/employees/new",
    // React-Router Pattern fuer die Detailansicht.
    detailsPattern: "/employees/:id",
    // React-Router Pattern fuer die Bearbeitungsansicht.
    editPattern: "/employees/:id/edit",
    // Helfer zum Erzeugen konkreter Detail-URLs.
    details: (id: string) => `/employees/${id}`,
    // Helfer zum Erzeugen konkreter Edit-URLs.
    edit: (id: string) => `/employees/${id}/edit`,
} as const;
