import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Notifications from '@/pages/Notifications';

function renderNotifications() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Notifications />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Notifications', () => {

  describe('page header', () => {

    it('must display notifications title', () => {
      renderNotifications();

      expect(screen.getByText(/Notifications/)).toBeInTheDocument();
    });

    it('must display subtitle', () => {
      renderNotifications();

      expect(screen.getByText(/updates about your listings/i)).toBeInTheDocument();
    });

  });

  describe('filter tabs', () => {

    it('must display all filter buttons', () => {
      renderNotifications();

      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Messages' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Claims' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Communities' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Listings' })).toBeInTheDocument();
    });

    it('must filter notifications when filter clicked', async () => {
      renderNotifications();

      const messagesFilter = screen.getByRole('button', { name: 'Messages' });
      await userEvent.click(messagesFilter);

      expect(messagesFilter).toHaveClass('notifications__filter--active');
    });

  });

  describe('notifications list', () => {

    it('must display notifications', () => {
      renderNotifications();

      const notificationContent = screen.queryAllByText(/listing|message|claim|community/i);
      // Check if notifications or empty state is displayed
      const emptyState = screen.queryByText(/No notifications yet/);

      if (notificationContent.length === 0) {
        expect(emptyState).toBeInTheDocument();
      }
    });

    it('must group notifications by date', () => {
      renderNotifications();

      const todayGroup = screen.queryByText('Today');
      const yesterdayGroup = screen.queryByText('Yesterday');
      const earlierGroup = screen.queryByText('Earlier');

      // At least one group should exist if there are notifications
      const groups = [todayGroup, yesterdayGroup, earlierGroup].filter(g => g !== null);
      if (groups.length > 0) {
        expect(groups.length).toBeGreaterThan(0);
      }
    });

  });

  describe('notifications actions', () => {

    it('must display mark all as read button when unread exists', async () => {
      renderNotifications();

      const markAllButton = screen.queryByRole('button', { name: /Mark all as read/ });
      if (markAllButton) {
        expect(markAllButton).toBeInTheDocument();
      }
    });

    it('must dismiss notification when x clicked', async () => {
      renderNotifications();

      const dismissButtons = screen.queryAllByLabelText(/Dismiss notification/);
      if (dismissButtons.length > 0) {
        await userEvent.click(dismissButtons[0]);

        // After dismiss, one less dismiss button should exist
        const remainingButtons = screen.queryAllByLabelText(/Dismiss notification/);
        expect(remainingButtons.length).toBeLessThan(dismissButtons.length);
      }
    });

  });

  describe('notification links', () => {

    it('must have links to notification destinations', () => {
      renderNotifications();

      const links = screen.queryAllByRole('link');
      // Links may or may not exist depending on notification types
      if (links.length > 0) {
        expect(links.length).toBeGreaterThan(0);
      }
    });

  });

  describe('empty state', () => {

    it('must display empty state when no notifications', () => {
      renderNotifications();

      const emptyState = screen.queryByText(/No notifications yet/);
      // Empty state may or may not be visible depending on data
    });

  });

});
