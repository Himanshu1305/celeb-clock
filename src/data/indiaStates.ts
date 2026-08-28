// Official GST state/UT codes (as used on the tax invoice). These are the
// authoritative codes from the GST portal — NOT the draft list in the build
// prompt, which contained duplicate/incorrect codes (e.g. Bihar, Punjab, J&K).
// Telangana = 36 (this supplier's home state → intra-state CGST/SGST).
export interface IndiaState { name: string; code: string; }

export const INDIA_STATES: IndiaState[] = [
  { name: 'Jammu & Kashmir', code: '01' },
  { name: 'Himachal Pradesh', code: '02' },
  { name: 'Punjab', code: '03' },
  { name: 'Chandigarh', code: '04' },
  { name: 'Uttarakhand', code: '05' },
  { name: 'Haryana', code: '06' },
  { name: 'Delhi', code: '07' },
  { name: 'Rajasthan', code: '08' },
  { name: 'Uttar Pradesh', code: '09' },
  { name: 'Bihar', code: '10' },
  { name: 'Sikkim', code: '11' },
  { name: 'Arunachal Pradesh', code: '12' },
  { name: 'Nagaland', code: '13' },
  { name: 'Manipur', code: '14' },
  { name: 'Mizoram', code: '15' },
  { name: 'Tripura', code: '16' },
  { name: 'Meghalaya', code: '17' },
  { name: 'Assam', code: '18' },
  { name: 'West Bengal', code: '19' },
  { name: 'Jharkhand', code: '20' },
  { name: 'Odisha', code: '21' },
  { name: 'Chhattisgarh', code: '22' },
  { name: 'Madhya Pradesh', code: '23' },
  { name: 'Gujarat', code: '24' },
  { name: 'Dadra & Nagar Haveli and Daman & Diu', code: '26' },
  { name: 'Maharashtra', code: '27' },
  { name: 'Karnataka', code: '29' },
  { name: 'Goa', code: '30' },
  { name: 'Lakshadweep', code: '31' },
  { name: 'Kerala', code: '32' },
  { name: 'Tamil Nadu', code: '33' },
  { name: 'Puducherry', code: '34' },
  { name: 'Andaman & Nicobar Islands', code: '35' },
  { name: 'Telangana', code: '36' },
  { name: 'Andhra Pradesh', code: '37' },
  { name: 'Ladakh', code: '38' },
];

export const SUPPLIER_STATE_CODE = '36'; // Telangana

export function taxModeFor(country: 'India' | 'Outside', stateCode: string | null): 'CGST_SGST' | 'IGST' | 'EXPORT' {
  if (country === 'Outside') return 'EXPORT';
  if (stateCode === SUPPLIER_STATE_CODE) return 'CGST_SGST';
  return 'IGST';
}

// True only for a code that resolves to a real GST state/UT. Used to validate the
// place-of-supply on both the client (MissingStateModal) and the server
// (api/update-buyer-state) so a bad code can never reach the invoices row.
export function isValidIndiaStateCode(code: string | null | undefined): boolean {
  return !!code && INDIA_STATES.some(s => s.code === code);
}

// Resolve the canonical state name for a code, or null if the code is unknown.
export function stateNameForCode(code: string | null | undefined): string | null {
  if (!code) return null;
  return INDIA_STATES.find(s => s.code === code)?.name ?? null;
}
