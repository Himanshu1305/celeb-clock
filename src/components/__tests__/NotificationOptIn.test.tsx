// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { NotificationOptIn } from '../NotificationOptIn';

describe('NotificationOptIn', () => {
  afterEach(() => cleanup());
  beforeEach(() => { vi.restoreAllMocks(); });

  it('disables the chart-dependent channels when the Moon sign is unknown', () => {
    render(<NotificationOptIn defaultEmail="a@b.com" rashiIndex={null} />);
    // Daily horoscope + transit alerts require a Moon sign → their switches are disabled.
    const switches = screen.getAllByRole('switch');
    // daily, transit disabled; weekly enabled; whatsapp disabled
    const disabled = switches.filter((s) => s.getAttribute('aria-disabled') === 'true' || (s as HTMLButtonElement).disabled);
    expect(disabled.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Create your Kundli first/i)).toBeTruthy();
  });

  it('posts explicit opt-in preferences including rashiIndex when known', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<NotificationOptIn defaultEmail="user@example.com" rashiIndex={4} />);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/subscribe');
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body.consent).toBe(true);
    expect(body.email).toBe('user@example.com');
    expect(body.rashiIndex).toBe(4);
    await waitFor(() => expect(screen.getByText(/Saved\./i)).toBeTruthy());
  });

  it('rejects an invalid email without calling the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<NotificationOptIn defaultEmail="not-an-email" rashiIndex={0} />);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    await waitFor(() => expect(screen.getByText(/valid email/i)).toBeTruthy());
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
