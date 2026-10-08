// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PanchangPage from '../PanchangPage';

afterEach(cleanup);

function renderPath(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/panchang" element={<PanchangPage />} />
          <Route path="/panchang/:city" element={<PanchangPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('Panchang page', () => {
  it('renders five limbs, sun times, windows and both choghadiya sets', () => {
    const { getByTestId } = renderPath('/panchang');
    expect(getByTestId('panchang-limbs')).toBeTruthy();
    expect(getByTestId('panchang-sun').textContent).toMatch(/Sunrise/);
    expect(getByTestId('panchang-windows').textContent).toMatch(/Rahu Kaal/);
    const chog = getByTestId('panchang-choghadiya');
    // 8 day + 8 night rows
    expect(chog.querySelectorAll('.tabular-nums').length).toBeGreaterThanOrEqual(16);
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('NaN');
  });

  it('defaults to a valid city and offers a city switcher', () => {
    const { getByTestId } = renderPath('/panchang/mumbai');
    expect(getByTestId('panchang-cities').querySelectorAll('button').length).toBe(10);
  });

  it('switching city does not crash', () => {
    const { getByTestId } = renderPath('/panchang');
    const btns = getByTestId('panchang-cities').querySelectorAll('button');
    expect(() => fireEvent.click(btns[4])).not.toThrow();
  });
});
