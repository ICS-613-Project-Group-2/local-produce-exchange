import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card, { CardImage, CardBody, CardFooter } from '@/components/ui/Card';

describe('Card', () => {                                              // Test Suite

  it('must render its children', () => {                              // Test Case
    render(<Card>Hello world</Card>);

    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('must apply the default variant and padding classes', () => {
    render(<Card>Content</Card>);

    expect(screen.getByText('Content')).toHaveClass('card--default', 'card--pad-md');
  });

  it('must apply the correct classes when variant and padding are provided', () => {
    render(
      <Card variant="warm" padding="lg">
        Content
      </Card>
    );

    expect(screen.getByText('Content')).toHaveClass('card--warm', 'card--pad-lg');
  });

  it('must append an additional className when provided', () => {
    render(<Card className="card--highlighted">Content</Card>);

    expect(screen.getByText('Content')).toHaveClass('card--highlighted');
  });
});

describe('CardImage', () => {                                          // Test Suite

  it('must render an image with the given src and alt text', () => {  // Test Case
    render(<CardImage src="/photo.jpg" alt="A basket of tomatoes" />);

    const image = screen.getByRole('img', { name: 'A basket of tomatoes' });
    expect(image).toHaveAttribute('src', '/photo.jpg');
  });

  it('must default to a 4/3 aspect ratio', () => {
    render(<CardImage src="/photo.jpg" alt="A basket of tomatoes" />);

    const image = screen.getByRole('img');
    expect(image.parentElement).toHaveStyle({ aspectRatio: '4/3' });
  });

  it('must apply a custom aspect ratio when provided', () => {
    render(<CardImage src="/photo.jpg" alt="A basket of tomatoes" aspectRatio="1/1" />);

    const image = screen.getByRole('img');
    expect(image.parentElement).toHaveStyle({ aspectRatio: '1/1' });
  });
});

describe('CardBody', () => {                                           // Test Suite

  it('must render its children', () => {                              // Test Case
    render(<CardBody>Body content</CardBody>);

    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {                                         // Test Suite

  it('must render its children', () => {                              // Test Case
    render(<CardFooter>Footer content</CardFooter>);

    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});