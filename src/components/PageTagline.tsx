/** Brand tagline. `tone="dark"` for dark hero bands (lighter brand tint keeps AA contrast). */
export default function PageTagline({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <p className={`text-sm ${tone === 'dark' ? 'text-[#B4A6DB]' : 'text-[#6E5AA6]'} italic text-center mt-1 mb-6 font-medium`}>
      Know your time. Live it well.
    </p>
  );
}
