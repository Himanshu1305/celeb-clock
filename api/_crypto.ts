// Shared Web Crypto utilities for Razorpay HMAC verification.
// Used by razorpay-webhook.ts and verify-payment.ts.
//
// Uses globalThis.crypto.subtle (Web Crypto API):
//   - Node.js 18+: available as globalThis.crypto (no import needed)
//   - CF Workers: native global
// CF Workers note (Phase 2): if running WITHOUT Node compat mode,
// this file already works as-is — no changes needed.

// Decode a lowercase hex string to raw bytes.
// Returns Uint8Array(0) for empty, odd-length, or non-hex input so that
// subtle.verify returns false rather than throwing — the caller always gets
// a clean false → 403, never a 500.
export function hexToBytes(hex: string): Uint8Array {
  if (hex && !/^[0-9a-f]+$/i.test(hex)) return new Uint8Array(0);
  if (!hex || hex.length % 2 !== 0) return new Uint8Array(0);
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    if (isNaN(byte)) return new Uint8Array(0);
    bytes[i / 2] = byte;
  }
  return bytes;
}

// Verify a Razorpay HMAC-SHA256 signature using Web Crypto (constant-time).
// sigHex  — the hex string received (header or body field).
// message — the bytes to verify over (ArrayBuffer for webhook raw body,
//           or Uint8Array from TextEncoder for verify-payment message string).
// Returns false (never throws) on any error including malformed sigHex.
export async function verifyHmacSha256(
  secret: string,
  message: ArrayBuffer | Uint8Array,
  sigHex: string,
): Promise<boolean> {
  try {
    const subtle = (globalThis.crypto as Crypto).subtle;
    const key = await subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const sigBytes = hexToBytes(sigHex);
    // subtle.verify is constant-time by spec; returns false on any mismatch
    // including length mismatch — no timingSafeEqual needed.
    // Cast: TS5 ArrayBufferLike vs ArrayBuffer incompatibility with DOM SubtleCrypto typings.
    return await subtle.verify('HMAC', key, sigBytes as unknown as ArrayBuffer, message as unknown as ArrayBuffer);
  } catch {
    return false;
  }
}
