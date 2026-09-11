// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

const resolveConflict = vi.fn();
let mockState: any = { conflict: null, resolveConflict };
vi.mock('@/hooks/useSavedProfile', () => ({ useSavedProfile: () => mockState }));

import { ProfileConflictNotice } from '../ProfileConflictNotice';

afterEach(() => { cleanup(); resolveConflict.mockClear(); });

const DEVICE = { dob: '1988-11-05', time: '12:30', city: { name: 'Delhi' } };
const ACCOUNT = { dob: '1990-04-20', time: '09:15', city: { name: 'Mumbai' } };

describe('ProfileConflictNotice (Part L Item 1)', () => {
  it('renders NOTHING when there is no conflict (invisible for the common case)', () => {
    mockState = { conflict: null, resolveConflict };
    render(<ProfileConflictNotice />);
    expect(screen.queryByTestId('profile-conflict-notice')).toBeNull();
  });

  it('surfaces the conflict with BOTH profiles shown (account default, device option)', () => {
    mockState = { conflict: { account: ACCOUNT, device: DEVICE }, resolveConflict };
    render(<ProfileConflictNotice />);
    const notice = screen.getByTestId('profile-conflict-notice');
    expect(notice.textContent).toMatch(/1990-04-20/); // account details shown
    expect(notice.textContent).toMatch(/Mumbai/);
    expect(notice.textContent).toMatch(/1988-11-05/); // device details shown
    expect(notice.textContent).toMatch(/Delhi/);
  });

  it('"Keep my account details" resolves to account; "Use this device" resolves to device', () => {
    mockState = { conflict: { account: ACCOUNT, device: DEVICE }, resolveConflict };
    render(<ProfileConflictNotice />);
    fireEvent.click(screen.getByTestId('conflict-keep-account'));
    expect(resolveConflict).toHaveBeenCalledWith('account');
    fireEvent.click(screen.getByTestId('conflict-use-device'));
    expect(resolveConflict).toHaveBeenCalledWith('device');
  });
});
