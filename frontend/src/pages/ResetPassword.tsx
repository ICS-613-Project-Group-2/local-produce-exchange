import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import FormField, { Input } from "../components/ui/FormField";
import "./AuthPages.css";

export default function ResetPassword() {
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

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
        <Card>
          <CardBody>
            <div className="auth-page__success">
              <h1>Password Updated ✅</h1>
              <p>Your password has been successfully reset. You can now log in with your new credentials.</p>
              <Link to="/login">
                <Button variant="primary">Go to Login</Button>
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
            <h1>Create new password</h1>
            <p>Enter and confirm your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-page__form">
            <FormField label="New Password" htmlFor="password" required error={errors.password} helperText="Must be at least 8 characters.">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                hasError={!!errors.password}
              />
            </FormField>

            <FormField label="Confirm New Password" htmlFor="confirmPassword" required error={errors.confirmPassword}>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                hasError={!!errors.confirmPassword}
              />
            </FormField>

            <Button variant="primary" type="submit" size="lg">
              Update Password
            </Button>
          </form>

          <p className="auth-page__footer">
            <Link to="/login">Back to Login</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
