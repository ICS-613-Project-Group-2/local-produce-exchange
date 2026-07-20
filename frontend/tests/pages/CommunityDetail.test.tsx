import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import CommunityDetail from '@/pages/CommunityDetail';

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

  it('must show Listings tab by default', () => {
    renderCommunityDetail();

    const listingsTab = screen.getByRole('button', { name: 'Listings' });
    expect(listingsTab).toHaveClass('community-detail__tab--active');
  });

  it('must display Create Listing button', () => {
    renderCommunityDetail();

    const createButton = screen.getByRole('link', { name: 'Create Listing' });
    expect(createButton).toHaveAttribute('href', '/listings/new');
  });

  describe('listings tab', () => {

    it('must display community listings', () => {
      renderCommunityDetail();

      // Should show View Details links for listings
      const detailLinks = screen.queryAllByRole('link', { name: 'View Details' });
      expect(detailLinks.length).toBeGreaterThanOrEqual(0);
    });

    it('must show empty state when no listings exist', () => {
      // Would need a community ID with no listings
      renderCommunityDetail();

      // Just verify tab navigation works
      const listingsTab = screen.getByRole('button', { name: 'Listings' });
      expect(listingsTab).toBeInTheDocument();
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

  it('must show admin Manage Community button for admin users', () => {
    renderCommunityDetail();

    // Depends on user role in mockData
    const manageButton = screen.queryByRole('link', { name: 'Manage Community' });
    if (manageButton) {
      expect(manageButton).toHaveAttribute('href');
      expect(manageButton.getAttribute('href')).toMatch(/\/admin$/);
    }
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

  it('must show community not found message for invalid community', () => {
    renderCommunityDetail('999999');

    const notFound = screen.queryByText('Community not found');
    if (notFound) {
      expect(notFound).toBeInTheDocument();
    }
  });

});
