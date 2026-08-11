import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '@/context/AuthContext';
import { setToken, clearToken } from '@/lib/api';
import MessageThread from '@/pages/MessageThread';

const API_URL = 'http://127.0.0.1:8000';

// jsdom doesn't support scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

function renderMessageThread(threadId = '1') {
  return render(
    <MemoryRouter initialEntries={[`/messages/${threadId}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/messages/:threadId" element={<MessageThread />} />
          <Route path="/messages" element={<div>Messages List</div>} />
          <Route path="/listings/:id" element={<div>Listing Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('MessageThread', () => {
  beforeEach(() => {
    setToken('fake-jwt-token');
  });

  afterEach(() => {
    clearToken();
  });

  describe('loading and display', () => {
    it('shows loading state initially', () => {
      renderMessageThread();
      expect(screen.getByText('Loading conversation...')).toBeInTheDocument();
    });

    it('displays messages from the thread', async () => {
      renderMessageThread();

      await waitFor(() => {
        expect(screen.getByText('Hi! Are the tomatoes still available?')).toBeInTheDocument();
      });
      expect(screen.getByText('Yes they are! When can you pick up?')).toBeInTheDocument();
    });

    it('shows listing context with name', async () => {
      renderMessageThread();

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      });
    });

    it('shows listing status in context section', async () => {
      renderMessageThread();

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      });
      // Status badge should show Available
      expect(screen.getByText('Available')).toBeInTheDocument();
    });
  });

  describe('message input', () => {
    it('has a message input field', async () => {
      renderMessageThread();

      await waitFor(() => {
        expect(screen.getByLabelText(/Message input/i)).toBeInTheDocument();
      });
    });

    it('has a send button', async () => {
      renderMessageThread();

      await waitFor(() => {
        expect(screen.getByLabelText(/Send message/i)).toBeInTheDocument();
      });
    });

    it('sends a message and adds it to the list', async () => {
      renderMessageThread();

      await waitFor(() => {
        expect(screen.getByLabelText(/Message input/i)).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/Message input/i);
      await userEvent.type(input, 'I can pick up tomorrow');
      await userEvent.click(screen.getByLabelText(/Send message/i));

      await waitFor(() => {
        expect(screen.getByText('I can pick up tomorrow')).toBeInTheDocument();
      });
    });

    it('clears input after sending', async () => {
      renderMessageThread();

      await waitFor(() => {
        expect(screen.getByLabelText(/Message input/i)).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/Message input/i);
      await userEvent.type(input, 'Hello');
      await userEvent.click(screen.getByLabelText(/Send message/i));

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });
  });

  describe('not found', () => {
    it('shows not-found for invalid thread', async () => {
      server.use(
        http.get(`${API_URL}/v1/claims/:claimId/thread`, () => {
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
        })
      );

      renderMessageThread('999');

      await waitFor(() => {
        expect(screen.getByText('Conversation not found')).toBeInTheDocument();
      });
    });
  });
});
