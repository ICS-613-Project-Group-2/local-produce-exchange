import "./FormField.css";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({
  label,
  htmlFor,
  helperText,
  error,
  required = false,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`form-field ${error ? "form-field--error" : ""} ${className}`}>
      <label htmlFor={htmlFor} className="form-field__label">
        {label}
        {required && <span className="form-field__required" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="form-field__helper">{helperText}</p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function Input({ hasError, className = "", ...props }: InputProps) {
  return (
    <input
      className={`form-field__input ${hasError ? "form-field__input--error" : ""} ${className}`}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function Textarea({ hasError, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`form-field__textarea ${hasError ? "form-field__input--error" : ""} ${className}`}
      {...props}
    />
  );
}
