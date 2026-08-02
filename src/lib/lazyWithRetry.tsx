import { lazy, Component, type ComponentType, type ReactNode } from 'react';

/**
 * Stale-chunk resilience (BATCH-9 P2).
 *
 * After a deploy, a browser holding the OLD index bundle requests lazy route chunks whose
 * hashed filenames no longer exist → the dynamic import rejects → the route renders nothing
 * (white screen). This wraps React.lazy centrally: on a chunk-load failure, force ONE full
 * reload (so the browser fetches the new index + chunk names), guarded by a sessionStorage
 * flag against reload loops; if it STILL fails after that, the ChunkErrorBoundary shows a
 * friendly "refresh to update" message instead of a blank page.
 */

const RELOAD_KEY = 'bc_chunk_reloaded';

/** Heuristic for a stale/failed dynamic-import (chunk) error across browsers. */
export function isChunkLoadError(e: unknown): boolean {
  const err = e as { message?: string; name?: string } | null;
  const msg = err?.message ?? '';
  const name = err?.name ?? '';
  return (
    name === 'ChunkLoadError' ||
    /Loading chunk [\d]+ failed/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /dynamically imported module/i.test(msg)
  );
}

export interface ReloadDeps {
  getFlag: () => boolean;
  setFlag: () => void;
  clearFlag: () => void;
  reload: () => void;
}

const realDeps: ReloadDeps = {
  getFlag: () => { try { return sessionStorage.getItem(RELOAD_KEY) === '1'; } catch { return false; } },
  setFlag: () => { try { sessionStorage.setItem(RELOAD_KEY, '1'); } catch { /* ignore */ } },
  clearFlag: () => { try { sessionStorage.removeItem(RELOAD_KEY); } catch { /* ignore */ } },
  reload: () => { try { window.location.reload(); } catch { /* ignore */ } },
};

/**
 * Testable core. On a chunk error: if we haven't already reloaded this session, set the guard
 * and reload ONCE (returning a never-resolving promise so nothing renders during the reload);
 * otherwise rethrow so the boundary can show the fallback. A successful load clears the guard.
 */
export async function loadWithReload<T>(factory: () => Promise<T>, deps: ReloadDeps = realDeps): Promise<T> {
  try {
    const mod = await factory();
    deps.clearFlag();
    return mod;
  } catch (err) {
    if (isChunkLoadError(err) && !deps.getFlag()) {
      deps.setFlag();
      deps.reload();
      return new Promise<T>(() => { /* hang until the reload navigates away */ });
    }
    throw err;
  }
}

/** Drop-in replacement for React.lazy with the one-time-reload behaviour. */
export function lazyWithReload<T extends ComponentType<Record<string, unknown>>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(() => loadWithReload(factory));
}

/** Catches a repeat chunk failure (after the single reload) and offers a friendly refresh. */
export class ChunkErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 text-center">
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-2">A new version is available</p>
            <p className="text-gray-600 mb-4">Please refresh to load the latest BornClock.</p>
            <button
              onClick={() => { try { window.location.reload(); } catch { /* ignore */ } }}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
