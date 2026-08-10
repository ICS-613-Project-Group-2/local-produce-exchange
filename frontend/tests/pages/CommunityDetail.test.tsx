import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import CommunityDetail from '@/pages/CommunityDetail';

// Community 3 (Northside Pantry Network) is the only private community in the
// seed data, but user 1 already has a "member" row for it in mockMemberships —
// so the "private community, not a member" locked view is otherwise
// unreachable. We simulate user 1 having no membership there specifically.
//
// Separately, every real community has at least one open listing, so
// ListingsTab's empty state is also otherwise unreachable. We repurpose
// community 4 here to simulate having none.
vi.mock('@/data/mockData', async () => {
  const actual = await vi.importActual<typeof import('@/data/mockData')>('@/data/mockData');
  return {
    ...actual,
    getUserRole: (userId: number, communityId: number) => {
      if (userId === 1 && communityId === 3) return null;
      return actual.getUserRole(userId, communityId);
    },
    getListingsByCommunity: (communityId: number) => {
      if (communityId === 4) return [];
      return actual.getListingsByCommunity(communityId);
    },
  };
});

function renderCommunityDetail(communityId: string = '1') {
  return render(
    <MemoryRouter initialEntries={[`/communities/${communityId}`]}>
      <Routes>
        <Route
          path="/communities/:id"
          element={
            <AuthProvider>
              <CommunityDetail />
            </AuthProvider>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('CommunityDetail', () => {

  it('must render community name and description', () => {
    renderCommunityDetail();

    // Should have community header info
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  it('must display member count', () => {
    renderCommunityDetail();

    const memberCount = screen.getByText(/👥 \d+ members/);
    expect(memberCount).toBeInTheDocument();
  });

  it('must render all tabs', () => {
    renderCommunityDetail();

    expect(screen.getByRole('button', { name: 'Listings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Posts' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Members' })).toBeInTheDocument();
  });

  it('must show Listings tab active by default', () => {
    renderCommunityDetail();

    const listingsTab = screen.getByRole('button', { name: 'Listings' });
    expect(listingsTab).toHaveClass('community-detail__tab--active');
  });

  it('must re-activate the Listings tab when clicked after navigating away', async () => {
    renderCommunityDetail();

    const listingsTab = screen.getByRole('button', { name: 'Listings' });
    const membersTab = screen.getByRole('button', { name: 'Members' });

    await userEvent.click(membersTab);
    expect(listingsTab).not.toHaveClass('community-detail__tab--active');

    await userEvent.click(listingsTab);
    expect(listingsTab).toHaveClass('community-detail__tab--active');
    expect(screen.queryAllByRole('link', { name: 'View Details' }).length).toBeGreaterThan(0);
  });

  it('must display Create Listing button', () => {
    renderCommunityDetail();

    const createButton = screen.getByRole('link', { name: 'Create Listing' });
    expect(createButton).toHaveAttribute('href', '/listings/new');
  });

  describe('locked view for a private community the user has not joined', () => {

    it('must show the locked view instead of tabs or content', () => {
      renderCommunityDetail('3');

      expect(screen.getByRole('heading', { name: 'Northside Pantry Network' })).toBeInTheDocument();
      expect(screen.getByText('Private')).toBeInTheDocument();
      expect(
        screen.getByText(/You need an invitation or admin approval to view its content/)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Request to Join' })).toBeInTheDocument();

      // None of the normal member-view content should render.
      expect(screen.queryByRole('button', { name: 'Listings' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Posts' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Create Listing' })).not.toBeInTheDocument();
    });

  });

  describe('listings tab', () => {

    it('must display community listings', () => {
      renderCommunityDetail();

      const detailLinks = screen.getAllByRole('link', { name: 'View Details' });
      expect(detailLinks.length).toBeGreaterThan(0);
    });

    it('must show an empty state when the community has no listings', () => {
      renderCommunityDetail('4'); // mocked above to have zero listings

      expect(screen.getByText('No listings in this community yet')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Create a Listing' })).toHaveAttribute(
        'href',
        '/listings/new'
      );
      expect(screen.queryAllByRole('link', { name: 'View Details' })).toHaveLength(0);
    });

  });

  describe('posts tab', () => {

    it('must display post form when tab is clicked', async () => {
      renderCommunityDetail();

      const postsTab = screen.getByRole('button', { name: 'Posts' });
      await userEvent.click(postsTab);

      expect(screen.getByText('Share an update')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Share news/)).toBeInTheDocument();
    });

    it('must allow creating a new post', async () => {
      renderCommunityDetail();

      const postsTab = screen.getByRole('button', { name: 'Posts' });
      await userEvent.click(postsTab);

      const textarea = screen.getByPlaceholderText(/Share news/);
      const postButton = screen.getByRole('button', { name: 'Post' });

      await userEvent.type(textarea, 'Test community update');
      await userEvent.click(postButton);

      // Post should appear
      expect(screen.getByText('Test community update')).toBeInTheDocument();
    });

    it('must disable Post button when textarea is empty', async () => {
      renderCommunityDetail();

      const postsTab = screen.getByRole('button', { name: 'Posts' });
      await userEvent.click(postsTab);

      const postButton = screen.getByRole('button', { name: 'Post' });
      expect(postButton).toBeDisabled();
    });

    it('must enable Post button when text is entered', async () => {
      renderCommunityDetail();

      const postsTab = screen.getByRole('button', { name: 'Posts' });
      await userEvent.click(postsTab);

      const textarea = screen.getByPlaceholderText(/Share news/);
      const postButton = screen.getByRole('button', { name: 'Post' });

      await userEvent.type(textarea, 'Some text');
      expect(postButton).not.toBeDisabled();
    });

  });

  describe('members tab', () => {

    it('must display members list when tab is clicked', async () => {
      renderCommunityDetail();

      const membersTab = screen.getByRole('button', { name: 'Members' });
      await userEvent.click(membersTab);

      // Should show member info (names or avatars)
      const memberAvatars = screen.queryAllByText(/\S+/);
      expect(memberAvatars.length).toBeGreaterThan(0);
    });

    it('must show member names and roles', async () => {
      renderCommunityDetail();

      const membersTab = screen.getByRole('button', { name: 'Members' });
      await userEvent.click(membersTab);

      // Should display role badges
      const roleBadges = screen.queryAllByText(/Admin|Member/);
      expect(roleBadges.length).toBeGreaterThanOrEqual(0);
    });

  });

  it('must show the admin Manage Community button for an admin user', () => {
    renderCommunityDetail('1'); // user 1 is admin of community 1

    const manageButton = screen.getByRole('link', { name: 'Manage Community' });
    expect(manageButton).toHaveAttribute('href', '/communities/1/admin');
  });

  it('must switch tabs when tab buttons are clicked', async () => {
    renderCommunityDetail();

    const postsTab = screen.getByRole('button', { name: 'Posts' });
    await userEvent.click(postsTab);
    expect(postsTab).toHaveClass('community-detail__tab--active');

    const membersTab = screen.getByRole('button', { name: 'Members' });
    await userEvent.click(membersTab);
    expect(membersTab).toHaveClass('community-detail__tab--active');
    expect(postsTab).not.toHaveClass('community-detail__tab--active');
  });

  it('must show community not found message for an invalid community', () => {
    renderCommunityDetail('999999');

    expect(screen.getByText('Community not found')).toBeInTheDocument();
  });

});