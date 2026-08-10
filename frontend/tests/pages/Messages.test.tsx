import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Messages from '@/pages/Messages';

function renderMessages() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Messages />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Messages', () => {

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('page header', () => {

    it('must display messages title', () => {
      renderMessages();

      expect(screen.getByText(/Messages/)).toBeInTheDocument();
    });

    it('must display subtitle', () => {
      renderMessages();

      expect(screen.getByText(/conversations/i)).toBeInTheDocument();
    });

  });

  describe('search', () => {

    it('must display search bar', () => {
      renderMessages();

      const searchInput = screen.getByPlaceholderText(/Search by name or listing/);
      expect(searchInput).toBeInTheDocument();
    });

    it('must filter threads by the other participant\'s name', async () => {
      renderMessages();

      // User 1's threads: thread 1 (Oliver Lee, re: Fresh Tomatoes),
      // thread 3 (Glen Kim, re: Strawberry Jam), thread 4 (Malia Nakamura, re: Lilikoi).
      const searchInput = screen.getByPlaceholderText(/Search by name or listing/) as HTMLInputElement;
      // Typed with a trailing Enter so this works whether SearchBar filters on every
      // keystroke or only on submit.
      await userEvent.type(searchInput, 'Oliver{enter}');

      expect(screen.getByText('Oliver L.')).toBeInTheDocument();
      expect(screen.queryByText('Glen K.')).not.toBeInTheDocument();
      expect(screen.queryByText('Malia N.')).not.toBeInTheDocument();
    });

    it('must filter threads by listing name', async () => {
      renderMessages();

      const searchInput = screen.getByPlaceholderText(/Search by name or listing/) as HTMLInputElement;
      await userEvent.type(searchInput, 'Lilikoi{enter}');

      expect(screen.getByText('Malia N.')).toBeInTheDocument();
      expect(screen.queryByText('Oliver L.')).not.toBeInTheDocument();
      expect(screen.queryByText('Glen K.')).not.toBeInTheDocument();
    });

    it('must show empty state when the search matches nothing', async () => {
      renderMessages();

      const searchInput = screen.getByPlaceholderText(/Search by name or listing/);
      await userEvent.type(searchInput, 'zzzzzzzzzzzzzzzzzzzzz{enter}');

      expect(screen.getByText('No messages yet')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Browse Listings/ })).toHaveAttribute('href', '/browse');
    });

  });

  describe('thread list', () => {

    it('must show both a Recent and an Older section when threads span both windows', () => {
      // Pin "now" so thread 1 (last message 2026-07-02T09:30) and thread 4
      // (last message 2026-07-02T12:10) fall inside the 7-day "Recent" window,
      // while thread 3 (last message 2026-06-21T17:15) falls outside it —
      // rather than depending on the real wall-clock date.
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-07-03T00:00:00'));

      renderMessages();

      expect(screen.getByText('Recent')).toBeInTheDocument();
      expect(screen.getByText('Older')).toBeInTheDocument();
      // Oliver Lee's thread (1) should be in Recent.
      expect(screen.getByText('Oliver L.')).toBeInTheDocument();
      // Glen Kim's thread (3) should be in Older.
      expect(screen.getByText('Glen K.')).toBeInTheDocument();
    });

    it('must display thread cards with participant info', () => {
      renderMessages();

      const threadLinks = screen.queryAllByRole('link');
      expect(threadLinks.length).toBeGreaterThan(0);
    });

  });

  describe('thread navigation', () => {

    it('must have links to individual threads', () => {
      renderMessages();

      const threadLinks = screen.queryAllByRole('link');
      const messageThreadLinks = threadLinks.filter(link =>
        link.getAttribute('href')?.startsWith('/messages/')
      );
      expect(messageThreadLinks.length).toBeGreaterThan(0);
    });

  });

});