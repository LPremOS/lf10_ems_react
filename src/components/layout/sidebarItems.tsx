import {FiAward, FiHome, FiUsers} from "react-icons/fi";
import type {ReactNode} from "react";

export type SidebarItem = {
    key: "dashboard" | "employees" | "qualifications";
    label: string;
    to: string;
    icon: ReactNode;
};

export const sidebarItems: SidebarItem[] = [
    {key: "dashboard", label: "Dashboard", to: "/dashboard", icon: <FiHome/>},
    {key: "employees", label: "Mitarbeiter", to: "/employees", icon: <FiUsers/>},
    {key: "qualifications", label: "Qualifikationen", to: "/qualifications", icon: <FiAward/>},
];
