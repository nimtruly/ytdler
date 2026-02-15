import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders YouTube Downloader heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/YouTube Downloader/i);
  expect(headingElement).toBeInTheDocument();
});
