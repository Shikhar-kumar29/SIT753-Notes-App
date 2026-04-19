import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import React from 'react';

describe('App Component', () => {
  it('renders the application title', () => {
    render(<App />);
    expect(screen.getByText(/SIT753 Notes/i)).toBeDefined();
  });

  it('renders the folders list', () => {
    render(<App />);
    expect(screen.getByText(/General/i)).toBeDefined();
    expect(screen.getByText(/Work/i)).toBeDefined();
  });
});
