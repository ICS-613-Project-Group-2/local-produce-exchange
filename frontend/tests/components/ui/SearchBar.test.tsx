import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/components/ui/SearchBar';

describe('SearchBar', () => {                                          // Test Suite

  it('must render with the default placeholder', () => {               // Test Case
    render(<SearchBar onSearch={() => {}} />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('must render with a custom placeholder', () => {
    render(<SearchBar onSearch={() => {}} placeholder="Find produce" />);

    expect(screen.getByPlaceholderText('Find produce')).toBeInTheDocument();
  });

  it('must render with a default value', () => {
    render(<SearchBar onSearch={() => {}} defaultValue="tomatoes" />);

    expect(screen.getByDisplayValue('tomatoes')).toBeInTheDocument();
  });

  it('must not show the clear button when the input is empty', () => {
    render(<SearchBar onSearch={() => {}} />);

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('must show the clear button once the user types something', async () => {
    render(<SearchBar onSearch={() => {}} />);

    await userEvent.type(screen.getByRole('textbox', { name: 'Search...' }), 'kale');

    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
  });

  it('must call onSearch with the trimmed query when the form is submitted', async () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);

    await userEvent.type(screen.getByRole('textbox', { name: 'Search...' }), '  kale  ');
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(handleSearch).toHaveBeenCalledWith('kale');
  });

  it('must call onSearch with an empty string and clear the input when the clear button is clicked', async () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);

    await userEvent.type(screen.getByRole('textbox', { name: 'Search...' }), 'kale');
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(handleSearch).toHaveBeenCalledWith('');
    expect(screen.getByRole('textbox', { name: 'Search...' })).toHaveValue('');
  });

  it('must submit the current value when Enter is pressed', async () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);

    await userEvent.type(screen.getByRole('textbox', { name: 'Search...' }), 'kale{Enter}');

    expect(handleSearch).toHaveBeenCalledWith('kale');
  });
});