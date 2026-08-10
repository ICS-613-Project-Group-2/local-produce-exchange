import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '@/context/AuthContext';
import { setToken, clearToken } from '@/lib/api';
import Messages from '@/pages/Messages';

const API_URL = 'http://127.0.0.1:8000';

function renderMessages() {
  return render(
    <MemoryRouter initialEntries={['/messages']}>
      <AuthProvider>
        <Routes>
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:threadId" element={<div>Thread Page</div>} />
          <Route path="/browse" element={<div>Browse Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Messages', () => {
  beforeEach(() => {
    setToken('fake-jwt-token');
  });

  afterEach(() => {
    clearToken();
  });

  describe('loading and display', () => {
    it('shows loading state initially', () => {
      renderMessages();
      expect(screen.getByText('Loading messages...')).toBeInTheDocument();
    });

    it('displays thread list after loading', async () => {
      renderMessages();

      await waitFor(() => {
        expect(screen.getAllByText('Other User').length).toBeGreaterThan(0);
      });
    });

    it('displays listing names in threads', async () => {
      renderMessages();

      await waitFor(() => {
        expect(screen.getByText(/Fresh Tomatoes/)).toBeInTheDocument();
      });
      expect(screen.getByText(/Meyer Lemons/)).toBeInTheDocument();
    });

    it('displays last message preview', async () => {
      renderMessages();

      await waitFor(() => {
        expect(screen.getByText(/Yes they are! When can you pick up?/)).toBeInTheDocument();
      });
    });

    it('shows page title', async () => {
      renderMessages();

      await waitFor(() => {
        expect(screen.getByText('Messages')).toBeInTheDocument();
      });
    });
  });

  describe('thread links', () => {
    it('thread cards link to the message thread by claim_request_id', async () => {
      renderMessages();

      await waitFor(() => {
        expect(screen.getByText(/Fresh Tomatoes/)).toBeInTheDocument();
      });

      // Links should point to /messages/:claimRequestId
      const links = screen.getAllByRole('link');
      const threadLinks = links.filter(link =>
        link.getAttribute('href')?.startsWith('/messages/')
      );
      expect(threadLinks.length).toBeGreaterThan(0);
      expect(threadLinks[0]).toHaveAttribute('href', '/messages/1');
    });
  });

  describe('empty state', () => {
    it('shows empty state when no threads exist', async () => {
      server.use(
        http.get(`${API_URL}/v1/me/threads`, () => {
          return HttpResponse.json([]);
        })
      );

      renderMessages();

      await waitFor(() => {
        expect(screen.getByText(/No conversations yet/)).toBeInTheDocument();
      });
    });
  });

  describe('error state', () => {
    it('shows error message when API fails', async () => {
      server.use(
        http.get(`${API_URL}/v1/me/threads`, () => {
          return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
        })
      );

      renderMessages();

      await waitFor(() => {
        expect(screen.getByText(/Failed to load messages/)).toBeInTheDocument();
      });
    });
  });
});
