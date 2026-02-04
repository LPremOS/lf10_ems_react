import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import "./NotificationProvider.css";

type NotificationTone = "success" | "error" | "info";

type NotificationInput = {
    tone: NotificationTone;
    title: string;
    message?: string;
    durationMs?: number;
};

type NotificationItem = NotificationInput & {
    id: number;
};

type NotificationContextValue = {
    notify: (notification: NotificationInput) => void;
};

const DEFAULT_DURATION_MS = 4500;
const NotificationContext = createContext<NotificationContextValue | null>(null);

function getToneIcon(tone: NotificationTone) {
    if (tone === "success") return <FiCheckCircle />;
    if (tone === "error") return <FiAlertCircle />;
    return <FiInfo />;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const idRef = useRef(0);

    const removeNotification = useCallback((id: number) => {
        setNotifications((current) => current.filter((item) => item.id !== id));
    }, []);

    const notify = useCallback((notification: NotificationInput) => {
        const id = ++idRef.current;
        const duration = notification.durationMs ?? DEFAULT_DURATION_MS;
        const item: NotificationItem = { ...notification, id };

        setNotifications((current) => [...current, item]);

        if (duration > 0) {
            window.setTimeout(() => {
                setNotifications((current) => current.filter((entry) => entry.id !== id));
            }, duration);
        }
    }, []);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className="notification-container" aria-live="polite" aria-atomic="true">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`notification notification-${notification.tone}`}
                        role={notification.tone === "error" ? "alert" : "status"}
                    >
                        <div className="notification-icon">{getToneIcon(notification.tone)}</div>
                        <div className="notification-content">
                            <strong>{notification.title}</strong>
                            {notification.message && <p>{notification.message}</p>}
                        </div>
                        <button
                            type="button"
                            className="notification-close"
                            onClick={() => removeNotification(notification.id)}
                            aria-label="Hinweis schließen"
                        >
                            <FiX />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification muss innerhalb von NotificationProvider verwendet werden.");
    }
    return context;
}
