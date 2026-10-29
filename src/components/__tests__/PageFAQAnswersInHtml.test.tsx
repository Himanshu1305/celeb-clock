// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { PageFAQ } from '../PageFAQ';

/**
 * The FAQ accordion must put every ANSWER in the HTML (collapsed with CSS), not only
 * after a click — the prerender snapshot is what crawlers read, and the page's
 * FAQPage JSON-LD must match visible page content.
 */
const items = [
  { question: 'First question?', answer: 'First answer text that must be in the HTML.' },
  { question: 'Second question?', answer: 'Second answer text, also in the HTML.' },
];

afterEach(cleanup);

describe('PageFAQ accordion', () => {
  it('renders every answer into the DOM while closed, hidden by CSS', () => {
    const { container } = render(<PageFAQ items={items} />);
    const regions0 = [...container.querySelectorAll('[role="region"]')].map(r => r.textContent);
    expect(regions0).toEqual(items.map(f => f.answer));
    const regions = container.querySelectorAll('[role="region"]');
    expect(regions).toHaveLength(2);
    regions.forEach(r => {
      expect(r.getAttribute('data-state')).toBe('closed');
      expect(r.className).toContain('data-[state=closed]:hidden');
    });
  });

  it('still opens and closes on click', () => {
    const { getByText, container } = render(<PageFAQ items={items} />);
    fireEvent.click(getByText('First question?'));
    expect(container.querySelectorAll('[role="region"]')[0].getAttribute('data-state')).toBe('open');
    fireEvent.click(getByText('First question?'));
    expect(container.querySelectorAll('[role="region"]')[0].getAttribute('data-state')).toBe('closed');
  });

  it('FAQPage JSON-LD answers equal the visible answers', () => {
    const { container } = render(<PageFAQ items={items} />);
    const ld = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    const answers = ld.mainEntity.map((q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text);
    const visible = container.cloneNode(true) as HTMLElement;
    visible.querySelectorAll('script').forEach(s => s.remove());
    for (const a of answers) expect(visible.textContent).toContain(a);
  });
});
