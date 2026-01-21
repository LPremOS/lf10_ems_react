import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}