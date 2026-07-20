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

  it('must show validation errors when submitting an empty form', async () => {
    renderSignUp();

    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password.')).toBeInTheDocument();
  });

  it('must show an error when the username contains invalid characters', async () => {
    renderSignUp();

    await fillForm({ username: 'lily chen!' });
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(
      screen.getByText('Username can only contain letters, numbers, hyphens, and underscores.')
    ).toBeInTheDocument();
  });

  /*
  it.skip('must show an error when the email is not a valid format', async () => {
    renderSignUp();

    await fillForm({ email: 'not-an-email' });
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.some(alert => alert.textContent?.includes('Please enter a valid email address'))).toBe(true);
    });
  });
  */

  it('must show an error when the password is under 8 characters', async () => {
    renderSignUp();

    await fillForm({ password: 'short1', confirmPassword: 'short1' });
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
  });

  it('must show an error when passwords do not match', async () => {
    renderSignUp();

    await fillForm({ password: 'SecurePass123!', confirmPassword: 'DifferentPass123!' });
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('must clear a field error once the user edits that field', async () => {
    renderSignUp();
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('Name is required.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/^display name/i), 'L');

    expect(screen.queryByText('Name is required.')).not.toBeInTheDocument();
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
  });

  it('must call register and show the success view on valid submission', async () => {
    renderSignUp();

    await fillForm({ name: 'Lily Chen' });
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Account Created! 🎉')).toBeInTheDocument();
    });
    expect(screen.getByText(/Welcome to Green Beans, Lily Chen/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start Browsing' })).toHaveAttribute('href', '/browse');
  });

  /*
  it.skip('must show "An account with this email already exists." when the server returns 409', async () => {
    server.use(
      http.post(`${API_URL}/v1/register`, () => {
        return HttpResponse.json({ detail: 'Email already registered' }, { status: 409 });
      })
    );
    renderSignUp();

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    screen.debug(undefined, 20000);   // <-- temporary, prints the current DOM

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'An account with this email already exists.'
      );
    });
  });

  it.skip('must show a generic error message on network failure', async () => {
    server.use(
      http.post(`${API_URL}/v1/register`, () => {
        return HttpResponse.error();
      })
    );
    renderSignUp();

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    try {
        await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
            'An account with this email already exists.'
        );
        });
    } catch (e) {
        screen.debug(undefined, 20000);
        throw e;
    }
    });
    */
  });