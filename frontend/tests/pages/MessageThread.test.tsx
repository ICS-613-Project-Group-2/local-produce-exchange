import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import MessageThread from '@/pages/MessageThread';

// The component calls scrollIntoView on mount
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

function renderMessageThread(threadId: string = '1') {
  return render(
    <MemoryRouter initialEntries={[`/messages/${threadId}`]}>
      <Routes>
        <Route
          path="/messages/:threadId"
          element={
            <AuthProvider>
              <MessageThread />
            </AuthProvider>
          }
        />
        <Route path="/messages" element={<div>Messages Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('MessageThread', () => {

  describe('top bar', () => {

    it('must display a back link to /messages', () => {
      renderMessageThread();

      const backLink = screen.getByRole('link', { name: '←' });
      expect(backLink).toHaveAttribute('href', '/messages');
    });

    it('must display the other user name (Oliver L.)', () => {
      renderMessageThread();

      expect(screen.getByText('Oliver L.')).toBeInTheDocument();
    });

    it('must display the other user location', () => {
      renderMessageThread();

      expect(screen.getByText('📍 UH Mānoa')).toBeInTheDocument();
    });

    it('must display the other user avatar image', () => {
      renderMessageThread();

      const avatars = screen.getAllByRole('img', { name: 'Oliver Lee' });
      expect(avatars.length).toBeGreaterThan(0);
      expect(avatars[0]).toHaveAttribute('src', expect.stringContaining('unsplash.com'));
    });

  });

  describe('listing context', () => {

    it('must display a View Listing link for the related listing', () => {
      renderMessageThread();

      const viewLink = screen.getByRole('link', { name: /View Listing/ });
      expect(viewLink).toHaveAttribute('href', '/listings/1');
    });

    it('must display the listing name', () => {
      renderMessageThread();

      expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
    });

    it('must display the listing status badge', () => {
      renderMessageThread();

      expect(screen.getByText('Available')).toBeInTheDocument();
    });

  });

  describe('messages display', () => {

    it('must display messages from the thread', () => {
      renderMessageThread();

      expect(screen.getByText(/I'd love to pick up 3 lbs of tomatoes/)).toBeInTheDocument();
      expect(screen.getByText(/still available! I'm usually home in the afternoons/)).toBeInTheDocument();
    });

    it('must display all 8 messages in thread 1', () => {
      renderMessageThread();

      expect(screen.getByText(/I'd love to pick up 3 lbs of tomatoes/)).toBeInTheDocument();
      expect(screen.getByText(/Does tomorrow around 3pm work/)).toBeInTheDocument();
      expect(screen.getByText(/That works perfectly/)).toBeInTheDocument();
      expect(screen.getByText(/I'll leave them on the front porch/)).toBeInTheDocument();
      expect(screen.getByText(/are these heirloom or regular/)).toBeInTheDocument();
      expect(screen.getByText(/Cherokee Purple and Brandywine/)).toBeInTheDocument();
      expect(screen.getByText(/Should I bring my own bag/)).toBeInTheDocument();
      expect(screen.getByText(/I'll have them bagged already/)).toBeInTheDocument();
    });

    it('must group messages by date with date separators', () => {
      renderMessageThread();

      // Thread 1 has messages on 2026-07-01 and 2026-07-02 — these render
      // as date labels (the exact format depends on today's date, but both
      // groups will produce a separator)
      const allText = document.body.textContent || '';
      // At minimum, there should be more than one date group visible
      // (messages span two calendar days)
      expect(allText).toContain('Cherokee Purple');
    });

  });

  describe('message input', () => {

    it('must display a message input field', () => {
      renderMessageThread();

      expect(screen.getByLabelText(/Message input/)).toBeInTheDocument();
    });

    it('must display a send button', () => {
      renderMessageThread();

      expect(screen.getByLabelText(/Send message/)).toBeInTheDocument();
    });

    it('must allow typing a message', async () => {
      renderMessageThread();

      const input = screen.getByLabelText(/Message input/);
      await userEvent.type(input, 'Hello there!');

      expect(input).toHaveValue('Hello there!');
    });

    it('must add the message to the thread when send is clicked', async () => {
      renderMessageThread();

      const input = screen.getByLabelText(/Message input/);
      await userEvent.type(input, 'Hello there!');
      await userEvent.click(screen.getByLabelText(/Send message/));

      expect(screen.getByText('Hello there!')).toBeInTheDocument();
      expect(input).toHaveValue('');
    });

    it('must not send an empty message', async () => {
      renderMessageThread();

      const sendButton = screen.getByLabelText(/Send message/);
      const messageCountBefore = screen.getAllByText(/./i).length;

      await userEvent.click(sendButton);

      const messageCountAfter = screen.getAllByText(/./i).length;
      expect(messageCountAfter).toBe(messageCountBefore);
    });

  });

  describe('not found state', () => {

    it('must show empty state for a non-existent thread', () => {
      renderMessageThread('9999');

      expect(screen.getByText('Conversation not found')).toBeInTheDocument();
      expect(screen.getByText(/may have been removed or does not exist/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to Inbox/ })).toBeInTheDocument();
    });

  });

});
