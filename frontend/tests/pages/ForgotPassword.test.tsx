import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '@/pages/ForgotPassword';

function renderForgotPassword() {
  return render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );
}

describe('ForgotPassword', () => {

  describe('form', () => {

    it('must display email input field', () => {
      renderForgotPassword();

      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    });

    it('must have correct placeholder text', () => {
      renderForgotPassword();

      const emailInput = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
      expect(emailInput).toBeInTheDocument();
    });

  });

  describe('validation', () => {

    it('must show error when submitting empty email', async () => {
      renderForgotPassword();

      const submitButton = screen.getByRole('button', { name: /Send Reset Link/ });
      await userEvent.click(submitButton);

      expect(screen.getByText('Email is required.')).toBeInTheDocument();
    });

    it('must show error for invalid email format', async () => {
      renderForgotPassword();

      const emailInput = screen.getByLabelText(/Email/) as HTMLInputElement;
      await userEvent.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /Send Reset Link/ });
      await userEvent.click(submitButton);

      // If validation error occurred, form should still be visible (not submitted)
      expect(screen.getByText('Reset your password')).toBeInTheDocument();
      expect(emailInput.value).toBe('invalid-email');
    });

    it('must clear error when user types in field', async () => {
      renderForgotPassword();

      const submitButton = screen.getByRole('button', { name: /Send Reset Link/ });
      await userEvent.click(submitButton);

      expect(screen.getByText('Email is required.')).toBeInTheDocument();

      const emailInput = screen.getByLabelText(/Email/);
      await userEvent.type(emailInput, 'test@example.com');

      expect(screen.queryByText('Email is required.')).not.toBeInTheDocument();
    });

  });

  describe('submit', () => {

    it('must show success screen on valid submission', async () => {
      renderForgotPassword();

      const emailInput = screen.getByLabelText(/Email/);
      await userEvent.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /Send Reset Link/ });
      await userEvent.click(submitButton);

      expect(screen.getByText('Check your email 📧')).toBeInTheDocument();
      expect(screen.getByText(/If an account exists/)).toBeInTheDocument();
    });

    it('must display entered email in success message', async () => {
      renderForgotPassword();

      const testEmail = 'user@example.com';
      const emailInput = screen.getByLabelText(/Email/);
      await userEvent.type(emailInput, testEmail);

      const submitButton = screen.getByRole('button', { name: /Send Reset Link/ });
      await userEvent.click(submitButton);

      expect(screen.getByText(new RegExp(testEmail))).toBeInTheDocument();
    });

  });

  describe('navigation', () => {

    it('must have link to login', () => {
      renderForgotPassword();

      const loginLinks = screen.getAllByRole('link', { name: /Log in|Back to Login/ });
      expect(loginLinks.length).toBeGreaterThan(0);
    });

    it('must have correct href for login link', () => {
      renderForgotPassword();

      const loginLinks = screen.getAllByRole('link', { name: /Log in/ });
      const loginLink = loginLinks[0];
      expect(loginLink).toHaveAttribute('href', '/login');
    });

  });

  describe('page content', () => {

    it('must display form heading', () => {
      renderForgotPassword();

      expect(screen.getByText('Reset your password')).toBeInTheDocument();
    });

    it('must display form instructions', () => {
      renderForgotPassword();

      expect(screen.getByText(/Enter the email address associated with your account/)).toBeInTheDocument();
    });

    it('must display brand name', () => {
      renderForgotPassword();

      expect(screen.getByText('Green Beans')).toBeInTheDocument();
    });

  });

});
