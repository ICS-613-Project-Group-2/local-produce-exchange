import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge, { type BadgeStatus } from '@/components/ui/StatusBadge';

describe('StatusBadge', () => {                                        // Test Suite

  it('must render the default label for a given status', () => {       // Test Case
    render(<StatusBadge status="available" />);

    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('must apply the status-specific class name', () => {
    render(<StatusBadge status="expiring-soon" />);

    const badge = screen.getByText('Expiring Soon');
    expect(badge).toHaveClass('badge', 'badge--expiring-soon');
  });

  it('must render a custom label when provided, overriding the default', () => {
    render(<StatusBadge status="pending" label="Awaiting Review" />);

    expect(screen.getByText('Awaiting Review')).toBeInTheDocument();
    expect(screen.queryByText('Pending')).not.toBeInTheDocument();
  });

  it('must append an additional className when provided', () => {
    render(<StatusBadge status="approved" className="badge--large" />);

    const badge = screen.getByText('Approved');
    expect(badge).toHaveClass('badge--large');
  });

  it.each<BadgeStatus>([
    'available',
    'reserved',
    'picked-up',
    'closed',
    'completed',
    'canceled',
    'denied',
    'error',
    'public',
    'private',
  ])('must render the correct default label for status "%s"', (status) => {
    render(<StatusBadge status={status} />);

    expect(screen.getByText(new RegExp(status.replace('-', ' '), 'i'))).toBeInTheDocument();
  });
});