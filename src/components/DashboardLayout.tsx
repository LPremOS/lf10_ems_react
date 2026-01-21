import React from "react";
import "./DashboardLayout.css";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="dashboard-page">
    {children}
  </div>
);

export default DashboardLayout;
