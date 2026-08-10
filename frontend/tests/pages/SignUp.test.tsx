import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '@/context/AuthContext';
import { clearToken } from '@/lib/api';
import SignUp from '@/pages/SignUp';

const API_URL = 'http://127.0.0.1:8000';

function renderSignUp() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <SignUp />
      </AuthProvider>
    </MemoryRouter>
  );
}

// Fills out every field with valid values, unless overridden
async function fillForm(overrides: Partial<Record<'username' | 'name' | 'email' | 'password' | 'confirmPassword', string>> = {}) {
  const values = {
    username: 'lily_chen',
    name: 'Lily Chen',
    email: 'lily@example.com',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
    ...overrides,
  };

  if (values.username) await userEvent.type(screen.getByLabelText(/^username/i), values.username);
  if (values.name) await userEvent.type(screen.getByLabelText(/^display name/i), values.name);
  if (values.email) await userEvent.type(screen.getByLabelText(/^email/i), values.email);
  if (values.password) await userEvent.type(screen.getByLabelText(/^password/i), values.password);
  if (values.confirmPassword) {
    await userEvent.type(screen.getByLabelText(/^confirm password/i), values.confirmPassword);
  }
}

function submitButton() {
  // Regex, not an exact string: the label becomes "Creating Account…" while submitting.
  return screen.getByRole('button', { name: /Create Account/ });
}

describe('SignUp', () => {                                               // Test Suite

  beforeEach(() => {                                                     // Test Fixture (setup)
    clearToken();
  });

  afterEach(() => {                                                      // Test Fixture (teardown)
    clearToken();
  });

  it('must render all form fields', () => {                             // Test Case
    renderSignUp();

    expect(screen.getByLabelText(/^username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password/i)).toBeInTheDocument();
  });

  describe('validation', () => {                                        // Nested Test Suite

    it('must show validation errors when submitting an empty form', async () => {
      renderSignUp();

      await userEvent.click(submitButton());

      expect(screen.getByText('Username is required.')).toBeInTheDocument();
      expect(screen.getByText('Name is required.')).toBeInTheDocument();
      expect(screen.getByText('Email is required.')).toBeInTheDocument();
      expect(screen.getByText('Password is required.')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password.')).toBeInTheDocument();
    });

    it('must show an error when the username contains invalid characters', async () => {
      renderSignUp();

      await fillForm({ username: 'lily chen!' });
      await userEvent.click(submitButton());

      expect(
        screen.getByText('Username can only contain letters, numbers, hyphens, and underscores.')
      ).toBeInTheDocument();
    });

    it('must show an error when the email is not a valid format', async () => {
      renderSignUp();

      // "user@example" passes the native type="email" check (HTML doesn't require a
      // dot in the domain) but fails the stricter regex in validate(). A string like
      // "not-an-email" would be blocked by the browser and never reach handleSubmit.
      await fillForm({ email: 'user@example' });
      await userEvent.click(submitButton());

      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
      expect(screen.queryByText('Account Created! 🎉')).not.toBeInTheDocument();
    });

    it('must show an error when the password is under 8 characters', async () => {
      renderSignUp();

      await fillForm({ password: 'short1', confirmPassword: 'short1' });
      await userEvent.click(submitButton());

      expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
    });

    it('must show an error when passwords do not match', async () => {
      renderSignUp();

      await fillForm({ password: 'SecurePass123!', confirmPassword: 'DifferentPass123!' });
      await userEvent.click(submitButton());

      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });

    it('must clear a field error once the user edits that field', async () => {
      renderSignUp();
      await userEvent.click(submitButton());
      expect(screen.getByText('Name is required.')).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/^display name/i), 'L');

      expect(screen.queryByText('Name is required.')).not.toBeInTheDocument();
    });

  });

  describe('password strength indicator', () => {                       // Nested Test Suite

    it('must not show a strength indicator when the password field is empty', () => {
      renderSignUp();

      expect(screen.queryByText('Weak')).not.toBeInTheDocument();
      expect(screen.queryByText('Fair')).not.toBeInTheDocument();
      expect(screen.queryByText('Good')).not.toBeInTheDocument();
      expect(screen.queryByText('Strong')).not.toBeInTheDocument();
    });

    it('must show "Weak" for a short, simple password', async () => {
      renderSignUp();

      await userEvent.type(screen.getByLabelText(/^password/i), 'abc');

      expect(screen.getByText('Weak')).toBeInTheDocument();
    });

    it('must show "Fair" for an 8-character password with one character class', async () => {
      renderSignUp();

      // 8 chars + uppercase = score 2
      await userEvent.type(screen.getByLabelText(/^password/i), 'Password');

      expect(screen.getByText('Fair')).toBeInTheDocument();
    });

    it('must show "Good" for a password with mixed case and a number', async () => {
      renderSignUp();

      // 8+ chars + uppercase + digit = score 3
      await userEvent.type(screen.getByLabelText(/^password/i), 'Password1');

      expect(screen.getByText('Good')).toBeInTheDocument();
    });

    it('must show "Strong" for a long password with mixed case, numbers, and symbols', async () => {
      renderSignUp();

      await userEvent.type(screen.getByLabelText(/^password/i), 'SuperSecure123!');

      expect(screen.getByText('Strong')).toBeInTheDocument();
    });

  });

  describe('password visibility toggles', () => {                       // Nested Test Suite

    it('must toggle the password field independently of the confirm password field', async () => {
      renderSignUp();
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/^confirm password/i);

      const toggleButtons = screen.getAllByRole('button', { name: 'Show password' });
      expect(toggleButtons).toHaveLength(2);

      // Toggle only the first (password) field
      await userEvent.click(toggleButtons[0]);

      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(confirmInput).toHaveAttribute('type', 'password');
    });

    it('must toggle the confirm password field independently of the password field', async () => {
      renderSignUp();
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/^confirm password/i);

      const toggleButtons = screen.getAllByRole('button', { name: 'Show password' });

      // Toggle only the second (confirm password) field
      await userEvent.click(toggleButtons[1]);

      expect(confirmInput).toHaveAttribute('type', 'text');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('must toggle the confirm password field back to hidden', async () => {
      renderSignUp();
      const confirmInput = screen.getByLabelText(/^confirm password/i);

      await userEvent.click(screen.getAllByRole('button', { name: 'Show password' })[1]);
      expect(confirmInput).toHaveAttribute('type', 'text');

      await userEvent.click(screen.getByRole('button', { name: 'Hide password' }));

      expect(confirmInput).toHaveAttribute('type', 'password');
    });

  });

  describe('submission', () => {                                        // Nested Test Suite

    it('must call register and show the success view on valid submission', async () => {
      renderSignUp();

      await fillForm({ name: 'Lily Chen' });
      await userEvent.click(submitButton());

      await waitFor(() => {
        expect(screen.getByText('Account Created! 🎉')).toBeInTheDocument();
      });
      expect(screen.getByText(/Welcome to Green Beans, Lily Chen/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Start Browsing' })).toHaveAttribute('href', '/browse');
    });

    // ---------------------------------------------------------------------
    // REQUIRES A COMPONENT CHANGE. These cover the catch block in
    // handleSubmit (SignUp.tsx lines 96-101). `submitError` is currently set
    // but never rendered, so there is no element to assert against and these
    // will fail until the following is added to SignUp.tsx, immediately after
    // the Confirm Password </FormField> and replacing the existing <Button>:
    //
    //   {submitError && (
    //     <div className="auth-page__submit-error" role="alert">
    //       {submitError}
    //     </div>
    //   )}
    //
    //   <Button variant="primary" type="submit" size="lg" disabled={submitting}>
    //     {submitting ? "Creating Account…" : "Create Account"}
    //   </Button>
    // ---------------------------------------------------------------------

    it('must show a duplicate-account message when the server returns 409', async () => {
      server.use(
        http.post(`${API_URL}/v1/register`, () =>
          HttpResponse.json({ detail: 'Email already registered' }, { status: 409 })
        )
      );
      renderSignUp();

      await fillForm();
      await userEvent.click(submitButton());

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'An account with this email already exists.'
        );
      });
      expect(screen.queryByText('Account Created! 🎉')).not.toBeInTheDocument();
    });

    it('must surface the server message for a non-409 API error', async () => {
      server.use(
        http.post(`${API_URL}/v1/register`, () =>
          HttpResponse.json({ detail: 'Username already taken' }, { status: 400 })
        )
      );
      renderSignUp();

      await fillForm();
      await userEvent.click(submitButton());

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Username already taken');
      });
      expect(screen.queryByText('Account Created! 🎉')).not.toBeInTheDocument();
    });

    it('must show a generic error message on network failure', async () => {
      server.use(
        http.post(`${API_URL}/v1/register`, () => HttpResponse.error())
      );
      renderSignUp();

      await fillForm();
      await userEvent.click(submitButton());

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Something went wrong while creating your account. Please try again.'
        );
      });
      expect(screen.queryByText('Account Created! 🎉')).not.toBeInTheDocument();
    });

    it('must let the user retry after a failed submission', async () => {
      server.use(
        http.post(`${API_URL}/v1/register`, () => HttpResponse.error())
      );
      renderSignUp();

      await fillForm();
      await userEvent.click(submitButton());

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // `finally { setSubmitting(false) }` must re-enable the button.
      expect(submitButton()).toBeEnabled();
    });

  });

});