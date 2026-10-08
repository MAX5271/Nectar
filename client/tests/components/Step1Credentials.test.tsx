import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useState } from 'react';
import Step1Credentials from '../../src/components/onboarding/Step1Credentials';
import type { NectarPayload } from '../../src/types';

const basePayload: NectarPayload = {
  email: '',
  username: '',
  password: '',
  authProvider: 'local',
  age: '',
  gender: '',
  height: '',
  weight: '',
  unitSystem: '',
  planType: '',
  preferences: '',
};

// Step1Credentials is a controlled form — this harness plays the role of
// Register.tsx, owning the payload and forwarding updates back down.
function Harness({ nextStep }: { nextStep: () => void }) {
  const [payload, setPayload] = useState<NectarPayload>(basePayload);
  const updatePayload = (data: Partial<NectarPayload>) => setPayload((p) => ({ ...p, ...data }));
  return (
    <MemoryRouter>
      <Step1Credentials payload={payload} updatePayload={updatePayload} nextStep={nextStep} />
    </MemoryRouter>
  );
}

async function fillCredentials(user: ReturnType<typeof userEvent.setup>, password: string, confirm: string) {
  await user.type(screen.getByPlaceholderText('How should we call you?'), 'nectaruser');
  await user.type(screen.getByPlaceholderText('you@example.com'), 'user@example.com');
  await user.type(screen.getByPlaceholderText('Create a password'), password);
  await user.type(screen.getByPlaceholderText('Type it again'), confirm);
}

describe('Step1Credentials — confirm password', () => {
  it('blocks continuing when the two password fields do not match', async () => {
    const user = userEvent.setup();
    const nextStep = vi.fn();
    render(<Harness nextStep={nextStep} />);

    await fillCredentials(user, 'correct-horse', 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(nextStep).not.toHaveBeenCalled();
    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();
  });

  it('continues once both password fields match', async () => {
    const user = userEvent.setup();
    const nextStep = vi.fn();
    render(<Harness nextStep={nextStep} />);

    await fillCredentials(user, 'correct-horse', 'correct-horse');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(nextStep).toHaveBeenCalledTimes(1);
  });

  it('clears the mismatch error as soon as the confirm field is edited again', async () => {
    const user = userEvent.setup();
    const nextStep = vi.fn();
    render(<Harness nextStep={nextStep} />);

    await fillCredentials(user, 'correct-horse', 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Type it again'), '!');
    expect(screen.queryByText("Passwords don't match.")).not.toBeInTheDocument();
  });
});
