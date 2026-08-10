import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CommunityAdmin from '@/pages/CommunityAdmin';

// user_id 1 (Lily Chen, the hardcoded CURRENT_USER_ID) is "admin" of community_id 1 only,
// per mockData.ts's mockMemberships. She's "member" of communities 2/3/4, and has no
// membership at all in 5/6.
//
// mockJoinRequests only has entries for community_id 3, and user 1 is not an admin of
// community 3 — so the populated request-list branch (handleDecision, Approve/Reject
// rendering) was previously unreachable through this page. We override
// getJoinRequestsByCommunity so community 1 always has one pending request, which lets
// us reach that branch. This does mean the truly-empty-list scenario for community 1
// specifically is no longer exercised by this file; the "empty state" test below has
// been repointed to reflect that.
vi.mock('@/data/mockData', async () => {
  const actual = await vi.importActual<typeof import('@/data/mockData')>('@/data/mockData');
  return {
    ...actual,
    getJoinRequestsByCommunity: (communityId: number) => {
      if (communityId === 1) {
        return [
          {
            request_id: 100,
            community_id: 1,
            user_id: 4, // Glen Kim — has no profile_photo_url, so this also covers the placeholder-avatar branch
            status: 'pending',
            request_date: '2026-07-05',
          },
        ];
      }
      return actual.getJoinRequestsByCommunity(communityId);
    },
  };
});

function renderCommunityAdmin(communityId: number | string) {
  return render(
    <MemoryRouter initialEntries={[`/communities/${communityId}/admin`]}>
      <Routes>
        <Route path="/communities/:id/admin" element={<CommunityAdmin />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CommunityAdmin', () => {                                       // Test Suite

  describe('access control', () => {                                    // Nested Test Suite

    it('must show "Community not found" for a nonexistent community id', () => {  // Test Case
      renderCommunityAdmin(999);

      expect(screen.getByText('Community not found')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back to Communities' })).toHaveAttribute(
        'href',
        '/communities'
      );
    });

    it('must show "Access denied" when the current user is only a member, not an admin', () => {
      renderCommunityAdmin(2); // user 1 is "member" of community 2

      expect(screen.getByText('Access denied')).toBeInTheDocument();
      expect(
        screen.getByText('Only community admins can access this page.')
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back to Community' })).toHaveAttribute(
        'href',
        '/communities/2'
      );
    });

    it('must show "Access denied" when the current user has no membership at all', () => {
      renderCommunityAdmin(5); // user 1 has no membership row for community 5

      expect(screen.getByText('Access denied')).toBeInTheDocument();
    });

    it('must render the admin page when the current user is an admin of the community', () => {
      renderCommunityAdmin(1); // user 1 is "admin" of community 1

      expect(screen.getByText('Manage: Mānoa Valley Garden Share')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back to Community' })).toHaveAttribute(
        'href',
        '/communities/1'
      );
    });

  });

  describe('tabs', () => {                                              // Nested Test Suite

    it('must show Members tab active by default', () => {                // Test Case
      renderCommunityAdmin(1);

      expect(screen.getByRole('button', { name: 'Members' })).toHaveClass('admin__tab--active');
    });

    it('must switch to the Requests tab when clicked', async () => {
      renderCommunityAdmin(1);

      await userEvent.click(screen.getByRole('button', { name: 'Requests' }));

      expect(screen.getByRole('button', { name: 'Requests' })).toHaveClass('admin__tab--active');
      // Community 1 now always has one pending join request (see mock above).
      expect(screen.getByText('Glen K.')).toBeInTheDocument();
    });

    it('must switch to the Invitations tab when clicked', async () => {
      renderCommunityAdmin(1);

      await userEvent.click(screen.getByRole('button', { name: 'Invitations' }));

      expect(screen.getByText('Invite a Member')).toBeInTheDocument();
    });

    it('must switch to the Settings tab when clicked', async () => {
      renderCommunityAdmin(1);

      await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

      expect(screen.getByText('Community Settings')).toBeInTheDocument();
    });

  });

  describe('members tab', () => {                                       // Nested Test Suite

    it('must list all 3 members of the community', () => {               // Test Case
      renderCommunityAdmin(1);

      expect(screen.getByText(/Lily C\..*\(You\)/)).toBeInTheDocument();
      expect(screen.getByText('Rose J.')).toBeInTheDocument();
      expect(screen.getByText('Oliver L.')).toBeInTheDocument();
    });

    it('must disable the role select and hide the Remove button for the current user', () => {
      renderCommunityAdmin(1);

      const selects = screen.getAllByRole('combobox');
      expect(selects[0]).toBeDisabled(); // Lily Chen — current user, first in mock order

      const removeButtons = screen.getAllByRole('button', { name: 'Remove' });
      expect(removeButtons).toHaveLength(2); // only Rose and Oliver get a Remove button
    });

    it('must update a member\'s role and show a success message', async () => {
      renderCommunityAdmin(1);
      const selects = screen.getAllByRole('combobox');

      await userEvent.selectOptions(selects[2], 'admin'); // Oliver Lee's select

      expect(screen.getByText('Member role updated.')).toBeInTheDocument();
      expect(selects[2]).toHaveValue('admin');
    });

    it('must open a confirmation modal naming the member when Remove is clicked', async () => {
      renderCommunityAdmin(1);
      const removeButtons = screen.getAllByRole('button', { name: 'Remove' });

      await userEvent.click(removeButtons[0]); // Rose Johnson's row

      expect(screen.getByRole('heading', { name: 'Remove Member' })).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to remove Rose J\. from this community\?/)
      ).toBeInTheDocument();
    });

    it('must not remove the member when the modal is canceled', async () => {
      renderCommunityAdmin(1);
      const removeButtons = screen.getAllByRole('button', { name: 'Remove' });
      await userEvent.click(removeButtons[1]); // Oliver Lee's row

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.getByText('Oliver L.')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(2);
    });

    it('must remove the member and show a success message when confirmed', async () => {
      renderCommunityAdmin(1);
      const removeButtons = screen.getAllByRole('button', { name: 'Remove' });
      await userEvent.click(removeButtons[0]); // Rose Johnson's row

      await userEvent.click(screen.getByRole('button', { name: 'Remove Member' }));

      expect(screen.queryByText('Rose J.')).not.toBeInTheDocument();
      expect(
        screen.getByText('Member has been removed from the community.')
      ).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(1);
    });

    // NOTE: I still don't have Modal.tsx's source, so I can't confidently drive its
    // own dismiss mechanism (Escape key / backdrop click / close icon — whichever it
    // uses) to exercise the kick-modal's `onOpenChange={() => setKickModal(null)}`
    // prop, which is distinct from the explicit Cancel/Remove Member button clicks
    // above. Paste Modal.tsx and I'll add a precise test for that.

  });

  describe('requests tab', () => {                                      // Nested Test Suite

    it('must show the pending join request with an avatar placeholder, name, and date', async () => {
      renderCommunityAdmin(1);

      await userEvent.click(screen.getByRole('button', { name: 'Requests' }));

      const row = screen.getByText('Glen K.').closest('.admin__request-row') as HTMLElement;
      expect(within(row).getByText('G')).toBeInTheDocument(); // placeholder avatar initial
      expect(within(row).getByText(/Requested/)).toBeInTheDocument();
      expect(within(row).getByRole('button', { name: 'Approve' })).toBeInTheDocument();
      expect(within(row).getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    });

    it('must approve a request, removing it from the list and showing a success message', async () => {
      renderCommunityAdmin(1);
      await userEvent.click(screen.getByRole('button', { name: 'Requests' }));

      await userEvent.click(screen.getByRole('button', { name: 'Approve' }));

      expect(screen.queryByText('Glen K.')).not.toBeInTheDocument();
      expect(screen.getByText('Request approved. User has been notified.')).toBeInTheDocument();
      expect(screen.getByText('No pending join requests')).toBeInTheDocument();
    });

    it('must reject a request, removing it from the list and showing a success message', async () => {
      renderCommunityAdmin(1);
      await userEvent.click(screen.getByRole('button', { name: 'Requests' }));

      await userEvent.click(screen.getByRole('button', { name: 'Reject' }));

      expect(screen.queryByText('Glen K.')).not.toBeInTheDocument();
      expect(screen.getByText('Request rejected. User has been notified.')).toBeInTheDocument();
    });

  });

  describe('invitations tab', () => {                                   // Nested Test Suite

    it('must show an error when submitting with no email', async () => {  // Test Case
      renderCommunityAdmin(1);
      await userEvent.click(screen.getByRole('button', { name: 'Invitations' }));

      await userEvent.click(screen.getByRole('button', { name: 'Send Invite' }));

      expect(screen.getByText('Email is required.')).toBeInTheDocument();
    });

    it('must show an error for an invalid email format', async () => {
      renderCommunityAdmin(1);
      await userEvent.click(screen.getByRole('button', { name: 'Invitations' }));

      // "test@test" passes the browser's native HTML5 email constraint validation
      // (so the submit event actually fires), but fails the app's own regex, which
      // requires a dot after the @. A value like "not-an-email" would be blocked by
      // the browser itself before React ever sees the submit.
      await userEvent.type(screen.getByLabelText(/^Email Address/), 'test@test');
      await userEvent.click(screen.getByRole('button', { name: 'Send Invite' }));

      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });

    it('must clear the error once the user edits the email field', async () => {
      renderCommunityAdmin(1);
      await userEvent.click(screen.getByRole('button', { name: 'Invitations' }));
      await userEvent.click(screen.getByRole('button', { name: 'Send Invite' }));
      expect(screen.getByText('Email is required.')).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/^Email Address/), 'f');

      expect(screen.queryByText('Email is required.')).not.toBeInTheDocument();
    });

    it('must show a success message and clear the field on a valid submission', async () => {
      renderCommunityAdmin(1);
      await userEvent.click(screen.getByRole('button', { name: 'Invitations' }));
      const emailInput = screen.getByLabelText(/^Email Address/) as HTMLInputElement;

      await userEvent.type(emailInput, 'friend@example.com');
      await userEvent.click(screen.getByRole('button', { name: 'Send Invite' }));

      expect(screen.getByText('Invitation sent successfully!')).toBeInTheDocument();
      expect(emailInput.value).toBe('');
    });

  });

  describe('settings tab', () => {                                      // Nested Test Suite

    it('must show the community name in the settings note', async () => {  // Test Case
      renderCommunityAdmin(1);

      await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

      expect(
        screen.getByText(/Settings for "Mānoa Valley Garden Share" can be updated here/)
      ).toBeInTheDocument();
      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });

  });

});
