import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormField, { Input, Textarea } from '@/components/ui/FormField';

describe('FormField', () => {                                            // Test Suite

  it('must render the label', () => {                                   // Test Case
    render(
      <FormField label="Email" htmlFor="email">
        <Input id="email" />
      </FormField>
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('must associate the label with the field via htmlFor', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <Input id="email" />
      </FormField>
    );

    // getByLabelText only succeeds if label's htmlFor matches the input's id
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('must render its children', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <Input id="email" placeholder="you@example.com" />
      </FormField>
    );

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('must not show a required indicator by default', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <Input id="email" />
      </FormField>
    );

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('must show a required indicator when required is true', () => {
    render(
      <FormField label="Email" htmlFor="email" required>
        <Input id="email" />
      </FormField>
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('must show helper text when provided and there is no error', () => {
    render(
      <FormField label="Email" htmlFor="email" helperText="We'll never share your email">
        <Input id="email" />
      </FormField>
    );

    expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
  });

  it('must show an error message when provided', () => {
    render(
      <FormField label="Email" htmlFor="email" error="Email is required">
        <Input id="email" />
      </FormField>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
  });

  it('must show the error instead of helper text when both are provided', () => {
    render(
      <FormField
        label="Email"
        htmlFor="email"
        helperText="We'll never share your email"
        error="Email is required"
      >
        <Input id="email" />
      </FormField>
    );

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.queryByText("We'll never share your email")).not.toBeInTheDocument();
  });

  it('must apply the error modifier class to the field wrapper when there is an error', () => {
    render(
      <FormField label="Email" htmlFor="email" error="Email is required">
        <Input id="email" />
      </FormField>
    );

    expect(screen.getByRole('alert').parentElement).toHaveClass('form-field--error');
  });
});

describe('Input', () => {                                                 // Test Suite

  it('must render as a text input accepting user input', () => {         // Test Case
    render(<Input placeholder="Type here" />);

    const input = screen.getByPlaceholderText('Type here');
    expect(input.tagName).toBe('INPUT');
  });

  it('must not have the error class by default', () => {
    render(<Input placeholder="Type here" />);

    expect(screen.getByPlaceholderText('Type here')).not.toHaveClass(
      'form-field__input--error'
    );
  });

  it('must apply the error class when hasError is true', () => {
    render(<Input placeholder="Type here" hasError />);

    expect(screen.getByPlaceholderText('Type here')).toHaveClass(
      'form-field__input--error'
    );
  });
});

describe('Textarea', () => {                                              // Test Suite

  it('must render as a textarea', () => {                                // Test Case
    render(<Textarea placeholder="Write a message" />);

    const textarea = screen.getByPlaceholderText('Write a message');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('must apply the error class when hasError is true', () => {
    render(<Textarea placeholder="Write a message" hasError />);

    expect(screen.getByPlaceholderText('Write a message')).toHaveClass(
      'form-field__input--error'
    );
  });
});