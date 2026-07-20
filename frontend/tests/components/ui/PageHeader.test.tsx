import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader from '@/components/ui/PageHeader';

describe('PageHeader', () => {                                          // Test Suite

  it('must render the title', () => {                                  // Test Case
    render(<PageHeader title="Browse Listings" />);

    expect(screen.getByText('Browse Listings')).toBeInTheDocument();
  });

  it('must render the title as a heading', () => {
    render(<PageHeader title="Browse Listings" />);

    expect(screen.getByRole('heading', { name: 'Browse Listings', level: 1 })).toBeInTheDocument();
  });

  it('must not render a subtitle when none is provided', () => {
    render(<PageHeader title="Browse Listings" />);

    expect(document.querySelector('.page-header__subtitle')).not.toBeInTheDocument();
  });

  it('must render a subtitle when provided', () => {
    render(
      <PageHeader
        title="Browse Listings"
        subtitle="Find fresh produce near you"
      />
    );

    expect(screen.getByText('Find fresh produce near you')).toBeInTheDocument();
  });

  it('must not render an action when none is provided', () => {
    render(<PageHeader title="Browse Listings" />);

    expect(document.querySelector('.page-header__action')).not.toBeInTheDocument();
  });

  it('must render an action when provided', () => {
    render(
      <PageHeader
        title="Browse Listings"
        action={<button>Create Listing</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Create Listing' })).toBeInTheDocument();
  });

  it('must apply an additional className when provided', () => {
    render(<PageHeader title="Browse Listings" className="page-header--compact" />);

    expect(document.querySelector('.page-header')).toHaveClass('page-header--compact');
  });
});