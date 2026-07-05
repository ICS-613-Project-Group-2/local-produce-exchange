import "./StatusBadge.css";

type BadgeStatus =
  | "available"
  | "reserved"
  | "expiring-soon"
  | "closed"
  | "pending"
  | "completed"
  | "canceled"
  | "error"
  | "public"
  | "private";

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  className?: string;
}

const defaultLabels: Record<BadgeStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  "expiring-soon": "Expiring Soon",
  closed: "Closed",
  pending: "Pending",
  completed: "Completed",
  canceled: "Canceled",
  error: "Error",
  public: "Public",
  private: "Private",
};

export default function StatusBadge({
  status,
  label,
  className = "",
}: StatusBadgeProps) {
  return (
    <span className={`badge badge--${status} ${className}`}>
      {label || defaultLabels[status]}
    </span>
  );
}
