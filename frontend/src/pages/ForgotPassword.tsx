import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import FormField, { Input } from "../components/ui/FormField";
import "./AuthPages.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="auth-page">
        <Card>
          <CardBody>
            <div className="auth-page__success">
              <h1>Check your email 📧</h1>
              <p>If an account exists for {email}, we've sent a password reset link. Check your inbox and follow the instructions.</p>
              <Link to="/login">
                <Button variant="outline">Back to Login</Button>
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
            <h1>Reset your password</h1>
            <p>Enter the email address associated with your account and we'll send you a link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-page__form">
            <FormField label="Email" htmlFor="email" required error={error}>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                hasError={!!error}
              />
            </FormField>

            <Button variant="primary" type="submit" size="lg">
              Send Reset Link
            </Button>
          </form>

          <p className="auth-page__footer">
            Remember your password? <Link to="/login">Log in</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
