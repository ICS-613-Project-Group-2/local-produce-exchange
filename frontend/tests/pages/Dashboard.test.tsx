import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Dashboard from '@/pages/Dashboard';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Dashboard', () => {

  describe('greeting', () => {

    it('must display welcome message', () => {
      renderDashboard();

      expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
      expect(screen.getByText(/happening with your food exchanges/)).toBeInTheDocument();
    });

  });

  describe('quick actions', () => {

    it('must display all quick action buttons', () => {
      renderDashboard();

      expect(screen.getByRole('link', { name: /Create Listing/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Browse Listings/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Messages/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Communities/ })).toBeInTheDocument();
    });

    it('must have correct navigation links', () => {
      renderDashboard();

      const createLink = screen.getByRole('link', { name: /Create Listing/ });
      expect(createLink).toHaveAttribute('href', '/listings/new');

      const browseLink = screen.getByRole('link', { name: /Browse Listings/ });
      expect(browseLink).toHaveAttribute('href', '/browse');
    });

  });

  describe('stat cards', () => {

    it('must display stat cards with numbers', () => {
      renderDashboard();

      expect(screen.getByText('Active Listings')).toBeInTheDocument();
      expect(screen.getByText('Reserved')).toBeInTheDocument();
      expect(screen.getByText('Unread Notifications')).toBeInTheDocument();
      expect(screen.getByText('Pending Claims')).toBeInTheDocument();
    });

  });

  describe('active listings section', () => {

    it('must display active listings section header', () => {
      renderDashboard();

      expect(screen.getByText('My Active Listings')).toBeInTheDocument();
    });

    it('must have link to view all history', () => {
      renderDashboard();

      const historyLink = screen.getByRole('link', { name: /View All History/ });
      expect(historyLink).toHaveAttribute('href', '/history');
    });

  });

  describe('my communities section', () => {

    it('must display my communities section', () => {
      renderDashboard();

      expect(screen.getByText('My Communities')).toBeInTheDocument();
    });

    it('must have browse all communities link', () => {
      renderDashboard();

      const browseAllLink = screen.getAllByRole('link', { name: /Browse All/ })[0];
      expect(browseAllLink).toHaveAttribute('href', '/communities');
    });

  });

  describe('reserved and pending section', () => {

    it('must display reserved and pending section', () => {
      renderDashboard();

      expect(screen.getByText('Reserved & Pending')).toBeInTheDocument();
    });

  });

  describe('messages section', () => {

    it('must display recent messages section', () => {
      renderDashboard();

      expect(screen.getByText('Recent Messages')).toBeInTheDocument();
    });

    it('must have link to view all messages', () => {
      renderDashboard();

      const messageLinks = screen.getAllByRole('link', { name: /View All/ });
      const messagesLink = messageLinks.find(link => link.getAttribute('href') === '/messages');
      expect(messagesLink).toBeInTheDocument();
    });

  });

});
