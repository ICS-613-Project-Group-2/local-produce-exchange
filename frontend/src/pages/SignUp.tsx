import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import FormField, { Input } from "../components/ui/FormField";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import "./AuthPages.css";

interface FormData {
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

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

export default function SignUp() {
  const { register } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
    } else if (!/^[A-Za-z0-9_-]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, hyphens, and underscores.";
    }
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    try {
      await register(formData.username, formData.email, formData.password);
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSubmitError("An account with this email already exists.");
      } else if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Something went wrong while creating your account. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-page__layout">
          <div className="auth-page__form-side">
            <div className="auth-page__card">
              <div className="auth-page__success">
                <h1>Account Created! 🎉</h1>
                <p>Welcome to Green Beans, {formData.name}. You can now browse listings, join communities, and share produce.</p>
                <Link to="/browse">
                  <Button variant="primary">Start Browsing</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-page__layout">
        {/* Form Side */}
        <div className="auth-page__form-side">
          <div className="auth-page__card">
            <div className="auth-page__brand">
              <span className="auth-page__brand-icon">🌱</span>
              <span className="auth-page__brand-name">Green Beans</span>
            </div>

            <div className="auth-page__header">
              <h1>Create your account</h1>
              <p>Join 500+ members sharing food locally</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-page__form">
              <FormField label="Username" htmlFor="username" required error={errors.username} helperText="Letters, numbers, hyphens, and underscores only.">
                <Input
                  id="username"
                  name="username"
                  placeholder="e.g., lily_chen"
                  value={formData.username}
                  onChange={handleChange}
                  hasError={!!errors.username}
                />
              </FormField>

              <FormField label="Display Name" htmlFor="name" required error={errors.name}>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  hasError={!!errors.name}
                />
              </FormField>

              <FormField label="Email" htmlFor="email" required error={errors.email}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  hasError={!!errors.email}
                />
              </FormField>

              <FormField label="Password" htmlFor="password" required error={errors.password}>
                <div className="auth-page__password-wrapper">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
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

              <FormField label="Confirm Password" htmlFor="confirmPassword" required error={errors.confirmPassword}>
                <div className="auth-page__password-wrapper">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
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
                Create Account
              </Button>
            </form>

            <p className="auth-page__footer">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>

        {/* Image Side */}
        <div className="auth-page__image-side">
          <div className="auth-page__image-content">
            <h2>Share fresh food with your community</h2>
            <p>Post surplus produce, browse listings, join local groups, and reduce food waste together.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
