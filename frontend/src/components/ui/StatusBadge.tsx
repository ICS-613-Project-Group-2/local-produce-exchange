import "./StatusBadge.css";

export type BadgeStatus =
  | "available"
  | "reserved"
  | "expiring-soon"
  | "picked-up"
  | "closed"
  | "pending"
  | "completed"
  | "canceled"
  | "approved"
  | "denied"
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
  "picked-up": "Picked Up",
  closed: "Closed",
  pending: "Pending",
  completed: "Completed",
  canceled: "Canceled",
  approved: "Approved",
  denied: "Denied",
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
