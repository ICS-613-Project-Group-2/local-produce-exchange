import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import FormField, { Input } from "../components/ui/FormField";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import "./AuthPages.css";

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      await login(formData.email, formData.password);
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setSubmitError("Incorrect email or password.");
      } else if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Something went wrong while logging in. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="auth-page">
        <Card>
          <CardBody>
            <div className="auth-page__success">
              <h1>Welcome back! 🌱</h1>
              <p>You're now logged in. Head to your dashboard or start browsing listings.</p>
              <Link to="/dashboard">
                <Button variant="primary">Go to Dashboard</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Card>
        <CardBody>
          <div className="auth-page__header">
            <h1>Welcome back to Green Beans</h1>
            <p>Sign in to share produce, view messages, and manage your community exchanges.</p>
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
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                hasError={!!errors.password}
              />
            </FormField>

            <div className="auth-page__links">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            {submitError && (
              <p className="auth-page__submit-error" role="alert">
                {submitError}
              </p>
            )}

            <Button variant="primary" type="submit" size="lg" disabled={submitting}>
              {submitting ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <p className="auth-page__footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
