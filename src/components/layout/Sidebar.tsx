import {NavLink} from "react-router-dom";
import {FiLogOut, FiMenu} from "react-icons/fi";
import {SidebarItems, type SidebarItem} from "./sidebarItems";
import "../../styles/Sidebar.css";

type SidebarProps = {
    items?: SidebarItem[];
    isCollapsed: boolean;
    onToggle: () => void;
    onLogout: () => void;
    appName?: string;

    isMobileOpen: boolean;
    onCloseMobile: () => void;
};

export function Sidebar({
    items = SidebarItems,
    isCollapsed,
    onToggle,
    onLogout,
    appName = "HiTec EMS",
    isMobileOpen,
    onCloseMobile,
}: SidebarProps) {
    return (
        <aside className={`sidebar ${isCollapsed ? "is-collapsed" : ""} ${isMobileOpen ? "is-mobile-open" : ""}`}>
        <div className="sidebar__header">
                <button type="button" className="sidebar__toggle" onClick={onToggle}>
                    <FiMenu />
                </button>
                {!isCollapsed && <span className="sidebar__title">{appName}</span>}
            </div>

            <nav className="sidebar__nav" aria-label="Navigation">
                {items.map((item) => (
                    <NavLink
                        key={item.key}
                        to={item.to}
                        end={item.end !== false} // Verwende item.end, default ist true wenn nicht angegeben
                        className={({isActive}) => `sidebar__link ${isActive ? "is-active" : ""}`}
                        title={isCollapsed ? item.label : undefined}
                        onClick={onCloseMobile}
                    >
                        <span className="sidebar__icon" aria-hidden="true">{item.icon}</span>
                        {!isCollapsed && <span className="sidebar__label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar__footer">
                <button
                    type="button"
                    className="sidebar__logout"
                    onClick={() => {
                        onCloseMobile();
                        onLogout();
                    }}
                >
                    <span className="sidebar__icon" aria-hidden="true">
                        <FiLogOut />
                    </span>
                    {!isCollapsed && <span className="sidebar__label">Abmelden</span>}
                </button>
            </div>
        </aside>
    );
}
