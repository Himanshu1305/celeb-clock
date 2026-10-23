import { useEffect, useState } from 'react';
import { IST_ZONE, detectViewerTimeZone } from '@/lib/viewerTime';

/**
 * The viewer's IANA time zone. Starts as IST (what prerendered HTML shows) and
 * switches to the browser's zone after mount, so server and client markup match.
 */
export function useViewerTimeZone(): string {
  const [tz, setTz] = useState(IST_ZONE);
  useEffect(() => { setTz(detectViewerTimeZone()); }, []);
  return tz;
}
