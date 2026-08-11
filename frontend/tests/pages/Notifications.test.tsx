import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '@/context/AuthContext';
import { setToken, clearToken } from '@/lib/api';
import Notifications from '@/pages/Notifications';

const API_URL = 'http://127.0.0.1:8000';

function renderNotifications() {
  return render(
    <MemoryRouter initialEntries={['/notifications']}>
      <AuthProvider>
        <Notifications />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Notifications', () => {
  beforeEach(() => {
    setToken('fake-jwt-token');
  });

  afterEach(() => {
    clearToken();
  });

  describe('loading and display', () => {
    it('shows loading state initially', () => {
      renderNotifications();
      expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
    });

    it('displays notification content after loading', async () => {
      renderNotifications();

      await waitFor(() => {
        expect(screen.getByText(/Oliver requested 3 lbs of your Fresh Tomatoes/)).toBeInTheDocument();
      });
      expect(screen.getByText(/Your Zucchini listing expires tomorrow/)).toBeInTheDocument();
    });

    it('shows unread count in header', async () => {
      renderNotifications();

      await waitFor(() => {
        expect(screen.getByText(/2 unread/)).toBeInTheDocument();
      });
    });
  });

  describe('filter tabs', () => {
    it('displays filter tab buttons', async () => {
      renderNotifications();

      await waitFor(() => {
        expect(screen.getByText('All')).toBeInTheDocument();
      });
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Claims')).toBeInTheDocument();
      expect(screen.getByText('Communities')).toBeInTheDocument();
      expect(screen.getByText('Listings')).toBeInTheDocument();
    });

    it('filters notifications by type when clicking a tab', async () => {
      renderNotifications();

      await waitFor(() => {
        expect(screen.getByText(/Oliver requested/)).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Messages'));

      await waitFor(() => {
        expect(screen.getByText(/New message from Oliver/)).toBeInTheDocument();
      });
      // Claim notification should no longer be visible
      expect(screen.queryByText(/Oliver requested 3 lbs/)).not.toBeInTheDocument();
    });

    it('shows empty state when filtered to a type with no results', async () => {
      // Communities tab only has 1 notification. Override to have none of that type.
      server.use(
        http.get(`${API_URL}/v1/me/notifications`, () => {
          return HttpResponse.json([
            {
              notification_id: 1,
              user_id: 1,
              message_id: null,
              claim_request_id: 1,
              content: 'A claim notification',
              timestamp: '2026-08-10T10:00:00',
              is_read: false,
              type: 'claim',
            },
          ]);
        })
      );

      renderNotifications();

      await waitFor(() => {
        expect(screen.getByText('A claim notification')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Messages'));

      await waitFor(() => {
        expect(screen.getByText(/No notifications yet/)).toBeInTheDocument();
      });
    });
  });

  describe('mark as read', () => {
    it('has a mark all as read button when unread notifications exist', async () => {
      renderNotifications();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Mark all as read/ })).toBeInTheDocument();
      });
    });

    it('mark all as read calls the API', async () => {
      let markAllCalled = false;
      server.use(
        http.put(`${API_URL}/v1/me/notifications/read-all`, () => {
          markAllCalled = true;
          return new HttpResponse(null, { status: 204 });
        })
      );

      renderNotifications();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Mark all as read/ })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Mark all as read/ }));

      await waitFor(() => {
        expect(markAllCalled).toBe(true);
      });
    });

    it('clicking a notification marks it as read', async () => {
      let markedId: string | null = null;
      server.use(
        http.put(`${API_URL}/v1/notifications/:id/read`, ({ params }) => {
          markedId = params.id as string;
          return HttpResponse.json({
            notification_id: Number(params.id),
            is_read: true,
          });
        })
      );

      renderNotifications();

      await waitFor(() => {
        expect(screen.getByText(/Oliver requested/)).toBeInTheDocument();
      });

      // Click the notification link
      const notificationLink = screen.getByText(/Oliver requested/).closest('a');
      if (notificationLink) {
        await userEvent.click(notificationLink);
      }

      await waitFor(() => {
        expect(markedId).toBe('1');
      });
    });
  });
});
