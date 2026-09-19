import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ColorModeToggle, applyStoredColorMode } from './index';

describe('ColorModeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.kvMode = 'light';
  });

  it('starts on system and cycles light → dark → system, writing data-kv-mode', () => {
    render(<ColorModeToggle />);
    const btn = screen.getByRole('button');
    expect(['light', 'dark']).toContain(document.documentElement.dataset.kvMode);
    fireEvent.click(btn);
    expect(localStorage.getItem('kv_mode')).toBe('light');
    expect(document.documentElement.dataset.kvMode).toBe('light');
    fireEvent.click(btn);
    expect(localStorage.getItem('kv_mode')).toBe('dark');
    expect(document.documentElement.dataset.kvMode).toBe('dark');
    fireEvent.click(btn);
    expect(localStorage.getItem('kv_mode')).toBe('system');
    expect(['light', 'dark']).toContain(document.documentElement.dataset.kvMode);
  });

  it('applyStoredColorMode restores the saved choice before render', () => {
    localStorage.setItem('kv_mode', 'dark');
    applyStoredColorMode();
    expect(document.documentElement.dataset.kvMode).toBe('dark');
  });
});
