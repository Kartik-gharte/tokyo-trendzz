import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("tokyo_trendz_token");

    const fetchNotifications = async () => {
        if (!token) {
            return;
        }

        try {
            const response = await fetch(
                "/api/notifications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error(
                "Fetch notifications error:",
                error
            );
        }
    };

    const fetchUnreadCount = async () => {
        if (!token) {
            return;
        }

        try {
            const response = await fetch(
                "/api/notifications/unread-count",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error(
                "Fetch unread count error:",
                error
            );
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, []);

    const handleNotificationClick = async (notification) => {
        if (notification.is_read === 1) {
            return;
        }

        try {
            const response = await fetch(
                `/api/notifications/${notification.id}/read`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setNotifications((previous) =>
                    previous.map((item) =>
                        item.id === notification.id
                            ? {
                                  ...item,
                                  is_read: 1
                              }
                            : item
                    )
                );

                setUnreadCount((previous) =>
                    Math.max(previous - 1, 0)
                );
            }
        } catch (error) {
            console.error(
                "Mark notification as read error:",
                error
            );
        }
    };

    const toggleNotifications = async () => {
        const nextState = !showNotifications;

        setShowNotifications(nextState);

        if (nextState) {
            setLoading(true);

            await fetchNotifications();
            await fetchUnreadCount();

            setLoading(false);
        }
    };

    if (!token) {
        return null;
    }

    return (
        <div className="notification-wrapper">
            <button
                className="notification-bell"
                onClick={toggleNotifications}
                aria-label="Notifications"
            >
                <Bell size={21} />

                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>

                        {unreadCount > 0 && (
                            <span>
                                {unreadCount} unread
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="notification-empty">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="notification-empty">
                            No notifications
                        </div>
                    ) : (
                        <div className="notification-list">
                            {notifications.map(
                                (notification) => (
                                    <button
                                        key={
                                            notification.id
                                        }
                                        className={`notification-item ${
                                            notification.is_read ===
                                            0
                                                ? "unread"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification
                                            )
                                        }
                                    >
                                        <div className="notification-item-title">
                                            {
                                                notification.title
                                            }
                                        </div>

                                        <div className="notification-item-message">
                                            {
                                                notification.message
                                            }
                                        </div>

                                        <div className="notification-item-date">
                                            {new Date(
                                                notification.created_at
                                            ).toLocaleString()}
                                        </div>
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;