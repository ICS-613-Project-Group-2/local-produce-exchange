import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import About from '@/pages/About';

function renderAbout() {
  return render(
    <MemoryRouter>
      <About />
    </MemoryRouter>
  );
}

describe('About', () => {                                              // Test Suite

  it('must render the main heading', () => {                          // Test Case
    renderAbout();

    expect(screen.getByRole('heading', { name: 'About Green Beans', level: 1 })).toBeInTheDocument();
  });

  it('must render the main section headings', () => {
    renderAbout();

    expect(screen.getByRole('heading', { name: 'Our Mission' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How It Works' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Community Safety & Trust' })).toBeInTheDocument();
  });

  it('must render a Sign Up CTA link pointing to /signup', () => {
    renderAbout();

    const signUpLinks = screen.getAllByRole('link', { name: 'Sign Up' });
    expect(signUpLinks[signUpLinks.length - 1]).toHaveAttribute('href', '/signup');
  });

  it('must render a Browse Listings CTA link pointing to /browse', () => {
    renderAbout();

    expect(screen.getByRole('link', { name: 'Browse Listings' })).toHaveAttribute('href', '/browse');
  });

  it('must render a Find a Community CTA link pointing to /communities', () => {
    renderAbout();

    expect(screen.getByRole('link', { name: 'Find a Community' })).toHaveAttribute('href', '/communities');
  });

  it('must render all four team member names', () => {
    renderAbout();

    expect(screen.getByText('Jolie')).toBeInTheDocument();
    expect(screen.getByText('Kayla-Marie')).toBeInTheDocument();
    expect(screen.getByText('Victor')).toBeInTheDocument();
    expect(screen.getByText('Jiyeon')).toBeInTheDocument();
  });
});