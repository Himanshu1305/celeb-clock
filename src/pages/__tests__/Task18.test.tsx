// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: () => ({ select: () => ({ eq: async () => ({ data: [], error: null }) }), insert: async () => ({ error: null }), delete: () => ({ eq: async () => ({ error: null }) }) }) } }));

import RemindersPage from '../RemindersPage';

const renderReminders = () =>
  render(<HelmetProvider><MemoryRouter initialEntries={['/reminders']}><RemindersPage /></MemoryRouter></HelmetProvider>);
const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('TC-REMIND', () => {
  afterEach(() => cleanup());

  it('TC-REMIND-P-01: /reminders renders', () => { renderReminders(); expect(q('reminders-page')).toBeTruthy(); });
  it('TC-REMIND-P-02: friend name input', () => { renderReminders(); expect(q('remind-friend-name')).toBeTruthy(); });
  it('TC-REMIND-P-03: friend DOB input', () => { renderReminders(); expect(q('remind-friend-dob')).toBeTruthy(); });
  it('TC-REMIND-P-04: add button disabled without name+DOB', () => { renderReminders(); expect((q('remind-add-btn') as HTMLButtonElement)?.disabled).toBe(true); });
  it('TC-REMIND-N-01: no undefined', () => { renderReminders(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-REMIND-N-02: no crash on render', () => expect(() => renderReminders()).not.toThrow());
  it('TC-REMIND-EDGE-01: Feb 29 birthday accepted', () => { renderReminders(); const dob = q('remind-friend-dob') as HTMLInputElement; if (dob) fireEvent.change(dob, { target: { value: '1988-02-29' } }); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-REMIND-EDGE-02: relationship field present', () => { renderReminders(); expect(q('remind-relationship')).toBeTruthy(); });
});
