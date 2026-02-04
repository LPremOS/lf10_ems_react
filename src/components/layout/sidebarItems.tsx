import {FiAward, FiHome, FiUsers} from "react-icons/fi";
import type {ReactNode} from "react";

export type SidebarItem = {
    key: "dashboard" | "employees" | "qualifications";
    label: string;
    to: string;
    icon: ReactNode;
    end?: boolean; // Optional: ob die Route exact matching verwenden soll
};

export const SidebarItems: SidebarItem[] = [
    {key: "dashboard", label: "Dashboard", to: "/dashboard", icon: <FiHome/>, end: true},
    {key: "employees", label: "Mitarbeiter", to: "/employees", icon: <FiUsers/>, end: false}, // Bleibt aktiv für /employees/*
    {key: "qualifications", label: "Qualifikationen", to: "/qualifications", icon: <FiAward/>, end: false}, // Bleibt aktiv für /qualifications/*
];
