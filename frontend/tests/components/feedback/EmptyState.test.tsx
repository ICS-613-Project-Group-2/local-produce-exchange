import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '@/components/feedback/EmptyState';

describe('EmptyState', () => {                                          // Test Suite

  it('must render the title', () => {                                  // Test Case
    render(<EmptyState title="No listings found" />);

    expect(screen.getByText('No listings found')).toBeInTheDocument();
  });

  it('must render the title as a heading', () => {
    render(<EmptyState title="No listings found" />);

    expect(screen.getByRole('heading', { name: 'No listings found' })).toBeInTheDocument();
  });

  it('must not render an icon when none is provided', () => {
    render(<EmptyState title="No listings found" />);

    expect(document.querySelector('.empty-state__icon')).not.toBeInTheDocument();
  });

  it('must render an icon when provided', () => {
    render(<EmptyState title="No listings found" icon={<span>📦</span>} />);

    expect(screen.getByText('📦')).toBeInTheDocument();
  });

  it('must not render a description when none is provided', () => {
    render(<EmptyState title="No listings found" />);

    expect(document.querySelector('.empty-state__description')).not.toBeInTheDocument();
  });

  it('must render a description when provided', () => {
    render(
      <EmptyState
        title="No listings found"
        description="Try adjusting your filters"
      />
    );

    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('must not render an action when none is provided', () => {
    render(<EmptyState title="No listings found" />);

    expect(document.querySelector('.empty-state__action')).not.toBeInTheDocument();
  });

  it('must render an action when provided', () => {
    render(
      <EmptyState
        title="No listings found"
        action={<button>Clear filters</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });

  it('must apply an additional className when provided', () => {
    render(<EmptyState title="No listings found" className="empty-state--compact" />);

    expect(document.querySelector('.empty-state')).toHaveClass('empty-state--compact');
  });
});