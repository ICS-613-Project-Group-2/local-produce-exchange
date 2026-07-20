import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '@/context/AuthContext';
import { clearToken } from '@/lib/api';
import Login from '@/pages/Login';

const API_URL = 'http://127.0.0.1:8000';

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Login', () => {                                                // Test Suite

  beforeEach(() => {                                                     // Test Fixture (setup)
    clearToken();
  });

  afterEach(() => {                                                      // Test Fixture (teardown)
    clearToken();
  });

  it('must render the form with email and password fields', () => {      // Test Case
    renderLogin();

    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
  });

  it('must show validation errors when submitting empty fields', async () => {
    renderLogin();

    await userEvent.click(screen.getByRole('button', { name: 'Log In' }));

    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  it('must clear the email error once the user starts typing', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: 'Log In' }));
    expect(screen.getByText('Email is required.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/^email/i), 'p');

    expect(screen.queryByText('Email is required.')).not.toBeInTheDocument();
  });

  it('must toggle password visibility when the eye icon is clicked', async () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/^password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: 'Show password' }));

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
  });

  it('must log in successfully and show the success view', async () => {
    renderLogin();

    await userEvent.type(screen.getByLabelText(/^email/i), 'peter@example.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(screen.getByText('Welcome back! 🌱')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Go to Dashboard' })).toHaveAttribute(
      'href',
      '/dashboard'
    );
  });

  it('must show "Incorrect email or password." when the server returns 400', async () => {
    server.use(
      http.post(`${API_URL}/v1/login`, () => {
        return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 400 });
      })
    );
    renderLogin();

    await userEvent.type(screen.getByLabelText(/^email/i), 'peter@example.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Incorrect email or password.');
    });
  });

  it('must show the server error message for non-400 API errors', async () => {
    server.use(
      http.post(`${API_URL}/v1/login`, () => {
        return HttpResponse.json({ detail: 'Account is locked' }, { status: 403 });
      })
    );
    renderLogin();

    await userEvent.type(screen.getByLabelText(/^email/i), 'peter@example.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Account is locked');
    });
  });

  it('must show a generic error message on network failure', async () => {
    server.use(
      http.post(`${API_URL}/v1/login`, () => {
        return HttpResponse.error();
      })
    );
    renderLogin();

    await userEvent.type(screen.getByLabelText(/^email/i), 'peter@example.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Something went wrong while logging in. Please try again.'
      );
    });
  });

  it('must disable the submit button and show "Logging in..." while submitting', async () => {
    server.use(
      http.post(`${API_URL}/v1/login`, async () => {
        await delay(50);
        return HttpResponse.json({ access_token: 'fake-jwt-token', token_type: 'bearer' });
      })
    );
    renderLogin();

    await userEvent.type(screen.getByLabelText(/^email/i), 'peter@example.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Log In' }));

    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('Welcome back! 🌱')).toBeInTheDocument();
    });
  });
});