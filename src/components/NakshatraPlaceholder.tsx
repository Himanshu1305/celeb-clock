export function NakshatraPlaceholder() {
  return (
    <div data-testid="nakshatra-placeholder"
         className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
      <div className="flex gap-3"><span className="text-xl">🌙</span>
        <div>
          <div className="font-semibold text-amber-800">Nakshatra (Birth Star)</div>
          <p className="text-sm text-amber-700 mt-1">
            Accurate Nakshatra requires exact birth time and location.</p>
          <a href="/birthday-report" data-testid="nakshatra-cta"
             className="inline-block mt-2 text-xs font-bold text-amber-600 underline">
            Enter birth time for precise Nakshatra →</a>
        </div>
      </div>
    </div>
  );
}
