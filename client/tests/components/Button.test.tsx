import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../src/components/ui/Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Save changes</Button>);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.click(screen.getByRole('button', { name: 'Click me' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables itself and shows a spinner while loading', () => {
    render(<Button loading>Building your plan…</Button>);
    const button = screen.getByRole('button', { name: /building your plan/i });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('stays disabled when explicitly disabled, independent of loading', () => {
    render(<Button disabled>Can't submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not fire onClick while disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );

    await user.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });
});
