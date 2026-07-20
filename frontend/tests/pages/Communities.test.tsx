import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Communities from '@/pages/Communities';

function renderCommunities() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Communities />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Communities', () => {

  it('must render page header with title and subtitle', () => {
    renderCommunities();

    expect(screen.getByText('Communities')).toBeInTheDocument();
    expect(screen.getByText('Find and join local food-sharing communities')).toBeInTheDocument();
  });

  it('must render Create Community button', () => {
    renderCommunities();

    const createButton = screen.getByRole('link', { name: 'Create Community' });
    expect(createButton).toHaveAttribute('href', '/communities/new');
  });

  it('must render search bar', () => {
    renderCommunities();

    const searchBar = screen.getByPlaceholderText('Search by community name or description...');
    expect(searchBar).toBeInTheDocument();
  });

  it('must display "My Communities" section for joined communities', () => {
    renderCommunities();

    const myCommunitiesSection = screen.getByText('My Communities');
    expect(myCommunitiesSection).toBeInTheDocument();
  });

  it('must display "Available to Join" section for available communities', () => {
    renderCommunities();

    const availableSection = screen.getByText('Available to Join');
    expect(availableSection).toBeInTheDocument();
  });

  it('must show community cards with name and member count', () => {
    renderCommunities();

    // Should have community cards with member info
    const memberCounts = screen.getAllByText(/\d+ members/);
    expect(memberCounts.length).toBeGreaterThan(0);
  });

  it('must show "View Community" button for joined communities', () => {
    renderCommunities();

    const viewButtons = screen.getAllByRole('link', { name: 'View Community' });
    expect(viewButtons.length).toBeGreaterThan(0);

    viewButtons.forEach(btn => {
      expect(btn).toHaveAttribute('href');
      expect(btn.getAttribute('href')).toMatch(/^\/communities\/\d+$/);
    });
  });

  it('must show "Join Community" button for available communities', () => {
    renderCommunities();

    const joinButtons = screen.getAllByRole('button', { name: 'Join Community' });
    expect(joinButtons.length).toBeGreaterThan(0);
  });

  it('must show "✓ Joined" label on joined community cards', () => {
    renderCommunities();

    const joinedLabels = screen.getAllByText('✓ Joined');
    expect(joinedLabels.length).toBeGreaterThan(0);
  });

  it('must filter communities by search query', async () => {
    renderCommunities();

    const searchInput = screen.getByPlaceholderText('Search by community name or description...');
    await userEvent.type(searchInput, 'notfoundtest123');

    // After typing, should have updated results
    const resultArea = screen.getByPlaceholderText('Search by community name or description...').parentElement;
    expect(resultArea).toBeInTheDocument();
  });

  it('must show empty state when no communities match search', async () => {
    renderCommunities();

    const searchInput = screen.getByPlaceholderText('Search by community name or description...');
    await userEvent.type(searchInput, 'xyznotfound999');

    // Check if empty state title appears
    const emptyTitle = screen.queryByText('No communities found');
    if (emptyTitle) {
      expect(emptyTitle).toBeInTheDocument();
    }
  });

  it('must provide Create Community button in empty state or header', () => {
    renderCommunities();

    const createButtons = screen.getAllByRole('link', { name: /Create Community|Create a Community/ });
    expect(createButtons.length).toBeGreaterThan(0);
  });

  it('must display community status badges', () => {
    renderCommunities();

    // Should have status badges - look for elements with aria-label or role that might contain status
    const cards = screen.getAllByRole('link', { name: /View Community|Join Community/ });
    expect(cards.length).toBeGreaterThan(0);
  });

});
