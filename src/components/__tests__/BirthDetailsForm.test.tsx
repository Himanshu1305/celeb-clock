// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { BirthDetailsForm } from '../BirthDetailsForm';

afterEach(cleanup);
const q = (id: string) => document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
const city = { name: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 };

describe('BirthDetailsForm', () => {
  it('pre-fills from initial and submits those details', () => {
    const onSubmit = vi.fn();
    render(<BirthDetailsForm testIdPrefix="kundali" submitLabel="Go" onSubmit={onSubmit}
      initial={{ dob: '1988-11-05', time: '12:30', city }} />);
    const btn = q('kundali-generate-btn') as HTMLButtonElement;
    expect(btn.disabled).toBe(false); // valid → enabled
    expect(q('kundali-validation-hint')).toBeNull();
    fireEvent.click(btn);
    expect(onSubmit).toHaveBeenCalledWith({ dob: '1988-11-05', time: '12:30', city });
  });

  it('empty form: submit disabled + friendly validation hint shown', () => {
    render(<BirthDetailsForm testIdPrefix="kundali" submitLabel="Go" onSubmit={() => {}} />);
    expect((q('kundali-generate-btn') as HTMLButtonElement).disabled).toBe(true);
    expect(q('kundali-validation-hint')?.textContent).toMatch(/date of birth, birth time, and birth city/i);
  });

  it('opt-in save checkbox renders only when requested and reports toggles', () => {
    const onSave = vi.fn();
    const { rerender } = render(<BirthDetailsForm testIdPrefix="kundali" submitLabel="Go" onSubmit={() => {}} />);
    expect(q('kundali-save-optin')).toBeNull(); // hidden by default

    rerender(<BirthDetailsForm testIdPrefix="kundali" submitLabel="Go" onSubmit={() => {}}
      showSaveOption saveChecked={false} onSaveCheckedChange={onSave} />);
    const optin = q('kundali-save-optin');
    expect(optin?.textContent).toMatch(/save my birth details/i);
    fireEvent.click(optin!.querySelector('input')!);
    expect(onSave).toHaveBeenCalledWith(true);
  });
});
