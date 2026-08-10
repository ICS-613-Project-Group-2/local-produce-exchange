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

    it('must show the unread count in the title', () => {
      // User 1 has 3 unread notifications in the seed data (ids 1, 2, 5).
      renderNotifications();

      expect(screen.getByText('Notifications (3 unread)')).toBeInTheDocument();
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
      // Only notification 5 (type "message") should remain for user 1.
      expect(screen.getByText(/new message from Oliver Lee/)).toBeInTheDocument();
      expect(screen.queryByText(/Fresh Tomatoes listing/)).not.toBeInTheDocument();
    });

  });

  describe('notifications list', () => {

    it('must display notifications grouped by date', () => {
      renderNotifications();

      const todayGroup = screen.queryByText('Today');
      const yesterdayGroup = screen.queryByText('Yesterday');
      const earlierGroup = screen.queryByText('Earlier');

      const groups = [todayGroup, yesterdayGroup, earlierGroup].filter(g => g !== null);
      expect(groups.length).toBeGreaterThan(0);
    });

  });

  describe('notifications actions', () => {

    it('must display the mark-all-as-read button when unread notifications exist', () => {
      renderNotifications();

      expect(screen.getByRole('button', { name: /Mark all as read/ })).toBeInTheDocument();
    });

    it('must mark all notifications as read and hide the button when clicked', async () => {
      renderNotifications();

      expect(screen.getAllByLabelText('Unread')).toHaveLength(3);

      await userEvent.click(screen.getByRole('button', { name: /Mark all as read/ }));

      expect(screen.queryByRole('button', { name: /Mark all as read/ })).not.toBeInTheDocument();
      expect(screen.queryAllByLabelText('Unread')).toHaveLength(0);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('must mark a single notification as read when its link is clicked', async () => {
      renderNotifications();

      const unreadDotsBefore = screen.getAllByLabelText('Unread');
      expect(unreadDotsBefore).toHaveLength(3);

      const links = screen.getAllByRole('link');
      await userEvent.click(links[0]);

      expect(screen.queryAllByLabelText('Unread')).toHaveLength(unreadDotsBefore.length - 1);
    });

    it('must dismiss a notification when its × button is clicked', async () => {
      renderNotifications();

      const dismissButtons = screen.getAllByLabelText(/Dismiss notification/);
      const countBefore = dismissButtons.length;

      await userEvent.click(dismissButtons[0]);

      expect(screen.getAllByLabelText(/Dismiss notification/)).toHaveLength(countBefore - 1);
    });

  });

  describe('notification links', () => {

    it('must link each notification to its type-based destination', () => {
      renderNotifications();

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      // "Oliver Lee requested 3 lbs..." is a "claim" type notification.
      const claimLink = screen.getByText('Oliver Lee requested 3 lbs of your Fresh Tomatoes listing.').closest('a');
      expect(claimLink).toHaveAttribute('href', '/history');
    });

  });

  describe('empty state', () => {

    it('must show the empty state when a filter matches nothing', async () => {
      renderNotifications();

      // Dismiss every notification, then the "no notifications" empty state
      // should render regardless of which filter tab is active.
      let dismissButtons = screen.queryAllByLabelText(/Dismiss notification/);
      while (dismissButtons.length > 0) {
        await userEvent.click(dismissButtons[0]);
        dismissButtons = screen.queryAllByLabelText(/Dismiss notification/);
      }

      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    });

  });

});
