/** Brand tagline. `tone="dark"` for dark hero bands (lighter brand tint keeps AA contrast). */
export default function PageTagline({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <p className={`text-sm ${tone === 'dark' ? 'text-brand-purple-light' : 'text-brand-purple'} italic text-center mt-1 mb-6 font-medium`}>
      Know your time. Live it well.
    </p>
  );
}
