import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ToastProvider, Toaster, toast, useToast } from './index';

function Trigger() {
  const { show } = useToast();
  return <button onClick={() => show('from useToast', 'error')}>show</button>;
}

describe('Toast', () => {
  it('queues toast() calls into the Toaster', () => {
    render(<Toaster />);
    act(() => toast('from toast()'));
    expect(screen.getByText('from toast()')).toBeInTheDocument();
  });

  it('shares one queue between toast() and useToast().show()', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    act(() => {
      toast('one');
      screen.getByText('show').click();
    });
    // one store: both APIs render in the same list
    expect(screen.getByText('one').closest('[role="status"]')).not.toBeNull();
    expect(screen.getByText('from useToast').closest('[role="alert"]')).not.toBeNull();
  });
});
