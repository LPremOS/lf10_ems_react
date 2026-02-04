export const EMPLOYEE_ROUTES = {
    overview: "/employees",
    create: "/employees/new",
    detailsPattern: "/employees/:id",
    editPattern: "/employees/:id/edit",
    details: (id: string) => `/employees/${id}`,
    edit: (id: string) => `/employees/${id}/edit`,
} as const;
