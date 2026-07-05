import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import FormField, { Input } from "../components/ui/FormField";
import "./AuthPages.css";

interface FormData {
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

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
              <h1>Account Created! 🎉</h1>
              <p>Welcome to Green Beans, {formData.name}. You can now browse listings, join communities, and share produce.</p>
              <Link to="/browse">
                <Button variant="primary">Start Browsing</Button>
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
            <h1>Create your Green Beans account</h1>
            <p>Sign up to share produce, browse local food listings, and connect with your community.</p>
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

            <FormField label="Name" htmlFor="name" required error={errors.name}>
              <Input
                id="name"
                name="name"
                placeholder="Your display name"
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

            <FormField label="Password" htmlFor="password" required error={errors.password} helperText="Must be at least 8 characters.">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                hasError={!!errors.password}
              />
            </FormField>

            <FormField label="Confirm Password" htmlFor="confirmPassword" required error={errors.confirmPassword}>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                hasError={!!errors.confirmPassword}
              />
            </FormField>

            <Button variant="primary" type="submit" size="lg">
              Create Account
            </Button>
          </form>

          <p className="auth-page__footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
