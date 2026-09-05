import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Container } from './index';

describe('Container', () => {
  it('centers content at a max width', () => {
    render(<Container>content</Container>);
    expect(screen.getByText('content')).toHaveClass('mx-auto', 'max-w-6xl');
  });
});
