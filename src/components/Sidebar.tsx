import { AiOutlineHome } from 'react-icons/ai';
import { FiUsers, FiLogOut } from 'react-icons/fi';
import { PiMedalBold } from "react-icons/pi";
import './Sidebar.css';

export function Sidebar() {
  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <a href="#" className="sidebar-item">
          <AiOutlineHome className="sidebar-icon" />
          <span>Dashboard</span>
        </a>
        <a href="#" className="sidebar-item sidebar-item-active">
          <FiUsers className="sidebar-icon" />
          <span>Mitarbeiter</span>
        </a>
        <a href="#" className="sidebar-item">
          <PiMedalBold className="sidebar-icon" />
          <span>Qualifikationen</span>
        </a>
      </nav>
      <div className="sidebar-footer">
        <a href="#" className="sidebar-logout">
          <FiLogOut className="sidebar-icon" />
          <span>Logout</span>
        </a>
      </div>
    </div>
  );
}
