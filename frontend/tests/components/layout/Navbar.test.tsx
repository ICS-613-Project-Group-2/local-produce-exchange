import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';

function renderNavbar(props = {}) {
  return render(
    <MemoryRouter>
      <Navbar isLoggedIn={false} {...props} />
    </MemoryRouter>
  );
}
describe('Navbar', () => {                                              // Test Suite

  it('must render the brand link', () => {                             // Test Case
    renderNavbar();

    expect(screen.getByRole('link', { name: /green beans/i })).toHaveAttribute('href', '/');
  });

  describe('when logged out', () => {                                  // Nested Test Suite

    it('must show About, Log In, and Sign Up links', () => {
      renderNavbar({ isLoggedIn: false });

      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Log In' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    });

    it('must not show logged-in links', () => {
      renderNavbar({ isLoggedIn: false });

      expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Log Out' })).not.toBeInTheDocument();
    });

    it('must link to the correct paths', () => {
      renderNavbar({ isLoggedIn: false });

      expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/login');
      expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/signup');
    });
  });

  describe('when logged in', () => {                                   // Nested Test Suite

    it('must show Browse, Communities, Dashboard, Profile, and Log Out', () => {
      renderNavbar({ isLoggedIn: true });

      expect(screen.getByRole('link', { name: 'Browse' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Communities' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Log Out' })).toBeInTheDocument();
    });

    it('must not show logged-out links', () => {
      renderNavbar({ isLoggedIn: true });

      expect(screen.queryByRole('link', { name: 'Log In' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Sign Up' })).not.toBeInTheDocument();
    });

    it('must show a Notifications link with an accessible label', () => {
      renderNavbar({ isLoggedIn: true });

      expect(screen.getByRole('link', { name: 'Notifications' })).toHaveAttribute(
        'href',
        '/notifications'
      );
    });

    it('must call onLogout when Log Out is clicked', async () => {
      const handleLogout = vi.fn();
      renderNavbar({ isLoggedIn: true, onLogout: handleLogout });

      await userEvent.click(screen.getByRole('button', { name: 'Log Out' }));

      expect(handleLogout).toHaveBeenCalledTimes(1);
    });

    it('must not throw when Log Out is clicked without an onLogout handler', async () => {
      renderNavbar({ isLoggedIn: true, onLogout: undefined });

      await userEvent.click(screen.getByRole('button', { name: 'Log Out' }));

      // no assertion needed beyond "it didn't throw" — onLogout?.() handles the undefined case
    });
  });
});