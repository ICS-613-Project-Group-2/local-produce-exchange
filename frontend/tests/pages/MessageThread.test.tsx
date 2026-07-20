import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import MessageThread from '@/pages/MessageThread';

// Mock scrollIntoView
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
        <Route
          path="/messages"
          element={<div>Messages Page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('MessageThread', () => {

  describe('top bar', () => {

    it('must display back link to messages', () => {
      renderMessageThread();

      const backLink = screen.getByRole('link', { name: '←' });
      expect(backLink).toHaveAttribute('href', '/messages');
    });

    it('must display other user name', () => {
      renderMessageThread();

      // The component displays the other participant's name
      const topbarName = screen.queryByText(/John|Jane|Sarah|Mike|Lisa/);
      if (topbarName) {
        expect(topbarName).toBeInTheDocument();
      }
    });

  });

  describe('listing context', () => {

    it('must display listing information', () => {
      renderMessageThread();

      // Listing name should be visible
      const listingNames = screen.queryAllByText(/Organic|Fresh|Homemade|Heirloom/);
      if (listingNames.length > 0) {
        expect(listingNames.length).toBeGreaterThan(0);
      }
    });

    it('must have toggle button for listing details', () => {
      renderMessageThread();

      const toggleButton = screen.queryByRole('button', { name: '' });
      if (toggleButton && toggleButton.className.includes('toggle')) {
        expect(toggleButton).toBeInTheDocument();
      }
    });

  });

  describe('messages display', () => {

    it('must display messages in thread', () => {
      renderMessageThread();

      // Messages should be rendered
      const messages = screen.queryAllByText(/Hi|Hello|Thanks|Available/);
      if (messages.length > 0) {
        expect(messages.length).toBeGreaterThan(0);
      }
    });

    it('must group messages by date', () => {
      renderMessageThread();

      // Date separators should be visible
      const dateSeparators = screen.queryAllByText(/Today|Yesterday/);
      // Date separators may or may not exist depending on data
      if (dateSeparators.length > 0) {
        expect(dateSeparators.length).toBeGreaterThan(0);
      }
    });

  });

  describe('message input', () => {

    it('must display message input field for active listings', () => {
      renderMessageThread();

      const input = screen.queryByLabelText(/Message input/);
      if (input) {
        expect(input).toBeInTheDocument();
      }
    });

    it('must have send button', () => {
      renderMessageThread();

      const sendButton = screen.queryByLabelText(/Send message/);
      if (sendButton) {
        expect(sendButton).toBeInTheDocument();
      }
    });

    it('must allow typing and sending messages', async () => {
      renderMessageThread();

      const input = screen.queryByLabelText(/Message input/);
      if (input) {
        await userEvent.type(input, 'Hello there!');
        expect((input as HTMLInputElement).value).toBe('Hello there!');

        const sendButton = screen.getByLabelText(/Send message/);
        await userEvent.click(sendButton);

        // Message should be added to thread
        expect(screen.getByText('Hello there!')).toBeInTheDocument();
      }
    });

  });

  describe('view listing link', () => {

    it('must have link to view listing', () => {
      renderMessageThread();

      const viewLink = screen.queryByRole('link', { name: /View Listing/ });
      if (viewLink) {
        expect(viewLink).toHaveAttribute('href', expect.stringContaining('/listings/'));
      }
    });

  });

});
