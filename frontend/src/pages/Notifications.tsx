import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import EmptyState from "../components/feedback/EmptyState";
import { mockNotifications } from "../data/mockData";
import type { Notification } from "../data/types";
import "./Notifications.css";

const CURRENT_USER_ID = 1;

type FilterTab = "all" | "message" | "claim" | "community" | "listing";

const TYPE_ICONS: Record<string, string> = {
  message: "💬",
  claim: "📦",
  community: "🏘️",
  listing: "🧺",
};

export default function Notifications() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [notifications, setNotifications] = useState<Notification[]>(
    mockNotifications.filter((n) => n.user_id === CURRENT_USER_ID)
  );

  const filteredNotifications = activeFilter === "all"
    ? notifications
    : notifications.filter((n) => n.type === activeFilter);

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  function handleMarkRead(id: number) {
    setNotifications((prev) =>
      prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n))
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filters: { value: FilterTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "message", label: "Messages" },
    { value: "claim", label: "Claims" },
    { value: "community", label: "Communities" },
    { value: "listing", label: "Listings" },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Notifications"
        subtitle="Review recent updates about your listings, communities, and exchanges"
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      <div className="notifications__filters">
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`notifications__filter ${activeFilter === filter.value ? "notifications__filter--active" : ""}`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<span>🔔</span>}
          title="No notifications yet"
          description="Updates about your listings, messages, community requests, and exchanges will appear here."
        />
      ) : (
        <div className="notifications__list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`notifications__item ${!notification.is_read ? "notifications__item--unread" : ""}`}
              onClick={() => handleMarkRead(notification.notification_id)}
            >
              <span className="notifications__icon">{TYPE_ICONS[notification.type] || "🔔"}</span>
              <div className="notifications__content">
                <p className="notifications__text">{notification.content}</p>
                <span className="notifications__time">
                  {new Date(notification.timestamp).toLocaleDateString()} · {new Date(notification.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {!notification.is_read && <span className="notifications__unread-dot" aria-label="Unread" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
