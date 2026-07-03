import "./Button.css";

type ButtonVariant = "primary" | "secondary" | "accent" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : null}
      <span className={loading ? "btn__text--loading" : ""}>{children}</span>
    </button>
  );
}
