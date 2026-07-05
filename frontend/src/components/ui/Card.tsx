import "./Card.css";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "warm";
  padding?: "sm" | "md" | "lg";
  className?: string;
}

export default function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
}: CardProps) {
  return (
    <div className={`card card--${variant} card--pad-${padding} ${className}`}>
      {children}
    </div>
  );
}

interface CardImageProps {
  src: string;
  alt: string;
  aspectRatio?: "4/3" | "16/9" | "1/1";
}

export function CardImage({ src, alt, aspectRatio = "4/3" }: CardImageProps) {
  return (
    <div className="card__image" style={{ aspectRatio }}>
      <img src={src} alt={alt} />
    </div>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
}

export function CardBody({ children }: CardBodyProps) {
  return <div className="card__body">{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
}

export function CardFooter({ children }: CardFooterProps) {
  return <div className="card__footer">{children}</div>;
}
