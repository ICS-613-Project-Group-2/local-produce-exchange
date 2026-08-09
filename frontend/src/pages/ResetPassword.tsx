import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import FormField, { Input } from "../components/ui/FormField";
import "./AuthPages.css";

function getPasswordStrength(password: string): { level: number; label: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: "Weak" };
  if (score <= 2) return { level: 2, label: "Fair" };
  if (score <= 3) return { level: 3, label: "Good" };
  return { level: 4, label: "Strong" };
}

export default function ResetPassword() {
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate(): Record<string, string> {
    const newErrors: Record<string, string> = {};
    if (!formData.password) {
      newErrors.password = "New password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    return newErrors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-page__layout">
          <div className="auth-page__form-side">
            <div className="auth-page__card">
              <div className="auth-page__success">
                <h1>Password Updated ✅</h1>
                <p>Your password has been successfully reset. You can now log in with your new credentials.</p>
                <Link to="/login">
                  <Button variant="primary">Go to Login</Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="auth-page__image-side">
            <div className="auth-page__image-content">
              <h2>You're all set</h2>
              <p>Log in with your new password and get back to sharing food with your community.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-page__layout">
        <div className="auth-page__form-side">
          <div className="auth-page__card">
            <div className="auth-page__brand">
              <span className="auth-page__brand-icon">🌱</span>
              <span className="auth-page__brand-name">Green Beans</span>
            </div>

            <div className="auth-page__header">
              <h1>Create new password</h1>
              <p>Enter and confirm your new password below.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-page__form">
              <FormField label="New Password" htmlFor="password" required error={errors.password}>
                <div className="auth-page__password-wrapper">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleChange}
                    hasError={!!errors.password}
                  />
                  <button
                    type="button"
                    className="auth-page__toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {formData.password && (
                  <div className="auth-page__strength">
                    <div className="auth-page__strength-bar">
                      <div
                        className={`auth-page__strength-fill auth-page__strength-fill--${passwordStrength.level}`}
                        style={{ width: `${passwordStrength.level * 25}%` }}
                      />
                    </div>
                    <span className={`auth-page__strength-label auth-page__strength-label--${passwordStrength.level}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </FormField>

              <FormField label="Confirm New Password" htmlFor="confirmPassword" required error={errors.confirmPassword}>
                <div className="auth-page__password-wrapper">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    hasError={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    className="auth-page__toggle-password"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </FormField>

              <Button variant="primary" type="submit" size="lg">
                Update Password
              </Button>
            </form>

            <p className="auth-page__footer">
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>

        <div className="auth-page__image-side">
          <div className="auth-page__image-content">
            <h2>Almost there</h2>
            <p>Choose a strong password to keep your account secure.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
