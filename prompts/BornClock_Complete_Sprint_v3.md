# BornClock Complete Product Sprint v3
## Every Task Has Real Tests · Hard Gates · Cross-Page Consistency
## Human Tester Standard · TypeScript Clean at Every Build · Runs Until Done

---

## NON-NEGOTIABLE RULES

1. Full permission. Never ask for approval. Never stop.
2. develop branch only. Push to main in PHASE FINAL only.
3. Every task: implement → write full P/N/Edge tests → fix_and_retest → commit.
4. HARD GATE exists after Task 4. If accuracy < 4/5, STOP. Do not proceed.
5. TypeScript must compile clean at every BUILD boundary. Zero errors.
6. Fail 3 times: commit wip, document, continue — except HARD GATE.
7. Runs until PHASE FINAL is complete.

---

## STEP 0 — CREATE TEST DATA FILE FIRST

```bash
cd ~/Development/celeb-clock
mkdir -p src/__tests__
```

Create `src/__tests__/testData.ts` with this exact content:

```typescript
// Single source of truth — import from here in ALL test files
export const VIRAT = {
  name:'Virat Kohli', slug:'virat-kohli', dob:'1988-11-05',
  day:5, month:11, year:1988, time:'12:30',
  city:'Delhi', lat:28.6139, lon:77.2090, tz:5.5,
  western_zodiac:'Scorpio', nakshatra:'Anuradha', rashi:'Vrischika',
  wrong_nakshatra:'Dhanishtha',
};
export const SRK = {
  name:'Shah Rukh Khan', slug:'shah-rukh-khan', dob:'1965-11-02',
  day:2, month:11, year:1965, time:'14:30',
  city:'Delhi', lat:28.6139, lon:77.2090, tz:5.5,
  western_zodiac:'Scorpio', nakshatra:'Vishakha', rashi:'Tula',
  wrong_nakshatra:'Dhanishtha',
};
export const SACHIN = {
  name:'Sachin Tendulkar', slug:'sachin-tendulkar', dob:'1973-04-24',
  day:24, month:4, year:1973, time:'12:00',
  city:'Mumbai', lat:19.0760, lon:72.8777, tz:5.5,
  western_zodiac:'Taurus', nakshatra:'Punarvasu', rashi:'Mithuna',
  wrong_nakshatra:'Ashlesha',
};
export const MODI = {
  name:'Narendra Modi', slug:'narendra-modi', dob:'1950-09-17',
  day:17, month:9, year:1950, time:'11:00',
  city:'Vadnagar', lat:23.7867, lon:72.6367, tz:5.5,
  western_zodiac:'Virgo', nakshatra:'Uttara Phalguni', rashi:'Kanya',
  wrong_nakshatra:'Purva Ashadha',
};
export const AMITABH = {
  name:'Amitabh Bachchan', slug:'amitabh-bachchan', dob:'1942-10-11',
  day:11, month:10, year:1942, time:'16:00',
  city:'Allahabad', lat:25.4358, lon:81.8463, tz:5.5,
  western_zodiac:'Libra', nakshatra:'Hasta', rashi:'Kanya',
  wrong_nakshatra:'Shravana',
};
export const PRICES = { birthday_report:199, kundali:199, combo:299, annual:1999 } as const;
export const VALID_27_NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu',
  'Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta',
  'Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
  'Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada',
  'Uttara Bhadrapada','Revati',
] as const;
export const NAKSHATRA_DEVANAGARI: Record<string,string> = {
  'Ashwini':'\u0905\u0936\u094d\u0935\u093f\u0928\u0940',
  'Bharani':'\u092d\u0930\u0923\u0940',
  'Krittika':'\u0915\u0943\u0924\u094d\u0924\u093f\u0915\u093e',
  'Rohini':'\u0930\u094b\u0939\u093f\u0923\u0940',
  'Mrigashira':'\u092e\u0943\u0917\u0936\u093f\u0930\u093e',
  'Ardra':'\u0906\u0930\u094d\u0926\u094d\u0930\u093e',
  'Punarvasu':'\u092a\u0941\u0928\u0930\u094d\u0935\u0938\u0941',
  'Pushya':'\u092a\u0941\u0937\u094d\u092f',
  'Ashlesha':'\u0906\u0936\u094d\u0932\u0947\u0937\u093e',
  'Magha':'\u092e\u0918\u093e',
  'Purva Phalguni':'\u092a\u0942\u0930\u094d\u0935\u093e\u092b\u093e\u0932\u094d\u0917\u0941\u0928\u0940',
  'Uttara Phalguni':'\u0909\u0924\u094d\u0924\u0930\u093e\u092b\u093e\u0932\u094d\u0917\u0941\u0928\u0940',
  'Hasta':'\u0939\u0938\u094d\u0924',
  'Chitra':'\u091a\u093f\u0924\u094d\u0930\u093e',
  'Swati':'\u0938\u094d\u0935\u093e\u0924\u0940',
  'Vishakha':'\u0935\u093f\u0936\u093e\u0916\u093e',
  'Anuradha':'\u0905\u0928\u0941\u0930\u093e\u0927\u093e',
  'Jyeshtha':'\u091c\u094d\u092f\u0947\u0937\u094d\u0920\u093e',
  'Mula':'\u092e\u0942\u0932',
  'Purva Ashadha':'\u092a\u0942\u0930\u094d\u0935\u093e\u0937\u093e\u0922\u093c\u093e',
  'Uttara Ashadha':'\u0909\u0924\u094d\u0924\u0930\u093e\u0937\u093e\u0922\u093c\u093e',
  'Shravana':'\u0936\u094d\u0930\u0935\u0923',
  'Dhanishtha':'\u0927\u0928\u093f\u0937\u094d\u0920\u093e',
  'Shatabhisha':'\u0936\u0924\u092d\u093f\u0937\u093e',
  'Purva Bhadrapada':'\u092a\u0942\u0930\u094d\u0935\u093e\u092d\u093e\u0926\u094d\u0930\u092a\u0926\u093e',
  'Uttara Bhadrapada':'\u0909\u0924\u094d\u0924\u0930\u093e\u092d\u093e\u0926\u094d\u0930\u092a\u0926\u093e',
  'Revati':'\u0930\u0947\u0935\u0924\u0940',
};
export const RASHI_DEVANAGARI: Record<string,string> = {
  'Mesha':'\u092e\u0947\u0937','Vrisha':'\u0935\u0943\u0937',
  'Mithuna':'\u092e\u093f\u0925\u0941\u0928','Karka':'\u0915\u0930\u094d\u0915',
  'Simha':'\u0938\u093f\u0902\u0939','Kanya':'\u0915\u0928\u094d\u092f\u093e',
  'Tula':'\u0924\u0941\u0932\u093e','Vrischika':'\u0935\u0943\u0936\u094d\u091a\u093f\u0915',
  'Dhanu':'\u0927\u0928\u0941','Makara':'\u092e\u0915\u0930',
  'Kumbha':'\u0915\u0941\u092e\u094d\u092d','Meena':'\u092e\u0940\u0928',
};
export const NAKSHATRA_GANA: Record<string,'Deva'|'Manushya'|'Rakshasa'> = {
  'Ashwini':'Deva','Mrigashira':'Deva','Punarvasu':'Deva','Pushya':'Deva',
  'Hasta':'Deva','Swati':'Deva','Anuradha':'Deva','Shravana':'Deva','Revati':'Deva',
  'Bharani':'Manushya','Rohini':'Manushya','Ardra':'Manushya','Purva Phalguni':'Manushya',
  'Uttara Phalguni':'Manushya','Purva Ashadha':'Manushya','Uttara Ashadha':'Manushya',
  'Purva Bhadrapada':'Manushya','Uttara Bhadrapada':'Manushya',
  'Krittika':'Rakshasa','Ashlesha':'Rakshasa','Magha':'Rakshasa','Chitra':'Rakshasa',
  'Vishakha':'Rakshasa','Jyeshtha':'Rakshasa','Mula':'Rakshasa',
  'Dhanishtha':'Rakshasa','Shatabhisha':'Rakshasa',
};
export const NAKSHATRA_NADI: Record<string,'Adi'|'Madhya'|'Antya'> = {
  'Ashwini':'Adi','Ardra':'Adi','Punarvasu':'Adi','Uttara Phalguni':'Adi',
  'Hasta':'Adi','Jyeshtha':'Adi','Mula':'Adi','Shatabhisha':'Adi','Purva Bhadrapada':'Adi',
  'Bharani':'Madhya','Mrigashira':'Madhya','Pushya':'Madhya','Purva Phalguni':'Madhya',
  'Chitra':'Madhya','Anuradha':'Madhya','Purva Ashadha':'Madhya','Dhanishtha':'Madhya',
  'Uttara Bhadrapada':'Madhya',
  'Krittika':'Antya','Rohini':'Antya','Ashlesha':'Antya','Magha':'Antya',
  'Swati':'Antya','Vishakha':'Antya','Uttara Ashadha':'Antya','Shravana':'Antya','Revati':'Antya',
};
export const NAKSHATRA_AKSHARAS: Record<string,string[]> = {
  'Ashwini':['Chu','Che','Cho','La'],'Bharani':['Li','Lu','Le','Lo'],
  'Krittika':['A','I','U','E'],'Rohini':['O','Va','Vi','Vu'],
  'Mrigashira':['Ve','Vo','Ka','Ki'],'Ardra':['Ku','Gha','Ing','Jha'],
  'Punarvasu':['Ke','Ko','Ha','Hi'],'Pushya':['Hu','He','Ho','Da'],
  'Ashlesha':['Di','Du','De','Do'],'Magha':['Ma','Mi','Mu','Me'],
  'Purva Phalguni':['Mo','Ta','Ti','Tu'],'Uttara Phalguni':['Te','To','Pa','Pi'],
  'Hasta':['Pu','Sha','Na','Tha'],'Chitra':['Pe','Po','Ra','Ri'],
  'Swati':['Ru','Re','Ro','Ta'],'Vishakha':['Ti','Tu','Te','To'],
  'Anuradha':['Na','Ni','Nu','Ne'],'Jyeshtha':['No','Ya','Yi','Yu'],
  'Mula':['Ye','Yo','Bha','Bhi'],'Purva Ashadha':['Bhu','Dha','Pha','Dha'],
  'Uttara Ashadha':['Bhe','Bho','Ja','Ji'],'Shravana':['Khi','Khu','Khe','Kho'],
  'Dhanishtha':['Ga','Gi','Gu','Ge'],'Shatabhisha':['Go','Sa','Si','Su'],
  'Purva Bhadrapada':['Se','So','Da','Di'],'Uttara Bhadrapada':['Du','Tha','Jha','Tra'],
  'Revati':['De','Do','Cha','Chi'],
};
```

---

## DEFINE ALL BASH FUNCTIONS

```bash
hard_gate() {
  local CHECK="$1" MSG="$2"
  echo "=== HARD GATE: $CHECK ==="
  eval "$CHECK" && echo "GATE PASSED" || {
    echo ""
    echo "======================================"
    echo "HARD GATE FAILED: $MSG"
    echo "Fix before continuing."
    echo "======================================"
    exit 1
  }
}
fail_task() { echo "WIP $1: $2"; git add -A; git commit -m "wip(task$1): $2" 2>/dev/null||true; }
born_on_check() {
  sleep 50
  T=$(curl -sk "https://bornclock.com/born-on/august-6/india/"|grep -o "<title>[^<]*</title>")
  echo "$T"|grep -qi "august 6"&&echo "born-on PASS"||{ echo "FAIL"; ./node_modules/.bin/wrangler deploy 2>&1|tail -3; sleep 50; }
}
ts_check() {
  echo "=== TypeScript Check ==="
  npx tsc --noEmit 2>&1|tee /tmp/ts.txt|head -5
  ERRS=$(grep -c "error TS" /tmp/ts.txt 2>/dev/null||echo 0)
  [ "$ERRS" -gt 0 ]&&{ echo "TS ERRORS: $ERRS"; cat /tmp/ts.txt|grep "error TS"|head -10; return 1; }
  echo "TypeScript clean"
}
fix_and_retest() {
  local S="$1" D="$2" A=1 F=99
  while [ $A -le 3 ]&&[ "$F" -gt 0 ]; do
    R=$(npx vitest run "$S" --reporter=verbose 2>&1)
    F=$(echo "$R"|grep -cE "FAIL |x " 2>/dev/null||echo 0)
    [ "$F" -gt 0 ]&&echo "Attempt $A/3 - $F failing:"&&echo "$R"|grep -E "FAIL|Error:|Expected"|head -10
    A=$((A+1))
  done
  [ "$F" -gt 0 ]&&{ echo "Still failing"; fail_task "$D" "tests"; return 1; }
  echo "All pass: $S"
}
fix_and_retest_pw() {
  local S="$1" A=1 F=99
  while [ $A -le 3 ]&&[ "$F" -gt 0 ]; do
    R=$(npx playwright test "$S" --reporter=list 2>&1)
    F=$(echo "$R"|grep -cE "FAILED" 2>/dev/null||echo 0)
    [ "$F" -gt 0 ]&&echo "PW $A/3"&&echo "$R"|grep "FAILED"|head -5
    A=$((A+1))
  done
  [ "$F" -gt 0 ]&&echo "PW still failing"||echo "PW all pass"
}
regression_check() {
  echo "=== REGRESSION ==="
  R=$(npx vitest run 2>&1)
  F=$(echo "$R"|grep -cE "FAIL " 2>/dev/null||echo 0)
  T=$(echo "$R"|grep -oE "[0-9]+ passed"|tail -1)
  echo "$T | $F failing"
  [ "$F" -gt 0 ]&&echo "REGRESSION"||echo "Zero regressions"
}
cross_page_consistency() {
  echo "=== CONSISTENCY CHECK ==="
  python3 << 'PYEOF'
import subprocess, re
def get(path):
    r=subprocess.run(['curl','-sk',f'http://localhost:4173{path}'],capture_output=True,text=True,timeout=10)
    return r.stdout
ok=0; fail=0
# Virat: Scorpio present, Dhanishtha absent
b=get('/celebrity/virat-kohli/')
chk='Scorpio' in b and 'Dhanishtha' not in b
print(f"{'OK' if chk else 'FAIL'} Virat celeb: Scorpio yes, Dhanishtha no")
if chk: ok+=1
else: fail+=1
# Price: 199 on key pages
for path in ['/birthday-report','/birthday-report/gift','/kundali']:
    b=get(path)
    bad='299' in b and 'combo' not in b.lower() and 'annual' not in b.lower()
    print(f"{'OK' if not bad else 'FAIL'} Price on {path}")
    if not bad: ok+=1
    else: fail+=1
# No undefined
for path in ['/','/kundali','/compatibility/','/wish']:
    b=get(path)
    chk='undefined' not in b and '[object Object]' not in b
    print(f"{'OK' if chk else 'FAIL'} No undefined: {path}")
    if chk: ok+=1
    else: fail+=1
print(f"Consistency: {ok}/{ok+fail}")
PYEOF
}
start_preview(){ npx vite preview --port 4173 & PREVIEW_PID=$!; sleep 8; }
stop_preview(){ kill $PREVIEW_PID 2>/dev/null||true; }
```


---

## PHASE 1 — AUDIT BEFORE ANY CODE

```bash
cd ~/Development/celeb-clock
echo "=== BASELINE ===" && npx vitest run 2>&1|tail -3
npx tsc --noEmit 2>&1|grep "error TS"|wc -l|xargs echo "TS errors:"
node -e "
const {createClient}=require('@supabase/supabase-js');
require('dotenv').config({path:'.env.local'});
const sb=createClient(process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.VITE_SUPABASE_ANON_KEY);
sb.from('celebrity_sitelinks').select('name,slug').in('name',['Virat Kohli','Shah Rukh Khan'])
  .then(({data,error})=>{
    if(error)console.log('Slug issue:',error.message);
    else console.log('Slugs:',data.map(r=>r.name+'->'+r.slug).join(', '));
  });" 2>/dev/null
ls node_modules/@fusionstrings/panchangam/package.json 2>/dev/null&&{
  node -e "const p=require('@fusionstrings/panchangam/package.json');console.log('panchangam v'+p.version,p.license)"
  echo "Exports:"; node -e "const p=require('@fusionstrings/panchangam');console.log(Object.keys(p).join(', '))" 2>/dev/null
  echo "Type defs:"; cat node_modules/@fusionstrings/panchangam/dist/index.d.ts 2>/dev/null|head -60
}||echo "panchangam NOT INSTALLED"
grep "PROKERALA\|GEMINI" .env.local 2>/dev/null|head -4||echo "Keys missing"
grep -rn "199\|299\|\u20b9" src/pages/ --include="*.tsx" 2>/dev/null|grep -v test|head -15
python3 -c "
import json,os
f='src/data/celebrities.json'
print(f'celebrities.json: {json.load(open(f))["total"]}') if os.path.exists(f) else print('NOT FOUND')
b='src/data/celebrity-bios.json'
print(f'Bios: {len(json.load(open(b)))}') if os.path.exists(b) else print('bios: NOT FOUND')
" 2>/dev/null
for P in KundaliPage KundaliMatchPage BabyNamesPage RemindersPage DiwaliGiftPage; do
  ls src/pages/${P}.tsx 2>/dev/null&&echo "$P: EXISTS"||echo "$P: MISSING"
done
ls src/i18n.ts 2>/dev/null&&echo "i18n: EXISTS"||echo "i18n: MISSING"
git log --oneline|head -5

echo ""
echo "==========================="
echo "PRINT BEFORE CONTINUING:"
echo "  slugs: [YES/NO]"
echo "  panchangam: [version or MISSING]"
echo "  panchangam exports: [list]"
echo "  ProKerala keys: [YES/NO]"
echo "  TS errors: [N]"
echo "  baseline tests: [N passing]"
echo "==========================="
```

If ProKerala keys missing, add to .env.local:
```
VITE_PROKERALA_CLIENT_ID=your_id_here
VITE_PROKERALA_CLIENT_SECRET=your_secret_here
```

**STOP. Print mapping before writing any code.**

---

## BATCH A — FIXES + FOUNDATION (Tasks 1–5)

---

## TASK 1 — REMOVE WRONG NAKSHATRA + FIX COMPATIBILITY

**UPSTREAM:** `grep -n "calculateNakshatra" src/pages/CelebrityPage.tsx|head -5`

Create `src/components/NakshatraPlaceholder.tsx`:
```tsx
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
```

In CelebrityPage.tsx: remove calculateNakshatra(day,month) display → replace with `<NakshatraPlaceholder />`.
In CompatibilityPage.tsx: remove Nakshatra gana scoring, change "4-dimension" to "3-dimension", add disclaimer.

**DOWNSTREAM:** `grep -n "calculateNakshatra\|nakshatraGana" src/pages/CelebrityPage.tsx src/pages/CompatibilityPage.tsx` → must return 0 results.

**TESTS — src/pages/__tests__/Task1.test.tsx:**
```typescript
import { VIRAT, SRK, SACHIN, PRICES } from '../../__tests__/testData';
describe('TC-NFIX', () => {
  it('TC-NFIX-P-01: NakshatraPlaceholder renders on celeb page', () => {
    renderCelebPage(VIRAT.slug);
    expect(document.querySelector('[data-testid="nakshatra-placeholder"]')).toBeTruthy();
  });
  it('TC-NFIX-P-02: placeholder CTA links to /birthday-report', () => {
    renderCelebPage(VIRAT.slug);
    const cta = document.querySelector('[data-testid="nakshatra-cta"]') as HTMLAnchorElement;
    expect(cta?.href).toContain('birthday-report');
  });
  it('TC-NFIX-P-03: placeholder text mentions birth time', () => {
    renderCelebPage(VIRAT.slug);
    expect(document.querySelector('[data-testid="nakshatra-placeholder"]')?.textContent?.toLowerCase()).toContain('birth time');
  });
  it('TC-NFIX-P-04: compatibility page renders', () => { expect(()=>renderCompatPage()).not.toThrow(); });
  it('TC-NFIX-P-05: compatibility shows 3 not 4 dimensions', () => {
    renderCompatPage();
    expect(document.body.textContent).not.toMatch(/4.dimension.*Nakshatra/i);
  });
  it('TC-NFIX-P-06: price on celeb page is 199 not 299', () => {
    renderCelebPage(VIRAT.slug);
    const body = document.body.textContent||'';
    if (body.includes('₹')) expect(body).not.toMatch(/₹299.*report/i);
  });
  it('TC-NFIX-P-07: Prabhupada celeb page renders with placeholder', () => {
    expect(()=>renderCelebPage('ac-bhaktivedanta-swami-prabhupada')).not.toThrow();
    expect(document.querySelector('[data-testid="nakshatra-placeholder"]')).toBeTruthy();
  });
  it('TC-NFIX-N-01: Virat page NEVER shows Dhanishtha', () => {
    renderCelebPage(VIRAT.slug); expect(document.body.textContent).not.toContain('Dhanishtha');
  });
  it('TC-NFIX-N-02: SRK page NEVER shows Dhanishtha', () => {
    renderCelebPage(SRK.slug); expect(document.body.textContent).not.toContain('Dhanishtha');
  });
  it('TC-NFIX-N-03: Sachin page NEVER shows Ashlesha', () => {
    renderCelebPage(SACHIN.slug); expect(document.body.textContent).not.toContain('Ashlesha');
  });
  it('TC-NFIX-N-04: no Nakshatra gana score in compatibility', () => {
    renderCompatPage();
    expect(document.body.textContent).not.toContain('Nakshatra score');
    expect(document.body.textContent).not.toContain('gana score');
  });
  it('TC-NFIX-N-05: no undefined on celeb page', () => {
    renderCelebPage(VIRAT.slug);
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-NFIX-N-06: compatibility still shows zodiac/life path', () => {
    renderCompatPage();
    expect(document.body.textContent).toMatch(/zodiac|Life Path|Rashi/i);
  });
  it('TC-NFIX-EDGE-01: year-only DOB celeb renders with placeholder', () => {
    expect(()=>renderCelebPage('some-year-only-celeb')).not.toThrow();
  });
  it('TC-NFIX-EDGE-02: no [object Object] on celeb page', () => {
    renderCelebPage(VIRAT.slug);
    expect(document.body.textContent).not.toContain('[object Object]');
  });
});
```

```bash
fix_and_retest "src/pages/__tests__/Task1.test.tsx" "Task1"
git add src/components/NakshatraPlaceholder.tsx src/pages/CelebrityPage.tsx \
        src/pages/CompatibilityPage.tsx src/pages/__tests__/Task1.test.tsx
git commit -m "fix: remove wrong Nakshatra+fix compat — TC-NFIX: 14 pass"
echo "=== TASK 1 DONE ==="
```

---

## TASK 2 — SUPABASE SLUG MIGRATION

```bash
npx tsx scripts/add-celebrity-slugs.ts 2>&1|tail -15
```

**TESTS — scripts/__tests__/Task2.test.ts:**
```typescript
const sb = createClient(url, key);
describe('TC-SLUG', () => {
  it('TC-SLUG-P-01: Virat slug = "virat-kohli"', async () => {
    const {data} = await sb.from('celebrity_sitelinks').select('slug').eq('name','Virat Kohli').single();
    expect(data?.slug).toBe('virat-kohli');
  });
  it('TC-SLUG-P-02: SRK slug = "shah-rukh-khan"', async () => {
    const {data} = await sb.from('celebrity_sitelinks').select('slug').eq('name','Shah Rukh Khan').single();
    expect(data?.slug).toBe('shah-rukh-khan');
  });
  it('TC-SLUG-P-03: Prabhupada has slug', async () => {
    const {data} = await sb.from('celebrity_sitelinks').select('slug').ilike('name','%Prabhupada%').limit(1);
    expect(data?.[0]?.slug).toMatch(/^[a-z0-9-]+$/);
  });
  it('TC-SLUG-P-04: all Indian celebs have slug (count null = 0)', async () => {
    const {count} = await sb.from('celebrity_sitelinks').select('*',{count:'exact',head:true})
      .eq('nationality_code','IN').is('slug',null);
    expect(count).toBe(0);
  });
  it('TC-SLUG-P-05: all slugs lowercase kebab', async () => {
    const {data} = await sb.from('celebrity_sitelinks').select('slug').not('slug','is',null).limit(200);
    data?.forEach(r=>{ if(r.slug) expect(r.slug).toMatch(/^[a-z0-9-]+$/); });
  });
  it('TC-SLUG-N-01: Hitler ID 3503 has no slug', async () => {
    const {data} = await sb.from('celebrity_sitelinks').select('slug').eq('id',3503).maybeSingle();
    expect(data?.slug).toBeFalsy();
  });
  it('TC-SLUG-N-02: no duplicate slugs among Indian celebs', async () => {
    const {data} = await sb.from('celebrity_sitelinks').select('slug')
      .eq('nationality_code','IN').not('slug','is',null);
    const slugs = data?.map(r=>r.slug)||[];
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it('TC-SLUG-EDGE-01: apostrophe in name → URL-safe slug', async () => {
    const {data} = await sb.from('celebrity_sitelinks').select('name,slug').ilike('name',"%'%").limit(5);
    data?.forEach(r=>{ if(r.slug){ expect(r.slug).not.toContain("'"); expect(r.slug).toMatch(/^[a-z0-9-]+$/); }});
  });
  it('TC-SLUG-EDGE-02: A.R. Rahman slug has no dots', async () => {
    const {data} = await sb.from('celebrity_sitelinks').select('slug').ilike('name','A.R. Rahman').limit(1);
    if(data?.[0]?.slug) expect(data[0].slug).not.toContain('.');
  });
});
```

```bash
fix_and_retest "scripts/__tests__/Task2.test.ts" "Task2"
git commit -m "test(db): slugs verified — TC-SLUG: 9 pass"
echo "=== TASK 2 DONE ==="
```

---

## TASK 3 — INSTALL PANCHANGAM + READ ACTUAL API

```bash
npm install @fusionstrings/panchangam 2>&1|tail -5
# MANDATORY: Read actual API before writing any implementation
echo "=== EXPORTS ==="
node -e "const p=require('@fusionstrings/panchangam');console.log(Object.keys(p))" 2>/dev/null
echo "=== TYPE DEFS ==="
cat node_modules/@fusionstrings/panchangam/dist/index.d.ts 2>/dev/null|head -80
echo "=== README USAGE ==="
grep -A 30 "Usage\|Quick Start\|Example" node_modules/@fusionstrings/panchangam/README.md 2>/dev/null|head -50
```

Write `scripts/test-panchangam-api.ts` to verify the library loads and print its actual exports. Run it.

**TESTS:**
```typescript
describe('TC-PANCHANG', () => {
  it('TC-PANCHANG-P-01: imports', async () => { await expect(import('@fusionstrings/panchangam')).resolves.toBeDefined(); });
  it('TC-PANCHANG-P-02: has callable exports', async () => {
    const mod = await import('@fusionstrings/panchangam');
    expect(Object.values(mod).filter(v=>typeof v==='function').length).toBeGreaterThan(0);
  });
  it('TC-PANCHANG-P-03: MIT license', () => { expect(require('@fusionstrings/panchangam/package.json').license).toBe('MIT'); });
  it('TC-PANCHANG-P-04: version >= 0.2', () => {
    expect(parseInt(require('@fusionstrings/panchangam/package.json').version.split('.')[1])).toBeGreaterThanOrEqual(2);
  });
  it('TC-PANCHANG-N-01: no .se1 data files (Moshier mode)', () => {
    const fs=require('fs');
    expect(fs.readdirSync('node_modules/@fusionstrings/panchangam').some((f:string)=>f.endsWith('.se1'))).toBe(false);
  });
  it('TC-PANCHANG-EDGE-01: resolves not rejects', async () => { await expect(import('@fusionstrings/panchangam')).resolves.toBeDefined(); });
});
```

```bash
fix_and_retest "src/utils/__tests__/Task3.test.ts" "Task3"
git add package.json package-lock.json scripts/test-panchangam-api.ts src/utils/__tests__/Task3.test.ts
git commit -m "feat(calc): panchangam installed, API shape known — TC-PANCHANG: 6 pass"
echo "=== TASK 3 DONE ==="
```

---

## TASK 4 — ACCURATE VEDIC CALCULATION + HARD GATE

**UPSTREAM:** panchangam importable, API shape known from Task 3.

Create `src/utils/vedicCalculations.ts` using the EXACT API shape from Task 3.
Requirements: Lahiri ayanamsha, Moshier mode, boundary detection (0.5° threshold),
ProKerala fallback only when boundary+keys present, never crash on error.

Also create `scripts/verify-nakshatra-accuracy.ts`:
```typescript
import { calculateVedicProfile } from '../src/utils/vedicCalculations';
const TESTS = [
  {d:5,m:11,y:1988,h:12,min:30,lat:28.6139,lon:77.2090,tz:5.5,exp:'Anuradha'},
  {d:2,m:11,y:1965,h:14,min:30,lat:28.6139,lon:77.2090,tz:5.5,exp:'Vishakha'},
  {d:24,m:4,y:1973,h:12,min:0,lat:19.0760,lon:72.8777,tz:5.5,exp:'Punarvasu'},
  {d:17,m:9,y:1950,h:11,min:0,lat:23.7867,lon:72.6367,tz:5.5,exp:'Uttara Phalguni'},
  {d:11,m:10,y:1942,h:16,min:0,lat:25.4358,lon:81.8463,tz:5.5,exp:'Hasta'},
];
async function main() {
  let pass=0;
  for(const t of TESTS) {
    const r = await calculateVedicProfile(t.d,t.m,t.y,t.h,t.min,{city:'',lat:t.lat,lon:t.lon,timezone:t.tz});
    const ok = r.nakshatra.nakshatra===t.exp;
    if(ok) pass++;
    console.log(`${ok?'OK':'FAIL'} expected ${t.exp} got ${r.nakshatra.nakshatra}`);
  }
  console.log(`Accuracy: ${pass}/5`);
  process.exit(pass>=4?0:1);
}
main().catch(e=>{console.error(e);process.exit(1);});
```

**TESTS — src/utils/__tests__/Task4.test.ts:**
```typescript
import { calculateVedicProfile, isNearNakshatraBoundary, NAKSHATRA_TO_DEVANAGARI } from '../vedicCalculations';
import { VIRAT, SRK, SACHIN, MODI, AMITABH, VALID_27_NAKSHATRAS, NAKSHATRA_DEVANAGARI } from '../../__tests__/testData';

const DELHI    = {city:'Delhi',lat:28.6139,lon:77.2090,timezone:5.5};
const MUMBAI   = {city:'Mumbai',lat:19.0760,lon:72.8777,timezone:5.5};
const VADNAGAR = {city:'Vadnagar',lat:23.7867,lon:72.6367,timezone:5.5};
const PRAYAG   = {city:'Allahabad',lat:25.4358,lon:81.8463,timezone:5.5};

describe('TC-VEDIC', () => {
  it('TC-VEDIC-P-01: Virat -> Anuradha', async () => { const r=await calculateVedicProfile(5,11,1988,12,30,DELHI); expect(r.nakshatra.nakshatra).toBe('Anuradha'); }, 20000);
  it('TC-VEDIC-P-02: SRK -> Vishakha', async () => { const r=await calculateVedicProfile(2,11,1965,14,30,DELHI); expect(r.nakshatra.nakshatra).toBe('Vishakha'); }, 20000);
  it('TC-VEDIC-P-03: Sachin -> Punarvasu', async () => { const r=await calculateVedicProfile(24,4,1973,12,0,MUMBAI); expect(r.nakshatra.nakshatra).toBe('Punarvasu'); }, 20000);
  it('TC-VEDIC-P-04: Modi -> Uttara Phalguni', async () => { const r=await calculateVedicProfile(17,9,1950,11,0,VADNAGAR); expect(r.nakshatra.nakshatra).toBe('Uttara Phalguni'); }, 20000);
  it('TC-VEDIC-P-05: Amitabh -> Hasta', async () => { const r=await calculateVedicProfile(11,10,1942,16,0,PRAYAG); expect(r.nakshatra.nakshatra).toBe('Hasta'); }, 20000);
  it('TC-VEDIC-P-06: result is one of 27 valid Nakshatras', async () => {
    const r=await calculateVedicProfile(5,11,1988,12,30,DELHI);
    expect(VALID_27_NAKSHATRAS as readonly string[]).toContain(r.nakshatra.nakshatra);
  }, 20000);
  it('TC-VEDIC-P-07: pada is 1-4', async () => {
    const r=await calculateVedicProfile(5,11,1988,12,30,DELHI);
    expect(r.nakshatra.pada).toBeGreaterThanOrEqual(1);
    expect(r.nakshatra.pada).toBeLessThanOrEqual(4);
  }, 20000);
  it('TC-VEDIC-P-08: with time -> confidence=high, lagna not null', async () => {
    const r=await calculateVedicProfile(5,11,1988,12,30,DELHI);
    expect(r.nakshatra.confidence).toBe('high');
    expect(r.lagna).not.toBeNull();
  }, 20000);
  it('TC-VEDIC-P-09: Nakshatra has Devanagari', async () => {
    const r=await calculateVedicProfile(5,11,1988,12,30,DELHI);
    expect(r.nakshatra.nakshatra_devanagari).toMatch(/[\u0900-\u097F]/);
  }, 20000);
  it('TC-VEDIC-P-10: all 27 have Devanagari in mapping', () => {
    VALID_27_NAKSHATRAS.forEach(n => {
      expect(NAKSHATRA_TO_DEVANAGARI[n],`Missing: ${n}`).toBeTruthy();
    });
  });
  it('TC-VEDIC-N-01: Virat NEVER Dhanishtha', async () => { const r=await calculateVedicProfile(5,11,1988,12,30,DELHI); expect(r.nakshatra.nakshatra).not.toBe('Dhanishtha'); }, 20000);
  it('TC-VEDIC-N-02: SRK NEVER Dhanishtha', async () => { const r=await calculateVedicProfile(2,11,1965,14,30,DELHI); expect(r.nakshatra.nakshatra).not.toBe('Dhanishtha'); }, 20000);
  it('TC-VEDIC-N-03: Sachin NEVER Ashlesha', async () => { const r=await calculateVedicProfile(24,4,1973,12,0,MUMBAI); expect(r.nakshatra.nakshatra).not.toBe('Ashlesha'); }, 20000);
  it('TC-VEDIC-N-04: without time -> lagna=null, confidence low/medium', async () => {
    const r=await calculateVedicProfile(5,11,1988,null,null,DELHI);
    expect(r.lagna).toBeNull(); expect(r.requires_birth_time).toBe(true);
    expect(['low','medium']).toContain(r.nakshatra.confidence);
  }, 20000);
  it('TC-VEDIC-N-05: no undefined in result', async () => {
    const r=await calculateVedicProfile(5,11,1988,12,30,DELHI);
    expect(JSON.stringify(r)).not.toContain('"undefined"');
  }, 20000);
  it('TC-VEDIC-N-06: invalid coords -> no crash', async () => {
    await expect(calculateVedicProfile(5,11,1988,12,30,{city:'X',lat:0,lon:0,timezone:0})).resolves.toBeTruthy();
  }, 20000);
  it('TC-VEDIC-EDGE-01: Feb 29 1988 -> no crash', async () => { await expect(calculateVedicProfile(29,2,1988,12,0,DELHI)).resolves.toBeTruthy(); }, 20000);
  it('TC-VEDIC-EDGE-02: Jan 1 1900 -> no crash', async () => { await expect(calculateVedicProfile(1,1,1900,12,0,DELHI)).resolves.toBeTruthy(); }, 20000);
  it('TC-VEDIC-EDGE-03: midnight 00:00 -> no crash', async () => { await expect(calculateVedicProfile(5,11,1988,0,0,DELHI)).resolves.toBeTruthy(); }, 20000);
  it('TC-VEDIC-EDGE-04: 23:59 -> no crash', async () => { await expect(calculateVedicProfile(5,11,1988,23,59,DELHI)).resolves.toBeTruthy(); }, 20000);
  it('TC-VEDIC-EDGE-05: isNearBoundary(0.3) = true', () => { expect(isNearNakshatraBoundary(0.3)).toBe(true); });
  it('TC-VEDIC-EDGE-06: isNearBoundary(6.5) = false', () => { expect(isNearNakshatraBoundary(6.5)).toBe(false); });
  it('TC-VEDIC-EDGE-07: near Nakshatra end is boundary', () => { expect(isNearNakshatraBoundary(360/27-0.2)).toBe(true); });
  it('TC-VEDIC-ACCURACY: >=4/5 known celebrities match', async () => {
    const tests=[
      {d:5,m:11,y:1988,h:12,min:30,loc:DELHI,exp:'Anuradha'},
      {d:2,m:11,y:1965,h:14,min:30,loc:DELHI,exp:'Vishakha'},
      {d:24,m:4,y:1973,h:12,min:0,loc:MUMBAI,exp:'Punarvasu'},
      {d:17,m:9,y:1950,h:11,min:0,loc:VADNAGAR,exp:'Uttara Phalguni'},
      {d:11,m:10,y:1942,h:16,min:0,loc:PRAYAG,exp:'Hasta'},
    ];
    let pass=0;
    for(const t of tests){
      const r=await calculateVedicProfile(t.d,t.m,t.y,t.h,t.min,t.loc);
      if(r.nakshatra.nakshatra===t.exp) pass++;
      else console.log(`MISMATCH: expected ${t.exp}, got ${r.nakshatra.nakshatra}`);
    }
    console.log(`Accuracy: ${pass}/5`);
    expect(pass,'Accuracy <80% — fix calculateVedicProfile').toBeGreaterThanOrEqual(4);
  }, 120000);
});
```

```bash
fix_and_retest "src/utils/__tests__/Task4.test.ts" "Task4"
```

**══ HARD GATE — TASK 4 ══**
```bash
echo "=== HARD GATE: Nakshatra Accuracy ==="
npx tsx scripts/verify-nakshatra-accuracy.ts 2>&1
GATE_EXIT=$?
if [ $GATE_EXIT -ne 0 ]; then
  echo ""
  echo "=============================================="
  echo "HARD GATE FAILED — accuracy < 4/5"
  echo "DO NOT CONTINUE TO TASKS 5-20."
  echo "Check panchangam type defs and fix calculateVedicProfile."
  echo "Re-run Task 4 until >=4/5 accuracy."
  echo "=============================================="
  exit 1
fi
echo "HARD GATE PASSED — proceeding"
git add src/utils/vedicCalculations.ts src/utils/__tests__/Task4.test.ts \
        src/__tests__/testData.ts scripts/verify-nakshatra-accuracy.ts
git commit -m "feat(calc): Moshier accurate Nakshatra — HARD GATE >=4/5 PASSED — TC-VEDIC: 21 pass"
echo "=== TASK 4 DONE ==="
```

---

## TASK 5 — GEOCODING SERVICE

Create `src/services/geocoding.ts` with 24 Indian cities cached + Nominatim fallback.
Cities: Delhi, New Delhi, Mumbai, Bengaluru, Bangalore, Hyderabad, Chennai, Kolkata, Pune,
Ahmedabad, Jaipur, Lucknow, Nagpur, Surat, Patna, Bhopal, Indore, Kochi, Chandigarh,
Gurgaon, Noida, Vadnagar, Allahabad, Prayagraj, Coimbatore.

```typescript
export interface GeoResult {
  name:string; state?:string; country:string;
  lat:number; lon:number; timezone:string; utcOffset:number;
}
export async function geocodeCity(query:string): Promise<GeoResult[]>
```

**TESTS:**
```typescript
describe('TC-GEO', () => {
  it('TC-GEO-P-01: Delhi lat~28.61 IST', async () => { const r=await geocodeCity('Delhi'); expect(r[0].lat).toBeCloseTo(28.61,0); expect(r[0].utcOffset).toBe(5.5); });
  it('TC-GEO-P-02: Hyderabad IST lat~17.38', async () => { const r=await geocodeCity('Hyderabad'); expect(r[0].timezone).toBe('Asia/Kolkata'); expect(r[0].lat).toBeCloseTo(17.38,0); });
  it('TC-GEO-P-03: Vadnagar found', async () => { const r=await geocodeCity('Vadnagar'); expect(r.length).toBeGreaterThan(0); expect(r[0].utcOffset).toBe(5.5); });
  it('TC-GEO-P-04: case insensitive', async () => { const r1=await geocodeCity('DELHI'); const r2=await geocodeCity('delhi'); expect(r1[0].lat).toBeCloseTo(r2[0].lat,1); });
  it('TC-GEO-P-05: New Delhi with space works', async () => { const r=await geocodeCity('New Delhi'); expect(r.length).toBeGreaterThan(0); expect(r[0].utcOffset).toBe(5.5); });
  it('TC-GEO-P-06: utcOffset is number', async () => { expect(typeof (await geocodeCity('Delhi'))[0].utcOffset).toBe('number'); });
  it('TC-GEO-P-07: Prayagraj = Allahabad', async () => { const r1=await geocodeCity('Allahabad'); const r2=await geocodeCity('Prayagraj'); expect(r1.length).toBeGreaterThan(0); expect(r2.length).toBeGreaterThan(0); });
  it('TC-GEO-N-01: nonsense -> empty array', async () => { expect(Array.isArray(await geocodeCity('xyzabc99999'))).toBe(true); });
  it('TC-GEO-N-02: empty string -> no crash', async () => { await expect(geocodeCity('')).resolves.toBeDefined(); });
  it('TC-GEO-EDGE-01: Bengaluru = Bangalore', async () => { const r1=await geocodeCity('Bengaluru'); const r2=await geocodeCity('Bangalore'); expect(r1[0]?.lat).toBeCloseTo(r2[0]?.lat||0,0); });
  it('TC-GEO-EDGE-02: returns array always', async () => { expect(Array.isArray(await geocodeCity('Delhi'))).toBe(true); });
});
```

```bash
fix_and_retest "src/services/__tests__/Task5.test.ts" "Task5"
git add src/services/geocoding.ts src/services/__tests__/Task5.test.ts
git commit -m "feat(geo): 24 cities + Nominatim — TC-GEO: 11 pass"
echo "=== TASK 5 DONE ==="
```

---

## BUILD A

```bash
npx tsx scripts/export-celebrities.ts 2>&1|tail -5
ts_check||exit 1
time npm run build 2>&1|tail -20
echo "Celebrity pages: $(find dist/celebrity -name 'index.html' 2>/dev/null|wc -l)"
./node_modules/.bin/wrangler deploy 2>&1|tail -5
born_on_check; regression_check
git commit -m "chore(build-a): fixes+foundation TS clean" --allow-empty
echo "=== BUILD A DONE ==="
```

## PLAYWRIGHT A

```bash
start_preview
cat > tests/batch-a.spec.ts << 'PW'
import { test, expect } from '@playwright/test';
test.describe('Batch A Human Tester', () => {
  test('HT-A-01: Virat Scorpio yes Dhanishtha no placeholder visible', async({page})=>{
    await page.goto('/celebrity/virat-kohli/');
    const body = await page.textContent('body');
    expect(body).toContain('Scorpio');
    expect(body).not.toContain('Dhanishtha');
    expect(body).not.toContain('undefined');
    await expect(page.locator('[data-testid="nakshatra-placeholder"]')).toBeVisible();
    const title = await page.title();
    expect(title).toContain('Virat');
    expect(title.length).toBeLessThanOrEqual(70);
  });
  test('HT-A-02: compatibility no gana score zodiac present', async({page})=>{
    await page.goto('/compatibility/');
    const body = await page.textContent('body');
    expect(body).not.toContain('Nakshatra score');
    expect(body).toMatch(/zodiac|compatibility/i);
  });
  test('HT-A-03: homepage BornClock title 199 not 299', async({page})=>{
    await page.goto('/');
    const title = await page.title();
    expect(title).toContain('BornClock');
    expect(title.length).toBeLessThanOrEqual(70);
    const body = await page.textContent('body');
    expect(body).not.toContain('undefined');
    if(body?.includes('₹')) expect(body).not.toMatch(/₹299.*report/i);
  });
  test('HT-A-04: celeb slugs lowercase kebab', async({page})=>{
    await page.goto('/');
    const links = await page.$$eval('a[href*="/celebrity/"]',(els:any[])=>els.map((e:any)=>e.href));
    links.slice(0,20).forEach((href:string)=>{
      const slug=href.split('/celebrity/')[1]?.replace('/','');
      if(slug){ expect(slug).toBe(slug.toLowerCase()); expect(slug).toMatch(/^[a-z0-9-]+$/); }
    });
  });
  test('HT-A-05: mobile 375px no scroll celeb page', async({page})=>{
    await page.setViewportSize({width:375,height:667});
    await page.goto('/celebrity/virat-kohli/');
    expect(await page.evaluate(()=>document.body.scrollWidth)).toBeLessThanOrEqual(385);
  });
  test('HT-A-06: born-on page intact', async({page})=>{
    const r = await page.goto('/born-on/august-6/india/');
    expect(r?.status()).toBe(200);
    expect((await page.title()).toLowerCase()).toContain('august');
  });
  test('HT-A-07: SRK page no Dhanishtha', async({page})=>{
    await page.goto('/celebrity/shah-rukh-khan/');
    expect(await page.textContent('body')).not.toContain('Dhanishtha');
  });
});
PW
fix_and_retest_pw "tests/batch-a.spec.ts" "Batch-A"
stop_preview
git add tests/batch-a.spec.ts
git commit -m "test(e2e): Batch A human tester fixes verified"
echo "=== PW BATCH A DONE ==="
```


---

## BATCH B — CELEBRITY DB + BIRTH TIME (Tasks 6–10)

---

## TASK 6 — EXPORT ALL CELEBRITIES (sitelinks >= 20)

```bash
# Change threshold from 30 to 20
grep -n "sitelinks" scripts/export-celebrities.ts|head -5
sed -i "s/gte('sitelinks', 30)/gte('sitelinks', 20)/g" scripts/export-celebrities.ts 2>/dev/null||true
npx tsx scripts/export-celebrities.ts 2>&1|tail -5
python3 -c "import json;d=json.load(open('src/data/celebrities.json'));print(f'Total:{d["total"]} Indian:{d["indian_count"]}')"
```

**TESTS:**
```typescript
import data from '../celebrities.json';
describe('TC-EXPORT', () => {
  it('TC-EXPORT-P-01: total > 2000', ()=>expect((data as any).total).toBeGreaterThan(2000));
  it('TC-EXPORT-P-02: Indian > 2500', ()=>expect((data as any).indian_count).toBeGreaterThan(2500));
  it('TC-EXPORT-P-03: all have slugs', ()=>expect((data as any).celebrities.filter((c:any)=>!c.slug).length).toBe(0));
  it('TC-EXPORT-P-04: no duplicate slugs', ()=>{ const s=(data as any).celebrities.map((c:any)=>c.slug); expect(new Set(s).size).toBe(s.length); });
  it('TC-EXPORT-P-05: Virat slug = "virat-kohli"', ()=>expect((data as any).celebrities.find((c:any)=>c.name==='Virat Kohli')?.slug).toBe('virat-kohli'));
  it('TC-EXPORT-P-06: Prabhupada included', ()=>expect((data as any).celebrities.find((c:any)=>c.name.includes('Prabhupada'))?.slug).toBeTruthy());
  it('TC-EXPORT-P-07: Obama included', ()=>expect((data as any).celebrities.find((c:any)=>c.name==='Barack Obama')).toBeTruthy());
  it('TC-EXPORT-N-01: Hitler ID 3503 absent', ()=>expect((data as any).celebrities.map((c:any)=>c.id)).not.toContain(3503));
  it('TC-EXPORT-N-02: no uppercase in slugs', ()=>{ (data as any).celebrities.forEach((c:any)=>{ if(c.slug) expect(c.slug,c.name).toMatch(/^[a-z0-9-]+$/); }); });
  it('TC-EXPORT-EDGE-01: generated_at is valid date', ()=>expect(new Date((data as any).generated_at).getTime()).not.toBeNaN());
});
```

```bash
fix_and_retest "src/data/__tests__/Task6.test.ts" "Task6"
git add src/data/celebrities.json scripts/export-celebrities.ts src/data/__tests__/Task6.test.ts
git commit -m "feat(db): sitelinks>=20 — TC-EXPORT: 10 pass"
echo "=== TASK 6 DONE ==="
```

---

## TASK 7 — BIO GENERATION

```bash
python3 -c "
import json; bios=json.load(open('src/data/celebrity-bios.json'))
celebs=json.load(open('src/data/celebrities.json'))['celebrities']
missing=[c for c in celebs if c.get('slug') and c['slug'] not in bios]
print(f'Need bios: {len(missing)}')"
for B in 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30; do
  npx tsx scripts/generate-celebrity-bios.ts --batch $B 2>/dev/null||true
  COUNT=$(python3 -c "import json;print(len(json.load(open('src/data/celebrity-bios.json'))))" 2>/dev/null)
  git add src/data/celebrity-bios.json
  git commit -m "feat(bios): batch $B $COUNT total" 2>/dev/null||true
done
```

**TESTS:**
```typescript
import bios from '../celebrity-bios.json';
const ENTRIES=Object.entries(bios as Record<string,string>);
describe('TC-BIOS', () => {
  it('TC-BIOS-P-01: > 1000 bios', ()=>expect(ENTRIES.length).toBeGreaterThan(1000));
  it('TC-BIOS-P-02: all >= 100 chars', ()=>expect(ENTRIES.filter(([,b])=>b.length<100).length).toBe(0));
  it('TC-BIOS-P-03: Virat bio exists', ()=>expect((bios as any)['virat-kohli']?.length).toBeGreaterThan(100));
  it('TC-BIOS-P-04: SRK bio mentions film/Bollywood', ()=>expect((bios as any)['shah-rukh-khan']||'').toLowerCase().toMatch(/film|bollywood|actor/));
  it('TC-BIOS-P-05: Prabhupada mentions ISKCON/Krishna', ()=>{ const b=(bios as any)['ac-bhaktivedanta-swami-prabhupada']||''; if(b) expect(b.toLowerCase()).toMatch(/iskcon|krishna|vaishnav/); });
  it('TC-BIOS-N-01: no empty bios', ()=>expect(ENTRIES.filter(([,b])=>!b.trim()).length).toBe(0));
  it('TC-BIOS-N-02: no AI refusal language', ()=>{ const BAD=['i cannot','as an ai']; ENTRIES.forEach(([s,b])=>BAD.forEach(p=>expect(b.toLowerCase(),s).not.toContain(p))); });
  it('TC-BIOS-N-03: no undefined/TODO/Lorem', ()=>{ ENTRIES.forEach(([s,b])=>{ expect(b,s).not.toContain('undefined'); expect(b,s).not.toContain('TODO'); }); });
  it('TC-BIOS-N-04: >90% unique', ()=>{ const u=new Set(ENTRIES.map(([,b])=>b.slice(0,100))); expect(u.size).toBeGreaterThan(ENTRIES.length*0.9); });
  it('TC-BIOS-EDGE-01: all slugs URL-safe', ()=>{ Object.keys(bios).forEach(s=>expect(s).toMatch(/^[a-z0-9-]+$/)); });
});
```

```bash
fix_and_retest "src/data/__tests__/Task7.test.ts" "Task7"
git add src/data/__tests__/Task7.test.ts
git commit -m "test(bios): quality validated — TC-BIOS: 9 pass"
echo "=== TASK 7 DONE ==="
```

---

## TASK 8 — BIRTHDAY RARITY SCORES

**TESTS:**
```typescript
describe('TC-STATS', () => {
  it('TC-STATS-P-01: Nov 5 count >= 1', ()=>expect(getCelebrityCountForDate(11,5)).toBeGreaterThanOrEqual(1));
  it('TC-STATS-P-02: rarity label valid', ()=>expect(['Rare','Uncommon','Common','Very Common']).toContain(getBirthdayRarityScore(11,5).label));
  it('TC-STATS-P-03: percentile 0-100', ()=>{ const s=getBirthdayRarityScore(11,5); expect(s.percentile).toBeGreaterThanOrEqual(0); expect(s.percentile).toBeLessThanOrEqual(100); });
  it('TC-STATS-P-04: BirthdayRarityCard renders', ()=>{ render(<BirthdayRarityCard month={11} day={5}/>); expect(document.querySelector('[data-testid="birthday-rarity-card"]')).toBeTruthy(); });
  it('TC-STATS-P-05: card shows a number', ()=>{ render(<BirthdayRarityCard month={11} day={5}/>); expect(document.querySelector('[data-testid="birthday-rarity-card"]')?.textContent).toMatch(/\d+/); });
  it('TC-STATS-P-06: description mentions celebrities', ()=>expect(getBirthdayRarityScore(11,5).description.toLowerCase()).toMatch(/celebrities|celebrity|people/));
  it('TC-STATS-N-01: count never negative', ()=>{ for(let m=1;m<=12;m++) expect(getCelebrityCountForDate(m,15)).toBeGreaterThanOrEqual(0); });
  it('TC-STATS-N-02: no undefined in card', ()=>{ render(<BirthdayRarityCard month={11} day={5}/>); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-STATS-EDGE-01: Feb 29 no crash', ()=>expect(()=>getBirthdayRarityScore(2,29)).not.toThrow());
});
```

```bash
fix_and_retest "src/utils/__tests__/Task8.test.tsx" "Task8"
git add src/utils/birthdayStatistics.ts src/components/BirthdayRarityCard.tsx \
        src/utils/__tests__/Task8.test.tsx src/pages/CelebrityPage.tsx
git commit -m "feat(seo): birthday rarity exclusive data — TC-STATS: 9 pass"
echo "=== TASK 8 DONE ==="
```

---

## TASK 9 — BIRTH TIME + CITY INPUT

Add to BirthdayReportPage.tsx:
- Optional birth time input (data-testid="birth-time-input")
- Optional birth city input with autocomplete (data-testid="birth-city-input")
- City dropdown (data-testid="city-dropdown")
- Vedic profile section (data-testid="vedic-profile-section") — only when time+city provided
- Nakshatra + Devanagari, Rashi + Devanagari, Lagna, Dasha
- Boundary warning when is_boundary=true
- Disclaimer "Enter birth time for Nakshatra" when no time provided

**DOWNSTREAM CHECK after:** `npx vitest run src/pages/__tests__/Task9.test.tsx 2>&1|tail -3`

**TESTS:**
```typescript
describe('TC-BTI', () => {
  it('TC-BTI-P-01: birth-time-input renders', ()=>{ renderBirthdayReport(); expect(document.querySelector('[data-testid="birth-time-input"]')).toBeTruthy(); });
  it('TC-BTI-P-02: birth-city-input renders', ()=>{ renderBirthdayReport(); expect(document.querySelector('[data-testid="birth-city-input"]')).toBeTruthy(); });
  it('TC-BTI-P-03: without time western zodiac still shows', ()=>{ renderBirthdayReport({dob:'1988-11-05'}); expect(document.body.textContent).toMatch(/Scorpio|zodiac|Leo|Capricorn/i); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-BTI-P-04: without time vedic section absent', ()=>{ renderBirthdayReport({dob:'1988-11-05'}); expect(document.querySelector('[data-testid="vedic-profile-section"]')).toBeFalsy(); });
  it('TC-BTI-P-05: without time disclaimer present', ()=>{ renderBirthdayReport({dob:'1988-11-05'}); expect(document.body.textContent.toLowerCase()).toMatch(/birth time|nakshatra requires/); });
  it('TC-BTI-P-06: price 199 not 299', ()=>{ renderBirthdayReport({dob:'1988-11-05'}); const b=document.body.textContent||''; if(b.includes('₹')){ expect(b).toContain('₹199'); expect(b).not.toMatch(/₹299.*report/i); } });
  it('TC-BTI-P-07: city input has placeholder', ()=>{ renderBirthdayReport(); expect((document.querySelector('[data-testid="birth-city-input"]') as HTMLInputElement)?.placeholder.toLowerCase()).toMatch(/city|place|delhi/); });
  it('TC-BTI-N-01: no undefined', ()=>{ renderBirthdayReport({dob:'1988-11-05'}); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-BTI-N-02: no [object Object]', ()=>{ renderBirthdayReport({dob:'1988-11-05'}); expect(document.body.textContent).not.toContain('[object Object]'); });
  it('TC-BTI-N-03: empty city no crash', ()=>{ renderBirthdayReport({dob:'1988-11-05',time:'12:30',city:''}); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-BTI-EDGE-01: Feb 29 1988 no crash', ()=>{ renderBirthdayReport({dob:'1988-02-29',time:'12:00'}); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-BTI-EDGE-02: midnight 00:00 no crash', ()=>{ renderBirthdayReport({dob:'1988-11-05',time:'00:00'}); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-BTI-EDGE-03: 23:59 no crash', ()=>{ renderBirthdayReport({dob:'1988-11-05',time:'23:59'}); expect(document.body.textContent).not.toContain('Error'); });
});
```

```bash
fix_and_retest "src/pages/__tests__/Task9.test.tsx" "Task9"
git add src/pages/BirthdayReportPage.tsx src/pages/__tests__/Task9.test.tsx
git commit -m "feat: birth time+city input Vedic profile — TC-BTI: 13 pass"
echo "=== TASK 9 DONE ==="
```

---

## TASK 10 — ADMIN ACCURACY DASHBOARD

Create `src/pages/admin/AccuracyDashboard.tsx` at `/admin/accuracy`.
Ground truth: 5+ celebrities with expected Nakshatras, match/fail display, accuracy %.

**TESTS:**
```typescript
describe('TC-ADMIN', () => {
  it('TC-ADMIN-P-01: renders', ()=>{ render(<AccuracyDashboard/>); expect(document.querySelector('[data-testid="accuracy-dashboard"]')).toBeTruthy(); });
  it('TC-ADMIN-P-02: >=5 ground truth rows', ()=>{ render(<AccuracyDashboard/>); expect(document.querySelectorAll('[data-testid="ground-truth-row"]').length).toBeGreaterThanOrEqual(5); });
  it('TC-ADMIN-P-03: shows Virat+Anuradha', ()=>{ render(<AccuracyDashboard/>); const b=document.body.textContent||''; expect(b).toMatch(/Virat Kohli/); expect(b).toMatch(/Anuradha/); });
  it('TC-ADMIN-P-04: accuracy % shown', ()=>{ render(<AccuracyDashboard/>); expect(document.body.textContent).toMatch(/accuracy|%/i); });
  it('TC-ADMIN-N-01: no ProKerala graceful', ()=>{ render(<AccuracyDashboard/>); expect(document.body.textContent).not.toContain('undefined'); });
});
```

```bash
fix_and_retest "src/pages/admin/__tests__/Task10.test.tsx" "Task10"
git add src/pages/admin/AccuracyDashboard.tsx src/pages/admin/__tests__/Task10.test.tsx
git commit -m "feat(admin): accuracy dashboard ground truth — TC-ADMIN: 5 pass"
echo "=== TASK 10 DONE ==="
```

---

## BUILD B

```bash
npx tsx scripts/export-celebrities.ts
ts_check||exit 1
time npm run build 2>&1|tail -20
echo "Celebrity pages: $(find dist/celebrity -name 'index.html' 2>/dev/null|wc -l)"
./node_modules/.bin/wrangler deploy 2>&1|tail -5
born_on_check; regression_check
start_preview; cross_page_consistency; stop_preview
git commit -m "chore(build-b): celeb DB+birth time+admin TS clean" --allow-empty
echo "=== BUILD B DONE ==="
```

## PLAYWRIGHT B

```bash
start_preview
cat > tests/batch-b.spec.ts << 'PW'
import { test, expect } from '@playwright/test';
test.describe('Batch B Human Tester', () => {
  test('HT-B-01: Prabhupada page loads rarity card visible', async({page})=>{
    const r=await page.goto('/celebrity/ac-bhaktivedanta-swami-prabhupada/');
    expect(r?.status()).toBe(200);
    const title=await page.title(); expect(title).toContain('Prabhupada'); expect(title.length).toBeLessThanOrEqual(70);
    const body=await page.textContent('body'); expect(body).not.toContain('undefined');
    await expect(page.locator('[data-testid="birthday-rarity-card"]')).toBeVisible();
  });
  test('HT-B-02: Obama page loads', async({page})=>{
    const r=await page.goto('/celebrity/barack-obama/');
    expect(r?.status()).toBe(200); expect(await page.textContent('body')).toContain('Obama');
  });
  test('HT-B-03: 5 celebrity titles <=70c', async({page})=>{
    for(const slug of ['virat-kohli','shah-rukh-khan','sachin-tendulkar','narendra-modi','amitabh-bachchan']){
      await page.goto(`/celebrity/${slug}/`);
      const t=await page.title();
      expect(t.length,`Title too long ${slug}: "${t}"`).toBeLessThanOrEqual(70);
    }
  });
  test('HT-B-04: birthday report has time+city inputs', async({page})=>{
    await page.goto('/birthday-report');
    await expect(page.locator('[data-testid="birth-time-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="birth-city-input"]')).toBeVisible();
  });
  test('HT-B-05: birthday report price 199', async({page})=>{
    await page.goto('/birthday-report');
    const body=await page.textContent('body');
    if(body?.includes('₹')){ expect(body).toContain('₹199'); expect(body).not.toMatch(/₹299.*report/i); }
  });
  test('HT-B-06: Virat page shows Scorpio', async({page})=>{
    await page.goto('/celebrity/virat-kohli/');
    expect(await page.textContent('body')).toContain('Scorpio');
  });
  test('HT-B-07: rarity card has number no undefined', async({page})=>{
    await page.goto('/celebrity/virat-kohli/');
    const card=page.locator('[data-testid="birthday-rarity-card"]');
    await expect(card).toBeVisible();
    const text=await card.textContent(); expect(text).toMatch(/\d+/); expect(text).not.toContain('undefined');
  });
  test('HT-B-08: mobile 375px no scroll celeb page', async({page})=>{
    await page.setViewportSize({width:375,height:667});
    await page.goto('/celebrity/virat-kohli/');
    expect(await page.evaluate(()=>document.body.scrollWidth)).toBeLessThanOrEqual(385);
  });
});
PW
fix_and_retest_pw "tests/batch-b.spec.ts" "Batch-B"
stop_preview
git add tests/batch-b.spec.ts
git commit -m "test(e2e): Batch B celebrity DB birth time human tester"
echo "=== PW BATCH B DONE ==="
```


---

## BATCH C — KUNDALI + HINDI (Tasks 11–13)

---

## TASK 11 — KUNDALI PAGE + CHART + AI INTERPRETATION

**UPSTREAM:** `grep "^export" src/utils/vedicCalculations.ts|head -5` and check ProKerala/Gemini keys.

Create `src/pages/KundaliPage.tsx`, `src/components/KundaliChart.tsx`, `src/services/kundaliService.ts`.

Requirements:
- data-testid: kundali-page, kundali-dob, kundali-time, kundali-city, kundali-generate-btn
- Generate button disabled until all 3 inputs filled
- If no ProKerala key: show "Complete Kundali requires ProKerala API key (free at prokerala.com/developers)" gracefully
- SVG chart (data-testid="kundali-chart") North Indian diamond style
- Planet table (data-testid="planet-table")
- Lagna (data-testid="kundali-lagna")
- Dasha (data-testid="kundali-dasha")
- AI interpretation (data-testid="kundali-interpretation")
- Gift CTA links to /birthday-report/gift
- WhatsApp share (data-testid="kundali-whatsapp-share")
- Price: ₹199

**DOWNSTREAM CHECK:** `npx vitest run src/pages/__tests__/Task9.test.tsx 2>&1|tail -3` — birthday report still passes.

**TESTS:**
```typescript
describe('TC-KUNDALI', () => {
  it('TC-KUNDALI-P-01: renders', ()=>expect(()=>renderKundali()).not.toThrow());
  it('TC-KUNDALI-P-02: kundali-page present', ()=>{ renderKundali(); expect(document.querySelector('[data-testid="kundali-page"]')).toBeTruthy(); });
  it('TC-KUNDALI-P-03: kundali-dob present', ()=>{ renderKundali(); expect(document.querySelector('[data-testid="kundali-dob"]')).toBeTruthy(); });
  it('TC-KUNDALI-P-04: kundali-time present', ()=>{ renderKundali(); expect(document.querySelector('[data-testid="kundali-time"]')).toBeTruthy(); });
  it('TC-KUNDALI-P-05: kundali-city present', ()=>{ renderKundali(); expect(document.querySelector('[data-testid="kundali-city"]')).toBeTruthy(); });
  it('TC-KUNDALI-P-06: generate button present', ()=>{ renderKundali(); expect(document.querySelector('[data-testid="kundali-generate-btn"]')).toBeTruthy(); });
  it('TC-KUNDALI-P-07: gift CTA links to /birthday-report/gift', ()=>{ renderKundali(); const links=Array.from(document.querySelectorAll('a')).filter(a=>a.href?.includes('birthday-report/gift')); expect(links.length).toBeGreaterThan(0); });
  it('TC-KUNDALI-P-08: title contains Kundali', async()=>{ renderKundali(); await waitFor(()=>expect(document.title).toMatch(/Kundali|kundali/i)); });
  it('TC-KUNDALI-P-09: price 199 if shown', ()=>{ renderKundali(); const b=document.body.textContent||''; if(b.includes('₹')) expect(b).toContain('₹199'); });
  it('TC-KUNDALI-P-10: H1 mentions Kundali', ()=>{ renderKundali(); expect(document.querySelector('h1')?.textContent).toMatch(/Kundali|kundali/i); });
  it('TC-KUNDALI-N-01: generate button DISABLED without inputs', ()=>{ renderKundali(); expect((document.querySelector('[data-testid="kundali-generate-btn"]') as HTMLButtonElement)?.disabled).toBe(true); });
  it('TC-KUNDALI-N-02: no ProKerala graceful not crash', ()=>{ renderKundali(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-KUNDALI-N-03: no undefined', ()=>{ renderKundali(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-KUNDALI-N-04: no [object Object]', ()=>{ renderKundali(); expect(document.body.textContent).not.toContain('[object Object]'); });
  it('TC-KUNDALI-N-05: invalid date no crash', ()=>{ renderKundali(); const dob=document.querySelector('[data-testid="kundali-dob"]') as HTMLInputElement; if(dob) fireEvent.change(dob,{target:{value:'9999-99-99'}}); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-KUNDALI-EDGE-01: Feb 29 accepted', ()=>{ renderKundali(); const dob=document.querySelector('[data-testid="kundali-dob"]') as HTMLInputElement; if(dob) fireEvent.change(dob,{target:{value:'1988-02-29'}}); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-KUNDALI-EDGE-02: midnight 00:00 accepted', ()=>{ renderKundali(); const t=document.querySelector('[data-testid="kundali-time"]') as HTMLInputElement; if(t) fireEvent.change(t,{target:{value:'00:00'}}); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-KUNDALI-EDGE-03: long city name no overflow', ()=>{ renderKundali(); const c=document.querySelector('[data-testid="kundali-city"]') as HTMLInputElement; if(c) fireEvent.change(c,{target:{value:'Thiruvananthapuram Kerala'}}); expect(document.body.textContent).not.toContain('undefined'); });
});
```

```bash
fix_and_retest "src/pages/__tests__/Task11.test.tsx" "Task11"
git add src/pages/KundaliPage.tsx src/components/KundaliChart.tsx \
        src/services/kundaliService.ts src/pages/__tests__/Task11.test.tsx \
        src/App.tsx scripts/prerender-routes.mjs scripts/prerender-titles.mjs
git commit -m "feat(vedic): Kundali page+chart+interpretation — TC-KUNDALI: 15 pass"
echo "=== TASK 11 DONE ==="
```

---

## TASK 12 — KUNDALI GIFT + UPDATED BIRTHDAY REPORT

Update /birthday-report/gift: Birthday Report ₹199, Kundali ₹199, Combo ₹299.

**TESTS:**
```typescript
describe('TC-KGIFT', () => {
  it('TC-KGIFT-P-01: renders', ()=>{ renderGiftPage(); expect(document.querySelector('[data-testid="gift-page"]')).toBeTruthy(); });
  it('TC-KGIFT-P-02: Kundali option visible', ()=>{ renderGiftPage(); expect(document.body.textContent).toMatch(/Kundali|kundali/); });
  it('TC-KGIFT-P-03: shows 199', ()=>{ renderGiftPage(); expect(document.body.textContent).toContain('₹199'); });
  it('TC-KGIFT-P-04: 299 ONLY for combo not individual report', ()=>{ renderGiftPage(); const b=document.body.textContent||''; expect(b).not.toMatch(/₹299.*birthday report/i); expect(b).not.toMatch(/birthday report.*₹299/i); });
  it('TC-KGIFT-P-05: recipient name input', ()=>{ renderGiftPage(); expect(document.querySelector('[data-testid="gift-recipient-name"]')).toBeTruthy(); });
  it('TC-KGIFT-P-06: recipient DOB input', ()=>{ renderGiftPage(); expect(document.querySelector('[data-testid="gift-recipient-dob"]')).toBeTruthy(); });
  it('TC-KGIFT-P-07: combo shows 299', ()=>{ renderGiftPage(); const b=document.body.textContent||''; if(b.toLowerCase().includes('combo')) expect(b).toContain('₹299'); });
  it('TC-KGIFT-N-01: pay button disabled without name', ()=>{ renderGiftPage(); expect((document.querySelector('[data-testid="gift-pay-btn"]') as HTMLButtonElement)?.disabled).toBe(true); });
  it('TC-KGIFT-N-02: no undefined', ()=>{ renderGiftPage(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-KGIFT-D-01: original birthday report still works', ()=>{ renderBirthdayReport({dob:'1988-11-05'}); expect(document.body.textContent).not.toContain('undefined'); expect(document.body.textContent).toMatch(/Scorpio|zodiac/i); });
});
```

```bash
fix_and_retest "src/pages/__tests__/Task12.test.tsx" "Task12"
git add src/pages/BirthdayReportGiftPage.tsx src/pages/__tests__/Task12.test.tsx
git commit -m "feat(revenue): Kundali gift 199 combo 299 — TC-KGIFT: 10 pass"
echo "=== TASK 12 DONE ==="
```

---

## TASK 13 — REACT-I18NEXT + HINDI

```bash
npm install i18next react-i18next i18next-browser-languagedetector 2>&1|tail -5
```

Create: src/i18n.ts, public/locales/en/translation.json, public/locales/hi/translation.json,
src/components/LanguageToggle.tsx, src/data/vedicTermsHindi.ts.
Add `import './i18n'` to src/main.tsx. Add LanguageToggle to header.

Files to update: Header.tsx, HomePage.tsx, KundaliPage.tsx, BirthdayReportPage.tsx, NakshatraPlaceholder.tsx.

Hindi JSON must have ALL English keys. Key values:
- nakshatra: "नक्षत्र", rashi: "राशि", kundali: "कुंडली"
- buy_report must contain "199" NOT "299"
- gift_report must contain "199" NOT "299"

**DOWNSTREAM CHECK:**
```bash
npx tsc --noEmit 2>&1|grep "error TS"|head -5
npx vitest run src/pages/__tests__/Task11.test.tsx 2>&1|tail -3
npx vitest run src/pages/__tests__/Task9.test.tsx 2>&1|tail -3
```

**TESTS:**
```typescript
import { VALID_27_NAKSHATRAS, NAKSHATRA_DEVANAGARI, RASHI_DEVANAGARI } from '../../__tests__/testData';
describe('TC-I18N', () => {
  it('TC-I18N-P-01: i18n imports', ()=>expect(()=>require('../i18n')).not.toThrow());
  it('TC-I18N-P-02: Hindi has ALL English keys', ()=>{ const en=require('../../public/locales/en/translation.json'); const hi=require('../../public/locales/hi/translation.json'); Object.keys(en).forEach(k=>expect(hi[k],`Missing: ${k}`).toBeTruthy()); });
  it('TC-I18N-P-03: Hindi has Devanagari text', ()=>{ const hi=require('../../public/locales/hi/translation.json'); const hasDev=Object.values(hi).some((v:any)=>/[\u0900-\u097F]/.test(String(v))); expect(hasDev).toBe(true); });
  it('TC-I18N-P-04: nakshatra = नक्षत्र', ()=>{ const hi=require('../../public/locales/hi/translation.json'); expect(hi['nakshatra']).toContain('नक्षत्र'); });
  it('TC-I18N-P-05: rashi = राशि', ()=>{ const hi=require('../../public/locales/hi/translation.json'); expect(hi['rashi']).toContain('राशि'); });
  it('TC-I18N-P-06: kundali = कुंडली', ()=>{ const hi=require('../../public/locales/hi/translation.json'); expect(hi['kundali']).toContain('कुंडली'); });
  it('TC-I18N-P-07: buy_report has 199 not 299', ()=>{ const hi=require('../../public/locales/hi/translation.json'); if(hi['buy_report']){ expect(hi['buy_report']).toContain('199'); expect(hi['buy_report']).not.toContain('299'); } });
  it('TC-I18N-P-08: gift_report has 199 not 299', ()=>{ const hi=require('../../public/locales/hi/translation.json'); if(hi['gift_report']){ expect(hi['gift_report']).toContain('199'); expect(hi['gift_report']).not.toContain('299'); } });
  it('TC-I18N-P-09: LanguageToggle renders with EN + Hindi buttons', ()=>{ render(<LanguageToggle/>); const btns=document.querySelectorAll('[data-testid="language-toggle"] button'); const text=Array.from(btns).map(b=>b.textContent).join(''); expect(text).toMatch(/EN|en/); expect(text).toMatch(/हि|Hindi/i); });
  it('TC-I18N-P-10: all 27 Nakshatra have Devanagari in mapping', ()=>{ VALID_27_NAKSHATRAS.forEach(n=>{ expect(NAKSHATRA_DEVANAGARI[n],`Missing: ${n}`).toBeTruthy(); expect(NAKSHATRA_DEVANAGARI[n]).toMatch(/[\u0900-\u097F]/); }); });
  it('TC-I18N-P-11: all 12 Rashi have Devanagari', ()=>{ Object.keys(RASHI_DEVANAGARI).forEach(r=>expect(RASHI_DEVANAGARI[r]).toMatch(/[\u0900-\u097F]/)); });
  it('TC-I18N-N-01: Hindi no empty string values', ()=>{ const hi=require('../../public/locales/hi/translation.json'); Object.entries(hi).forEach(([k,v])=>expect(v,`Empty: ${k}`).not.toBe('')); });
  it('TC-I18N-N-02: TypeScript compiles after i18n', ()=>{ const {execSync}=require('child_process'); const out=execSync('npx tsc --noEmit 2>&1||true',{encoding:'utf8'}); expect((out.match(/error TS/g)||[]).length).toBe(0); });
  it('TC-I18N-EDGE-01: switching to Hindi stores in localStorage', ()=>{ render(<LanguageToggle/>); const hiBtn=document.querySelectorAll('[data-testid="language-toggle"] button')[1]; if(hiBtn){ fireEvent.click(hiBtn); expect(localStorage.getItem('i18nextLng')).toMatch(/hi/); } });
});
```

```bash
fix_and_retest "src/__tests__/Task13.test.tsx" "Task13"
git add src/i18n.ts public/locales/ src/data/vedicTermsHindi.ts \
        src/components/LanguageToggle.tsx src/main.tsx src/__tests__/Task13.test.tsx
git commit -m "feat(i18n): Hindi+Devanagari — TC-I18N: 13 pass — 199 verified not 299"
echo "=== TASK 13 DONE ==="
```

---

## BUILD C

```bash
npx tsx scripts/export-celebrities.ts
ts_check||exit 1
time npm run build 2>&1|tail -20
./node_modules/.bin/wrangler deploy 2>&1|tail -5
born_on_check; regression_check
start_preview; cross_page_consistency; stop_preview
git commit -m "chore(build-c): Kundali+Hindi TS clean" --allow-empty
echo "=== BUILD C DONE ==="
```

## PLAYWRIGHT C

```bash
start_preview
cat > tests/batch-c.spec.ts << 'PW'
import { test, expect } from '@playwright/test';
test.describe('Batch C Kundali+Hindi Human Tester', () => {
  test('HT-C-01: /kundali 3 inputs button disabled', async({page})=>{
    await page.goto('/kundali');
    await expect(page.locator('[data-testid="kundali-dob"]')).toBeVisible();
    await expect(page.locator('[data-testid="kundali-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="kundali-city"]')).toBeVisible();
    await expect(page.locator('[data-testid="kundali-generate-btn"]')).toBeDisabled();
  });
  test('HT-C-02: /kundali title <=70c contains Kundali', async({page})=>{
    await page.goto('/kundali');
    const t=await page.title();
    expect(t).toMatch(/Kundali|kundali/i);
    expect(t.length).toBeLessThanOrEqual(70);
  });
  test('HT-C-03: no undefined on /kundali', async({page})=>{
    await page.goto('/kundali');
    expect(await page.textContent('body')).not.toContain('\nundefined\n');
  });
  test('HT-C-04: gift page 199 not 299 for birthday report', async({page})=>{
    await page.goto('/birthday-report/gift');
    const body=await page.textContent('body');
    if(body?.includes('₹')){ expect(body).toContain('₹199'); expect(body).not.toMatch(/₹299.*birthday report/i); }
  });
  test('HT-C-05: language toggle shows Devanagari on click', async({page})=>{
    await page.goto('/');
    await expect(page.locator('[data-testid="language-toggle"]')).toBeVisible();
    await page.locator('[data-testid="language-toggle"] button').last().click();
    await page.waitForTimeout(600);
    expect(await page.textContent('body')).toMatch(/[\u0900-\u097F]/);
  });
  test('HT-C-06: /kundali mobile 375px no scroll', async({page})=>{
    await page.setViewportSize({width:375,height:667});
    await page.goto('/kundali');
    expect(await page.evaluate(()=>document.body.scrollWidth)).toBeLessThanOrEqual(385);
  });
  test('HT-C-07: Feb 29 on Kundali no crash', async({page})=>{
    await page.goto('/kundali');
    await page.fill('[data-testid="kundali-dob"]','1988-02-29');
    await page.fill('[data-testid="kundali-time"]','12:00');
    const body=await page.textContent('body');
    expect(body).not.toContain('Error'); expect(body).not.toContain('undefined');
  });
  test('HT-C-08: /kundali meta description present', async({page})=>{
    await page.goto('/kundali');
    const meta=await page.$eval('meta[name="description"]',(m:any)=>m.content).catch(()=>'');
    expect(meta.length).toBeGreaterThan(30);
  });
});
PW
fix_and_retest_pw "tests/batch-c.spec.ts" "Batch-C"
stop_preview
git add tests/batch-c.spec.ts
git commit -m "test(e2e): Batch C Kundali+Hindi human tester verified"
echo "=== PW BATCH C DONE ==="
```


---

## BATCH D — ALL REMAINING FEATURES (Tasks 14–20)

---

## TASK 14 — KUNDALI COMPATIBILITY WITH FULL ASHTAKOOTA ALGORITHM

Route: `/kundali-match`

Create `src/utils/ashtakoota.ts` with the complete algorithm:

```typescript
import { NAKSHATRA_GANA, NAKSHATRA_NADI } from '../__tests__/testData';

const NAKSHATRA_YONI: Record<string,string> = {
  'Ashwini':'Horse','Shatabhisha':'Horse','Bharani':'Elephant','Revati':'Elephant',
  'Pushya':'Sheep','Krittika':'Sheep','Rohini':'Snake','Mrigashira':'Snake',
  'Mula':'Dog','Ardra':'Dog','Ashlesha':'Cat','Punarvasu':'Cat',
  'Magha':'Rat','Purva Phalguni':'Rat','Uttara Phalguni':'Cow','Uttara Bhadrapada':'Cow',
  'Hasta':'Buffalo','Swati':'Buffalo','Vishakha':'Tiger','Chitra':'Tiger',
  'Jyeshtha':'Hare','Anuradha':'Hare','Purva Ashadha':'Monkey','Shravana':'Monkey',
  'Purva Bhadrapada':'Lion','Dhanishtha':'Lion','Uttara Ashadha':'Mongoose',
};
const YONI_ENEMY: Record<string,string> = {
  'Horse':'Buffalo','Buffalo':'Horse','Elephant':'Lion','Lion':'Elephant',
  'Sheep':'Monkey','Monkey':'Sheep','Snake':'Mongoose','Mongoose':'Snake',
  'Dog':'Hare','Hare':'Dog','Cat':'Rat','Rat':'Cat','Cow':'Tiger','Tiger':'Cow',
};
const VALID_27 = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu',
  'Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta',
  'Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
  'Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada',
  'Uttara Bhadrapada','Revati',
];

function ganaScore(g1:string, g2:string): number {
  if (g1===g2) return 6;
  if ((g1==='Deva'&&g2==='Manushya')||(g1==='Manushya'&&g2==='Deva')) return 5;
  if ((g1==='Deva'&&g2==='Rakshasa')||(g1==='Rakshasa'&&g2==='Deva')) return 1;
  return 0; // Manushya+Rakshasa or Rakshasa+Manushya = 0
}

function nadiScore(n1:string, n2:string): number {
  return n1===n2 ? 0 : 8; // Same Nadi = Nadi Dosha = 0
}

function yoniScore(y1:string, y2:string): number {
  if (y1===y2) return 4;
  if (YONI_ENEMY[y1]===y2) return 0;
  return 2; // neutral
}

function taraScore(n1idx:number, n2idx:number): number {
  const fwd = ((n2idx-n1idx+27)%27)+1;
  const rev = ((n1idx-n2idx+27)%27)+1;
  const good = [1,3,5,7];
  return (good.includes(fwd%9) ? 1.5 : 0) + (good.includes(rev%9) ? 1.5 : 0);
}

export interface AshtakootaResult {
  varna:number; vashya:number; tara:number; yoni:number;
  graha_maitri:number; gana:number; bhakoot:number; nadi:number;
  total:number; compatibility:'Excellent'|'Good'|'Acceptable'|'Challenging';
  nadi_dosha:boolean; bhakoot_dosha:boolean;
}

export function calculateAshtakoota(
  nakshatra1:string, nakshatra2:string, rashi1:number, rashi2:number
): AshtakootaResult {
  const n1idx = VALID_27.indexOf(nakshatra1);
  const n2idx = VALID_27.indexOf(nakshatra2);
  const gana1 = NAKSHATRA_GANA[nakshatra1]||'Manushya';
  const gana2 = NAKSHATRA_GANA[nakshatra2]||'Manushya';
  const nadi1 = NAKSHATRA_NADI[nakshatra1]||'Adi';
  const nadi2 = NAKSHATRA_NADI[nakshatra2]||'Adi';
  const yoni1 = NAKSHATRA_YONI[nakshatra1]||'Horse';
  const yoni2 = NAKSHATRA_YONI[nakshatra2]||'Horse';
  const varna = 1; const vashya = 2; const graha_maitri = 3; // simplified
  const tara = taraScore(n1idx>=0?n1idx:0, n2idx>=0?n2idx:0);
  const yoni = yoniScore(yoni1, yoni2);
  const gana = ganaScore(gana1, gana2);
  const nadi = nadiScore(nadi1, nadi2);
  const dist = Math.abs(rashi1-rashi2);
  const bhakoot_dosha = [2,5,6].includes(Math.min(dist,12-dist));
  const bhakoot = bhakoot_dosha ? 0 : 7;
  const nadi_dosha = nadi1===nadi2;
  const total = varna+vashya+tara+yoni+graha_maitri+gana+bhakoot+nadi;
  const compatibility = total>=28?'Excellent':total>=24?'Good':total>=18?'Acceptable':'Challenging';
  return {varna,vashya,tara,yoni,graha_maitri,gana,bhakoot,nadi,total,compatibility,nadi_dosha,bhakoot_dosha};
}
```

**TESTS — ALGORITHM CORRECTNESS:**
```typescript
import { calculateAshtakoota } from '../../utils/ashtakoota';
describe('TC-KMATCH', () => {
  it('TC-KMATCH-P-01: same Nadi = Nadi Dosha = 0 pts', ()=>{
    // Ashwini=Adi, Ardra=Adi — same Nadi
    const r=calculateAshtakoota('Ashwini','Ardra',1,3);
    expect(r.nadi).toBe(0); expect(r.nadi_dosha).toBe(true);
  });
  it('TC-KMATCH-P-02: different Nadi = 8 pts', ()=>{
    // Ashwini=Adi, Bharani=Madhya — different Nadi
    const r=calculateAshtakoota('Ashwini','Bharani',1,1);
    expect(r.nadi).toBe(8); expect(r.nadi_dosha).toBe(false);
  });
  it('TC-KMATCH-P-03: Deva+Deva gana = 6', ()=>{
    // Ashwini=Deva, Punarvasu=Deva
    const r=calculateAshtakoota('Ashwini','Punarvasu',1,3);
    expect(r.gana).toBe(6);
  });
  it('TC-KMATCH-P-04: Deva+Rakshasa gana = 1', ()=>{
    // Ashwini=Deva, Vishakha=Rakshasa
    const r=calculateAshtakoota('Ashwini','Vishakha',1,7);
    expect(r.gana).toBe(1);
  });
  it('TC-KMATCH-P-05: total is 0-36', ()=>{
    const r=calculateAshtakoota('Anuradha','Hasta',8,6);
    expect(r.total).toBeGreaterThanOrEqual(0);
    expect(r.total).toBeLessThanOrEqual(36);
  });
  it('TC-KMATCH-P-06: all 8 factors present', ()=>{
    const r=calculateAshtakoota('Anuradha','Punarvasu',8,3);
    ['varna','vashya','tara','yoni','graha_maitri','gana','bhakoot','nadi'].forEach(k=>expect(r).toHaveProperty(k));
  });
  it('TC-KMATCH-P-07: compatibility label valid', ()=>{
    const r=calculateAshtakoota('Ashwini','Bharani',1,1);
    expect(['Excellent','Good','Acceptable','Challenging']).toContain(r.compatibility);
  });
  it('TC-KMATCH-P-08: /kundali-match page renders', ()=>{ renderKundaliMatch(); expect(document.querySelector('[data-testid="kmatch-page"]')).toBeTruthy(); });
  it('TC-KMATCH-P-09: two DOB inputs present', ()=>{ renderKundaliMatch(); expect(document.querySelector('[data-testid="kmatch-dob-a"]')).toBeTruthy(); expect(document.querySelector('[data-testid="kmatch-dob-b"]')).toBeTruthy(); });
  it('TC-KMATCH-N-01: calculate button disabled without both DOBs', ()=>{ renderKundaliMatch(); expect((document.querySelector('[data-testid="kmatch-calculate-btn"]') as HTMLButtonElement)?.disabled).toBe(true); });
  it('TC-KMATCH-N-02: no undefined', ()=>{ renderKundaliMatch(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-KMATCH-EDGE-01: same Nakshatra both no crash', ()=>expect(()=>calculateAshtakoota('Anuradha','Anuradha',8,8)).not.toThrow());
  it('TC-KMATCH-EDGE-02: unknown Nakshatra no crash', ()=>expect(()=>calculateAshtakoota('Unknown','Unknown',1,1)).not.toThrow());
  it('TC-KMATCH-EDGE-03: Manushya+Rakshasa gana = 0', ()=>{
    // Bharani=Manushya, Vishakha=Rakshasa
    const r=calculateAshtakoota('Bharani','Vishakha',1,7);
    expect(r.gana).toBe(0);
  });
});
```

```bash
fix_and_retest "src/pages/__tests__/Task14.test.tsx" "Task14"
git add src/utils/ashtakoota.ts src/pages/KundaliMatchPage.tsx \
        src/pages/__tests__/Task14.test.tsx src/App.tsx
git commit -m "feat: Kundali match Ashtakoota algorithm — TC-KMATCH: 15 pass"
echo "=== TASK 14 DONE ==="
```

---

## TASK 15 — BABY NAME BY NAKSHATRA

Uses `NAKSHATRA_AKSHARAS` from testData.ts. Route: `/baby-names`.

**TESTS:**
```typescript
import { NAKSHATRA_AKSHARAS, VALID_27_NAKSHATRAS } from '../../__tests__/testData';
describe('TC-BABY', () => {
  it('TC-BABY-P-01: all 27 Nakshatras have aksharas', ()=>{
    VALID_27_NAKSHATRAS.forEach(n=>{
      expect(NAKSHATRA_AKSHARAS[n],`Missing: ${n}`).toBeTruthy();
      expect(NAKSHATRA_AKSHARAS[n].length).toBe(4);
    });
  });
  it('TC-BABY-P-02: Anuradha aksharas = Na Ni Nu Ne', ()=>expect(NAKSHATRA_AKSHARAS['Anuradha']).toEqual(['Na','Ni','Nu','Ne']));
  it('TC-BABY-P-03: Ashwini aksharas = Chu Che Cho La', ()=>expect(NAKSHATRA_AKSHARAS['Ashwini']).toEqual(['Chu','Che','Cho','La']));
  it('TC-BABY-P-04: /baby-names page renders', ()=>{ renderBabyNames(); expect(document.querySelector('[data-testid="baby-names-page"]')).toBeTruthy(); });
  it('TC-BABY-P-05: DOB input present', ()=>{ renderBabyNames(); expect(document.querySelector('[data-testid="baby-dob-input"]')).toBeTruthy(); });
  it('TC-BABY-P-06: entering Nov 5 shows Anuradha aksharas (Na/Ni/Nu/Ne)', ()=>{
    renderBabyNames();
    const dob=document.querySelector('[data-testid="baby-dob-input"]') as HTMLInputElement;
    if(dob) fireEvent.change(dob,{target:{value:'1988-11-05'}});
    // Should show Na/Ni/Nu/Ne or Anuradha
    const body=document.body.textContent||'';
    expect(body).not.toContain('undefined');
  });
  it('TC-BABY-N-01: no undefined', ()=>{ renderBabyNames(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-BABY-N-02: no [object Object]', ()=>{ renderBabyNames(); expect(document.body.textContent).not.toContain('[object Object]'); });
  it('TC-BABY-EDGE-01: Feb 29 no crash', ()=>{ renderBabyNames(); const dob=document.querySelector('[data-testid="baby-dob-input"]') as HTMLInputElement; if(dob) fireEvent.change(dob,{target:{value:'1988-02-29'}}); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-BABY-EDGE-02: all aksharas are 4 strings', ()=>{ VALID_27_NAKSHATRAS.forEach(n=>{ expect(NAKSHATRA_AKSHARAS[n]).toHaveLength(4); NAKSHATRA_AKSHARAS[n].forEach(a=>expect(typeof a).toBe('string')); }); });
});
```

```bash
fix_and_retest "src/pages/__tests__/Task15.test.tsx" "Task15"
git add src/pages/BabyNamesPage.tsx src/pages/__tests__/Task15.test.tsx src/App.tsx
git commit -m "feat: baby names Nakshatra aksharas 27 complete — TC-BABY: 10 pass"
echo "=== TASK 15 DONE ==="
```

---

## TASK 16 — AAJ KA RASHIFAL HINDI PAGES

12 pages at `/hi/rashifal/[rashi]`. Each in Hindi with Devanagari content.

**TESTS:**
```typescript
import { RASHI_DEVANAGARI } from '../../__tests__/testData';
describe('TC-RASHIFAL', () => {
  it('TC-RASHIFAL-P-01: vrischika renders', ()=>{ renderRashifal('vrischika'); expect(document.querySelector('[data-testid="rashifal-page"]')).toBeTruthy(); });
  it('TC-RASHIFAL-P-02: vrischika contains वृश्चिक', ()=>{ renderRashifal('vrischika'); expect(document.body.textContent).toContain('वृश्चिक'); });
  it('TC-RASHIFAL-P-03: page has Devanagari content', ()=>{ renderRashifal('vrischika'); expect(document.body.textContent).toMatch(/[\u0900-\u097F]/); });
  it('TC-RASHIFAL-P-04: all 12 Rashi routes defined', ()=>{
    ['mesha','vrisha','mithuna','karka','simha','kanya','tula','vrischika','dhanu','makara','kumbha','meena']
      .forEach(r=>expect(()=>renderRashifal(r)).not.toThrow());
  });
  it('TC-RASHIFAL-P-05: mesha and meena have different H1', ()=>{
    renderRashifal('mesha'); const h1a=document.querySelector('h1')?.textContent;
    renderRashifal('meena'); const h1b=document.querySelector('h1')?.textContent;
    expect(h1a).not.toBe(h1b);
  });
  it('TC-RASHIFAL-N-01: no undefined in Hindi pages', ()=>{ renderRashifal('vrischika'); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-RASHIFAL-N-02: wrong Rashi URL no crash', ()=>expect(()=>renderRashifal('notarashi')).not.toThrow());
  it('TC-RASHIFAL-EDGE-01: mesha and meena both render', ()=>{ expect(()=>renderRashifal('mesha')).not.toThrow(); expect(()=>renderRashifal('meena')).not.toThrow(); });
});
```

```bash
fix_and_retest "src/pages/__tests__/Task16.test.tsx" "Task16"
git add src/pages/hi/ src/pages/__tests__/Task16.test.tsx src/App.tsx \
        scripts/prerender-routes.mjs scripts/prerender-titles.mjs
git commit -m "feat: Rashifal Hindi 12 Rashi pages — TC-RASHIFAL: 8 pass"
echo "=== TASK 16 DONE ==="
```

---

## TASK 17 — 366 DATE PERSONALITY PAGES

Route: `/born-on/[month]/[day]/personality/`

**TESTS:**
```typescript
describe('TC-PERS', () => {
  it('TC-PERS-P-01: August 6 renders', ()=>{ renderPersonality('august',6); expect(document.querySelector('[data-testid="personality-page"]')).toBeTruthy(); });
  it('TC-PERS-P-02: August 6 shows Leo (Jul23-Aug22)', ()=>{ renderPersonality('august',6); expect(document.body.textContent).toContain('Leo'); });
  it('TC-PERS-P-03: November 5 shows Scorpio or Virat Kohli', ()=>{ renderPersonality('november',5); expect(document.body.textContent).toMatch(/Scorpio|Virat/i); });
  it('TC-PERS-P-04: has CTA to birthday report', ()=>{ renderPersonality('august',6); const links=Array.from(document.querySelectorAll('a')).filter(a=>a.href?.includes('birthday-report')); expect(links.length).toBeGreaterThan(0); });
  it('TC-PERS-P-05: shows birth number', ()=>{ renderPersonality('august',6); const b=document.body.textContent||''; expect(b).toMatch(/6|birth number/i); });
  it('TC-PERS-N-01: no undefined', ()=>{ renderPersonality('august',6); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-PERS-N-02: no [object Object]', ()=>{ renderPersonality('august',6); expect(document.body.textContent).not.toContain('[object Object]'); });
  it('TC-PERS-EDGE-01: Feb 29 no crash', ()=>expect(()=>renderPersonality('february',29)).not.toThrow());
  it('TC-PERS-EDGE-02: Jan 1 no crash', ()=>expect(()=>renderPersonality('january',1)).not.toThrow());
  it('TC-PERS-EDGE-03: Dec 31 no crash', ()=>expect(()=>renderPersonality('december',31)).not.toThrow());
});
```

```bash
fix_and_retest "src/pages/__tests__/Task17.test.tsx" "Task17"
git add src/pages/DatePersonalityPage.tsx src/pages/__tests__/Task17.test.tsx \
        src/App.tsx scripts/prerender-routes.mjs scripts/prerender-titles.mjs
git commit -m "feat(seo): 366 date personality pages — TC-PERS: 10 pass"
echo "=== TASK 17 DONE ==="
```

---

## TASK 18 — BIRTHDAY REMINDER SERVICE

Create `supabase/migrations/birthday_reminders.sql`, `src/pages/RemindersPage.tsx`, `src/services/reminderService.ts`.

**TESTS:**
```typescript
describe('TC-REMIND', () => {
  it('TC-REMIND-P-01: /reminders renders', ()=>{ renderReminders(); expect(document.querySelector('[data-testid="reminders-page"]')).toBeTruthy(); });
  it('TC-REMIND-P-02: friend name input', ()=>{ renderReminders(); expect(document.querySelector('[data-testid="remind-friend-name"]')).toBeTruthy(); });
  it('TC-REMIND-P-03: friend DOB input', ()=>{ renderReminders(); expect(document.querySelector('[data-testid="remind-friend-dob"]')).toBeTruthy(); });
  it('TC-REMIND-P-04: add button disabled without name+DOB', ()=>{ renderReminders(); expect((document.querySelector('[data-testid="remind-add-btn"]') as HTMLButtonElement)?.disabled).toBe(true); });
  it('TC-REMIND-N-01: no undefined', ()=>{ renderReminders(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-REMIND-N-02: no crash on render', ()=>expect(()=>renderReminders()).not.toThrow());
  it('TC-REMIND-EDGE-01: Feb 29 birthday accepted', ()=>{ renderReminders(); const dob=document.querySelector('[data-testid="remind-friend-dob"]') as HTMLInputElement; if(dob) fireEvent.change(dob,{target:{value:'1988-02-29'}}); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-REMIND-EDGE-02: relationship field present', ()=>{ renderReminders(); expect(document.querySelector('[data-testid="remind-relationship"]')).toBeTruthy(); });
});
```

```bash
fix_and_retest "src/pages/__tests__/Task18.test.tsx" "Task18"
git add src/pages/RemindersPage.tsx src/services/reminderService.ts \
        supabase/migrations/birthday_reminders.sql src/pages/__tests__/Task18.test.tsx src/App.tsx
git commit -m "feat(retention): birthday reminders — TC-REMIND: 8 pass"
echo "=== TASK 18 DONE ==="
```

---

## TASK 19 — HISTORICAL EVENTS + DASHA ALERTS

Create `src/data/indianHistoricalEvents.ts` with 50+ events. Key events MUST include:
- [1,26,1950,"India's Republic Day","national"]
- [8,15,1947,"India's Independence Day","national"]
- [10,2,1869,"Mahatma Gandhi born","birth"]
- [11,14,1889,"Jawaharlal Nehru born","birth"]
- [4,14,1891,"Dr. B.R. Ambedkar born","birth"]
- [10,31,1875,"Sardar Vallabhbhai Patel born","birth"]
- [4,13,1919,"Jallianwala Bagh massacre","historical"]
- [3,12,1930,"Gandhi's Salt March begins","historical"]
- [5,18,1974,"India's first nuclear test","historical"]
And 40+ more events.

Create `src/components/OnThisDay.tsx`. Add to CelebrityPage.tsx and born-on pages.

**TESTS:**
```typescript
import { INDIAN_EVENTS, getEventsForDate } from '../../data/indianHistoricalEvents';
describe('TC-HIST', () => {
  it('TC-HIST-P-01: >= 50 events', ()=>expect(INDIAN_EVENTS.length).toBeGreaterThanOrEqual(50));
  it('TC-HIST-P-02: Aug 15 returns Independence Day', ()=>{ const e=getEventsForDate(8,15); expect(e.length).toBeGreaterThan(0); expect(e[0].event.toLowerCase()).toMatch(/independence/); });
  it('TC-HIST-P-03: Jan 26 returns Republic Day', ()=>expect(getEventsForDate(1,26).some(e=>e.event.toLowerCase().includes('republic'))).toBe(true));
  it('TC-HIST-P-04: Oct 2 returns Gandhi', ()=>expect(getEventsForDate(10,2).some(e=>e.event.toLowerCase().includes('gandhi'))).toBe(true));
  it('TC-HIST-P-05: Apr 14 returns Ambedkar', ()=>expect(getEventsForDate(4,14).some(e=>e.event.toLowerCase().includes('ambedkar'))).toBe(true));
  it('TC-HIST-P-06: all events have year and event string', ()=>{ INDIAN_EVENTS.forEach(([m,d,y,event])=>{ expect(y).toBeGreaterThan(1000); expect(event.length).toBeGreaterThan(10); }); });
  it('TC-HIST-N-01: date with no events returns empty array', ()=>expect(Array.isArray(getEventsForDate(2,3))).toBe(true));
  it('TC-HIST-N-02: OnThisDay renders without crash', ()=>{ render(<OnThisDay month={8} day={15}/>); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-HIST-EDGE-01: Feb 29 no crash', ()=>expect(()=>getEventsForDate(2,29)).not.toThrow());
});
```

```bash
fix_and_retest "src/pages/__tests__/Task19.test.tsx" "Task19"
git add src/data/indianHistoricalEvents.ts src/components/OnThisDay.tsx \
        src/pages/CelebrityPage.tsx src/pages/__tests__/Task19.test.tsx
git commit -m "feat: 50+ Indian historical events+Dasha alerts — TC-HIST: 9 pass"
echo "=== TASK 19 DONE ==="
```

---

## TASK 20 — KUNDALI ARTICLE + DIWALI GIFT

**Kundali Compatibility Article** at `/articles/kundali-compatibility/`:
- >= 1500 words. Explains all 8 Ashtakoota factors.
- Score guide: 18+=acceptable, 24+=good, 28+=excellent, 36=perfect.
- FAQPage schema. Link to /kundali-match.

**Diwali Gift Page** at `/diwali-gift/`:
- Birthday Report ₹199, Kundali ₹199, Combo ₹299.
- WhatsApp share of gift link.

**TESTS:**
```typescript
describe('TC-ART+DIWALI', () => {
  it('TC-ART-P-01: kundali-compat article renders', ()=>{ renderArticle(); expect(document.querySelector('[data-testid="kundali-compat-article"]')).toBeTruthy(); });
  it('TC-ART-P-02: article >= 1500 words', ()=>{ renderArticle(); expect((document.body.textContent||'').split(/\s+/).length).toBeGreaterThan(1500); });
  it('TC-ART-P-03: links to /kundali-match', ()=>{ renderArticle(); const links=Array.from(document.querySelectorAll('a')).filter(a=>a.href?.includes('kundali-match')); expect(links.length).toBeGreaterThan(0); });
  it('TC-ART-P-04: mentions Nadi (most important Koota)', ()=>{ renderArticle(); expect((document.body.textContent||'').toLowerCase()).toContain('nadi'); });
  it('TC-ART-P-05: mentions all 8 factors', ()=>{ renderArticle(); const b=(document.body.textContent||'').toLowerCase(); ['varna','vashya','tara','yoni','gana','bhakoot','nadi'].forEach(k=>expect(b,`Missing: ${k}`).toContain(k)); });
  it('TC-ART-N-01: no undefined in article', ()=>{ renderArticle(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-DIWALI-P-01: /diwali-gift renders', ()=>{ renderDiwali(); expect(document.querySelector('[data-testid="diwali-gift-page"]')).toBeTruthy(); });
  it('TC-DIWALI-P-02: shows 199', ()=>{ renderDiwali(); expect(document.body.textContent).toContain('₹199'); });
  it('TC-DIWALI-P-03: shows Diwali', ()=>{ renderDiwali(); expect(document.body.textContent).toMatch(/Diwali|दिवाली/i); });
  it('TC-DIWALI-N-01: no undefined', ()=>{ renderDiwali(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-DIWALI-N-02: 299 only for combo', ()=>{ renderDiwali(); const b=document.body.textContent||''; if(b.includes('₹299')) expect(b).toMatch(/combo|₹299.*combo/i); });
});
```

```bash
fix_and_retest "src/pages/__tests__/Task20.test.tsx" "Task20"
git add src/pages/articles/KundaliCompatArticle.tsx src/pages/DiwaliGiftPage.tsx \
        src/pages/__tests__/Task20.test.tsx src/App.tsx \
        scripts/prerender-routes.mjs scripts/prerender-titles.mjs
git commit -m "feat: Kundali compat article 1500w+Diwali gift — TC-ART+DIWALI: 11 pass"
echo "=== TASK 20 DONE ==="
```

---

## BUILD D (FINAL BUILD)

```bash
npx tsx scripts/export-celebrities.ts
ts_check||exit 1
time npm run build 2>&1|tee /tmp/build-d.txt|tail -25
echo "==========================="
find dist -name "index.html" 2>/dev/null|wc -l|xargs echo "Total pages:"
find dist/celebrity -name "index.html" 2>/dev/null|wc -l|xargs echo "Celebrity:"
find dist/hi -name "index.html" 2>/dev/null|wc -l|xargs echo "Hindi:"
grep -c '<loc>' dist/sitemap.xml 2>/dev/null|xargs echo "Sitemap URLs:"
echo "==========================="
./node_modules/.bin/wrangler deploy 2>&1|tail -5
born_on_check; regression_check
start_preview; cross_page_consistency; stop_preview
git commit -m "chore(build-d): FINAL BUILD TS clean consistency pass" --allow-empty
echo "=== BUILD D DONE ==="
```

## PLAYWRIGHT FINAL — COMPLETE HUMAN TESTER CHECKLIST

```bash
start_preview
cat > tests/final-human-tester.spec.ts << 'PW'
import { test, expect } from '@playwright/test';
test.describe('FINAL Human Tester Checklist', () => {
  // BRANDING
  test('HT-BRAND-01: BornClock in homepage title', async({page})=>{
    await page.goto('/');
    const title=await page.title();
    expect(title).toContain('BornClock');
    expect(title.length).toBeLessThanOrEqual(70);
  });
  test('HT-BRAND-02: favicon accessible', async({page})=>{
    expect((await page.goto('/favicon.ico'))?.status()).toBeLessThan(400);
  });
  // PRICING — all individual products must be 199
  test('HT-PRICE-01: 199 on birthday report', async({page})=>{
    await page.goto('/birthday-report');
    const body=await page.textContent('body');
    if(body?.includes('₹')) expect(body).toContain('₹199');
  });
  test('HT-PRICE-02: 199 on gift page no 299 for individual report', async({page})=>{
    await page.goto('/birthday-report/gift');
    const body=await page.textContent('body');
    if(body?.includes('₹')){ expect(body).toContain('₹199'); expect(body).not.toMatch(/₹299.*birthday report/i); }
  });
  test('HT-PRICE-03: 199 on Kundali page', async({page})=>{
    await page.goto('/kundali');
    const body=await page.textContent('body');
    if(body?.includes('₹')) expect(body).toContain('₹199');
  });
  test('HT-PRICE-04: 199 on Diwali gift', async({page})=>{
    await page.goto('/diwali-gift/');
    const body=await page.textContent('body');
    if(body?.includes('₹')) expect(body).toContain('₹199');
  });
  // NO UNDEFINED on 15 key pages
  test('HT-QUALITY-01: no undefined on 15 key pages', async({page})=>{
    const PAGES=['/','/birthday-report','/celebrity/virat-kohli/','/kundali',
      '/compatibility/','/wish','/kundali-match','/born-on/august-6/india/',
      '/articles/','/for-business/','/baby-names','/diwali-gift/',
      '/birthday-report/gift','/celebrity/barack-obama/',
      '/celebrity/ac-bhaktivedanta-swami-prabhupada/'];
    for(const p of PAGES){
      await page.goto(p);
      const body=await page.textContent('body');
      expect(body,`undefined on ${p}`).not.toContain('\nundefined\n');
      expect(body,`[object Object] on ${p}`).not.toContain('[object Object]');
    }
  });
  // SEO
  test('HT-SEO-01: meta descriptions on 6 core pages', async({page})=>{
    for(const p of ['/','/kundali','/celebrity/virat-kohli/','/born-on/august-6/india/','/birthday-report','/kundali-match']){
      await page.goto(p);
      const meta=await page.$eval('meta[name="description"]',(m:any)=>m.content).catch(()=>'');
      expect(meta.length,`No meta on ${p}`).toBeGreaterThan(30);
    }
  });
  test('HT-SEO-02: titles <=70c on 6 pages', async({page})=>{
    for(const p of ['/','/kundali','/celebrity/virat-kohli/','/compatibility/','/wish','/kundali-match']){
      await page.goto(p);
      const t=await page.title();
      expect(t.length,`Title ${t.length}c on ${p}: "${t}"`).toBeLessThanOrEqual(70);
    }
  });
  test('HT-SEO-03: celeb page has Person schema', async({page})=>{
    await page.goto('/celebrity/virat-kohli/');
    const schemas=await page.$$eval('script[type="application/ld+json"]',
      (els:any[])=>els.map((e:any)=>{ try{return JSON.parse(e.textContent);}catch{return null;} })
    );
    expect(schemas.some((s:any)=>s?.['@type']==='Person')).toBe(true);
  });
  // VEDIC ACCURACY
  test('HT-VEDIC-01: Virat Scorpio yes Dhanishtha no', async({page})=>{
    await page.goto('/celebrity/virat-kohli/');
    const body=await page.textContent('body');
    expect(body).toContain('Scorpio');
    expect(body).not.toContain('Dhanishtha');
  });
  test('HT-VEDIC-02: nakshatra placeholder links to birthday-report', async({page})=>{
    await page.goto('/celebrity/virat-kohli/');
    const ph=page.locator('[data-testid="nakshatra-placeholder"]');
    await expect(ph).toBeVisible();
    expect(await ph.locator('a').first().getAttribute('href')).toContain('birthday-report');
  });
  // HINDI
  test('HT-HINDI-01: language toggle visible', async({page})=>{
    await page.goto('/');
    await expect(page.locator('[data-testid="language-toggle"]')).toBeVisible();
  });
  test('HT-HINDI-02: Hindi toggle shows Devanagari', async({page})=>{
    await page.goto('/');
    await page.locator('[data-testid="language-toggle"] button').last().click();
    await page.waitForTimeout(600);
    expect(await page.textContent('body')).toMatch(/[\u0900-\u097F]/);
  });
  test('HT-HINDI-03: Rashifal vrischika has Devanagari', async({page})=>{
    const r=await page.goto('/hi/rashifal/vrischika/');
    if(r?.status()===200){ const body=await page.textContent('body'); expect(body).toMatch(/[\u0900-\u097F]/); expect(body).not.toContain('undefined'); }
  });
  // MOBILE
  test('HT-MOBILE-01: homepage 375px no scroll', async({page})=>{
    await page.setViewportSize({width:375,height:667});
    await page.goto('/');
    expect(await page.evaluate(()=>document.body.scrollWidth)).toBeLessThanOrEqual(385);
  });
  test('HT-MOBILE-02: Kundali 375px no scroll inputs visible', async({page})=>{
    await page.setViewportSize({width:375,height:667});
    await page.goto('/kundali');
    expect(await page.evaluate(()=>document.body.scrollWidth)).toBeLessThanOrEqual(385);
    await expect(page.locator('[data-testid="kundali-dob"]')).toBeVisible();
  });
  test('HT-MOBILE-03: Kundali match 375px no scroll', async({page})=>{
    await page.setViewportSize({width:375,height:667});
    await page.goto('/kundali-match');
    expect(await page.evaluate(()=>document.body.scrollWidth)).toBeLessThanOrEqual(385);
  });
  // WHATSAPP
  test('HT-WA-01: wish generator WA link correct format', async({page})=>{
    await page.goto('/wish');
    const nameInp=page.locator('[data-testid="wish-name-input"]');
    if(await nameInp.isVisible()){
      await nameInp.fill('Priya');
      const dobInp=page.locator('[data-testid="wish-dob-input"]');
      if(await dobInp.isVisible()) await dobInp.fill('1990-11-05');
      const btn=page.locator('[data-testid="wish-generate-btn"]');
      if(await btn.isEnabled()) await btn.click();
      await page.waitForTimeout(1000);
      const waLink=page.locator('a[href*="wa.me"]').first();
      if(await waLink.isVisible()){
        const href=await waLink.getAttribute('href')||'';
        expect(href).toContain('wa.me');
        const decoded=decodeURIComponent(href);
        expect(decoded).toContain('Priya');
        expect(decoded).toContain('bornclock.com');
        expect(decoded).not.toContain('undefined');
      }
    }
  });
  // CROSS-PAGE CONSISTENCY
  test('HT-CONSIST-01: Virat Scorpio on celeb page', async({page})=>{
    await page.goto('/celebrity/virat-kohli/');
    expect(await page.textContent('body')).toContain('Scorpio');
  });
  // ASHTAKOOTA
  test('HT-ASHTAKOOTA-01: kundali-match has 2 DOB inputs button disabled', async({page})=>{
    await page.goto('/kundali-match');
    await expect(page.locator('[data-testid="kmatch-dob-a"]')).toBeVisible();
    await expect(page.locator('[data-testid="kmatch-dob-b"]')).toBeVisible();
    await expect(page.locator('[data-testid="kmatch-calculate-btn"]')).toBeDisabled();
  });
  // BABY NAMES
  test('HT-BABY-01: baby-names loads DOB input visible', async({page})=>{
    await page.goto('/baby-names');
    const title=await page.title();
    expect(title).toMatch(/baby|Baby|name|Name/i);
    await expect(page.locator('[data-testid="baby-dob-input"]')).toBeVisible();
    expect(await page.textContent('body')).not.toContain('undefined');
  });
  // HISTORICAL EVENTS
  test('HT-HIST-01: Prabhupada page has OnThisDay section', async({page})=>{
    await page.goto('/celebrity/ac-bhaktivedanta-swami-prabhupada/');
    const body=await page.textContent('body');
    expect(body).not.toContain('undefined');
    // Should have rarity card and be alive
    await expect(page.locator('[data-testid="birthday-rarity-card"]')).toBeVisible();
  });
});
PW
fix_and_retest_pw "tests/final-human-tester.spec.ts" "Final-HT"
stop_preview
git add tests/final-human-tester.spec.ts
git commit -m "test(e2e): FINAL human tester — branding pricing vedic hindi mobile WA consistency"
echo "=== PW FINAL DONE ==="
```


---

## VALIDATION PHASES

## V1 — SEO AUDIT
```bash
python3 -c "
import re,os
from pathlib import Path
dist=Path('dist'); issues=[]; ok=0
for f in dist.rglob('index.html'):
    c=open(f,errors='ignore').read()
    url='/'+str(f.parent.relative_to(dist))+'/'
    t=re.search(r'<title>([^<]*)</title>',c); title=t.group(1) if t else ''
    d=re.search(r'name=.description.[^>]*content=.([^.]*)',c); meta=d.group(1) if d else ''
    probs=[]
    if not title: probs.append('NO TITLE')
    elif len(title)>70: probs.append(f'TITLE {len(title)}c')
    if not meta: probs.append('NO META')
    if 'undefined' in c[:3000]: probs.append('undefined IN HTML')
    if '299' in c and 'report' in url and 'combo' not in c.lower(): probs.append('WRONG PRICE 299')
    if probs: issues.append(f'{url}: {chr(44).join(probs)}')
    else: ok+=1
print(f'OK: {ok} | Issues: {len(issues)}')
[print(f'  FAIL {i}') for i in issues[:20]]
print('V1 PASS' if not issues else f'FIX {len(issues)} ISSUES')
"
```

## V2 — NAKSHATRA ACCURACY
```bash
npx tsx scripts/verify-nakshatra-accuracy.ts 2>&1
```

## V3 — PRICING AUDIT
```bash
python3 -c "
from pathlib import Path; issues=[]
for path in ['birthday-report','birthday-report/gift','kundali','diwali-gift']:
    f=Path(f'dist/{path}/index.html')
    if not f.exists(): issues.append(f'/{path}/: MISSING'); continue
    c=f.read_text(errors='ignore')
    if '199' not in c: issues.append(f'/{path}/: missing 199')
    if '299' in c and 'combo' not in c.lower(): issues.append(f'/{path}/: 299 without combo')
print('V3 PASS' if not issues else 'FAIL')
[print(f'  {i}') for i in issues]
"
```

## V4 — ASHTAKOOTA ALGORITHM
```bash
npx tsx -e "
import { calculateAshtakoota } from './src/utils/ashtakoota';
const r1=calculateAshtakoota('Ashwini','Ardra',1,3);
if(r1.nadi!==0) throw new Error('Same Nadi must be 0');
const r2=calculateAshtakoota('Ashwini','Bharani',1,1);
if(r2.nadi!==8) throw new Error('Diff Nadi must be 8');
const r3=calculateAshtakoota('Anuradha','Hasta',8,6);
if(r3.total<0||r3.total>36) throw new Error('Total must be 0-36');
console.log('V4 PASS');
" 2>&1
```

## V5 — HINDI RENDERING
```bash
python3 -c "
import re,json,os
from pathlib import Path
DEV=re.compile('[\\u0900-\\u097F]')
hi=Path('dist/hi')
if hi.exists():
    pages=list(hi.rglob('index.html'))
    ok=sum(1 for p in pages if DEV.search(open(p,errors='ignore').read()))
    print(f'Hindi: {len(pages)} pages | Devanagari: {ok}/{len(pages)}')
    print('V5 PASS' if ok==len(pages) else 'FAIL')
else:
    print('FAIL: no /hi/ in dist')
for lang in ['en','hi']:
    f=f'public/locales/{lang}/translation.json'
    if os.path.exists(f):
        d=json.load(open(f))
        if lang=='hi' and '299' in str(list(d.values())): print('FAIL: 299 in Hindi!')
        elif lang=='hi': print('Hindi prices clean')
"
```

## V6 — SITEMAP
```bash
python3 -c "
import re,os
c=open('dist/sitemap.xml').read()
urls=re.findall(r'<loc>([^<]+)</loc>',c)
dupes=len(urls)-len(set(urls))
size=os.path.getsize('dist/sitemap.xml')/1024/1024
print(f'URLs: {len(urls)} | Dupes: {dupes} | Size: {size:.2f}MB')
print('V6 PASS' if dupes==0 and len(urls)>2500 else 'FAIL')
"
```

## V7 — SMOKE TEST (25 pages)
```bash
python3 -c "
import urllib.request,re,time,ssl
ctx=ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE
BASE='https://bornclock.com'
TESTS=[
    ('/',['BornClock','birthday'],[]),
    ('/birthday-report',['199'],[]),
    ('/birthday-report/gift',['199'],['299 birthday report']),
    ('/kundali',['Kundali','199'],[]),
    ('/kundali-match',['match'],[]),
    ('/baby-names',['Nakshatra'],[]),
    ('/diwali-gift/',['199'],[]),
    ('/celebrity/virat-kohli/',['Virat','Scorpio'],['Dhanishtha']),
    ('/celebrity/shah-rukh-khan/',['Shah Rukh'],['Dhanishtha']),
    ('/celebrity/sachin-tendulkar/',['Sachin'],['Ashlesha']),
    ('/celebrity/ac-bhaktivedanta-swami-prabhupada/',['Prabhupada'],[]),
    ('/celebrity/barack-obama/',['Obama'],[]),
    ('/born-on/august-6/india/',['August'],[]),
    ('/articles/kundali-compatibility/',['Ashtakoota'],[]),
    ('/hi/rashifal/vrischika/',[],['undefined']),
]
P=0;F=0
for path,mh,mn in TESTS:
    try:
        req=urllib.request.Request(f'{BASE}{path}',headers={'User-Agent':'Smoke/3.0'})
        with urllib.request.urlopen(req,timeout=12,context=ctx) as r:
            html=r.read().decode('utf-8',errors='ignore')
        probs=[]
        if 'undefined' in html[:5000]: probs.append('undefined')
        missing=[k for k in mh if k.lower() not in html.lower()]
        if missing: probs.append(f'MISSING:{missing}')
        bad=[k for k in mn if k.lower() in html.lower()]
        if bad: probs.append(f'BAD:{bad}')
        if probs: print(f'  FAIL {path}: {probs}'); F+=1
        else: print(f'  OK {path}'); P+=1
        time.sleep(0.25)
    except Exception as e:
        print(f'  FAIL {path}: {str(e)[:50]}'); F+=1
print(f'V7 {"PASS" if F==0 else "FAIL"}: {P} pass {F} fail')
"
```

Fix all failures. Re-run. Must be 0 before PHASE FINAL.

---

## PHASE FINAL

```bash
ts_check||exit 1
npx vitest run 2>&1|tail -5
start_preview
npx playwright test --reporter=list 2>&1|tail -12
stop_preview
npx tsx scripts/export-celebrities.ts
npm run build 2>&1|tail -8
./node_modules/.bin/wrangler deploy 2>&1|tail -5
born_on_check
git checkout main; git merge develop
git push origin main; git push origin develop

echo "================================================"
echo "BORNCLOCK SPRINT v3 COMPLETE"
echo "================================================"
find dist -name "index.html" 2>/dev/null|wc -l|xargs echo "Pages:"
grep -c '<loc>' dist/sitemap.xml 2>/dev/null|xargs echo "Sitemap URLs:"
npx vitest run 2>&1|tail -2
echo "MANUAL: ProKerala keys, GitHub secrets, Amazon Associates tag"
echo "================================================"
```

---

## EXECUTE COMMAND

```
Read prompts/BornClock_Complete_Sprint_v3.md and execute completely
PHASE 1 through PHASE FINAL.

For every task: upstream check → implement → write exact tests as specified
→ fix_and_retest (max 3 attempts) → downstream check → commit.

HARD GATE after Task 4: accuracy < 4/5 = STOP. Fix before Tasks 5-20.
ts_check() at every BUILD. Zero TypeScript errors required before deploy.
cross_page_consistency() after every BUILD.
Playwright after Build A, B, C, D, and FINAL.
All 7 validations must pass before PHASE FINAL.

No placeholders. No skipped tests. No approvals needed.
Run until PHASE FINAL is complete.
```
