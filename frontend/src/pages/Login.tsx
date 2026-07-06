import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import FormField, { Input } from "../components/ui/FormField";
import "./AuthPages.css";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate(): Record<string, string> {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
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
                <h1>Welcome back! 🌱</h1>
                <p>You're now logged in. Head to your dashboard or start browsing listings.</p>
                <Link to="/dashboard">
                  <Button variant="primary">Go to Dashboard</Button>
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
              <h1>Welcome back</h1>
              <p>Sign in to manage your listings and community exchanges</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-page__form">
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
                    placeholder="Enter your password"
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
              </FormField>

              <div className="auth-page__links">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <Button variant="primary" type="submit" size="lg">
                Log In
              </Button>
            </form>

            <p className="auth-page__footer">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>

        {/* Image Side */}
        <div className="auth-page__image-side">
          <div className="auth-page__image-content">
            <h2>Fresh food, local community</h2>
            <p>Browse listings, message owners, and coordinate exchanges — all in one place.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
