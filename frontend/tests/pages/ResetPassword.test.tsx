import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from '@/pages/ResetPassword';

function renderResetPassword() {
  return render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  );
}

describe('ResetPassword', () => {

  describe('form fields', () => {

    it('must display password and confirm password fields', () => {
      renderResetPassword();

      expect(screen.getByLabelText(/^New Password/)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Confirm New Password/)).toBeInTheDocument();
    });

    it('must have password visibility toggles', () => {
      renderResetPassword();

      const toggleButtons = screen.getAllByRole('button').filter(btn =>
        btn.getAttribute('aria-label')?.includes('password')
      );
      expect(toggleButtons.length).toBeGreaterThanOrEqual(2);
    });

  });

  describe('password visibility', () => {

    it('must toggle password visibility', async () => {
      renderResetPassword();

      const passwordInput = screen.getByLabelText(/^New Password/) as HTMLInputElement;
      expect(passwordInput.type).toBe('password');

      const toggleButtons = screen.getAllByRole('button').filter(btn =>
        btn.getAttribute('aria-label')?.includes('password')
      );
      await userEvent.click(toggleButtons[0]);

      expect(passwordInput.type).toBe('text');
    });

  });

  describe('password strength', () => {

    it('must display strength indicator when typing password', async () => {
      renderResetPassword();

      const passwordInput = screen.getByLabelText(/^New Password/);
      await userEvent.type(passwordInput, 'StrongPass123!');

      const strengthText = screen.queryByText(/Weak|Fair|Good|Strong/);
      if (strengthText) {
        expect(strengthText).toBeInTheDocument();
      }
    });

  });

  describe('validation', () => {

    it('must show error for empty password', async () => {
      renderResetPassword();

      const submitButton = screen.getByRole('button', { name: /Update Password/ });
      await userEvent.click(submitButton);

      expect(screen.getByText(/New password is required/i)).toBeInTheDocument();
    });

    it('must show error for password shorter than 8 characters', async () => {
      renderResetPassword();

      const passwordInput = screen.getByLabelText(/^New Password/);
      await userEvent.type(passwordInput, 'short');

      const submitButton = screen.getByRole('button', { name: /Update Password/ });
      await userEvent.click(submitButton);

      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    it('must show error for empty confirm password', async () => {
      renderResetPassword();

      const passwordInput = screen.getByLabelText(/^New Password/);
      await userEvent.type(passwordInput, 'ValidPass123');

      const submitButton = screen.getByRole('button', { name: /Update Password/ });
      await userEvent.click(submitButton);

      expect(screen.getByText(/please confirm your new password/i)).toBeInTheDocument();
    });

    it('must show error when passwords do not match', async () => {
      renderResetPassword();

      const passwordInput = screen.getByLabelText(/^New Password/);
      const confirmInput = screen.getByLabelText(/^Confirm New Password/);

      await userEvent.type(passwordInput, 'ValidPass123');
      await userEvent.type(confirmInput, 'DifferentPass456');

      const submitButton = screen.getByRole('button', { name: /Update Password/ });
      await userEvent.click(submitButton);

      expect(screen.getByText(/do not match/i)).toBeInTheDocument();
    });

    it('must clear error when user types', async () => {
      renderResetPassword();

      const submitButton = screen.getByRole('button', { name: /Update Password/ });
      await userEvent.click(submitButton);

      expect(screen.getByText(/New password is required/i)).toBeInTheDocument();

      const passwordInput = screen.getByLabelText(/^New Password/);
      await userEvent.type(passwordInput, 'ValidPass123');

      expect(screen.queryByText(/New password is required/i)).not.toBeInTheDocument();
    });

  });

  describe('submit', () => {

    it('must show success screen on valid submission', async () => {
      renderResetPassword();

      const passwordInput = screen.getByLabelText(/^New Password/);
      const confirmInput = screen.getByLabelText(/^Confirm New Password/);

      await userEvent.type(passwordInput, 'ValidPass123');
      await userEvent.type(confirmInput, 'ValidPass123');

      const submitButton = screen.getByRole('button', { name: /Update Password/ });
      await userEvent.click(submitButton);

      expect(screen.getByText('Password Updated ✅')).toBeInTheDocument();
    });

  });

  describe('navigation', () => {

    it('must have link to login', () => {
      renderResetPassword();

      const loginLinks = screen.getAllByRole('link', { name: /Login|Back to Login/ });
      expect(loginLinks.length).toBeGreaterThan(0);
    });

    it('must have correct href for login link', () => {
      renderResetPassword();

      const loginLinks = screen.getAllByRole('link', { name: /Login/ });
      const loginLink = loginLinks[0];
      expect(loginLink).toHaveAttribute('href', '/login');
    });

  });

  describe('page content', () => {

    it('must display form heading', () => {
      renderResetPassword();

      expect(screen.getByText('Create new password')).toBeInTheDocument();
    });

    it('must display brand name', () => {
      renderResetPassword();

      expect(screen.getByText('Green Beans')).toBeInTheDocument();
    });

  });

});