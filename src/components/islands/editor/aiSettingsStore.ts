/**
 * aiSettingsStore.ts — Shared Nano Store for AI provider settings.
 *
 * Solves the triplicate /api/ai-settings fetch problem: AIChatPanel,
 * AIWriterMenu, and AISettingsForm were each independently fetching the
 * same endpoint on mount, resulting in 3 identical requests per page load.
 *
 * This module provides a single shared atom plus a `loadAiSettings()` action
 * that is safe to call from multiple components simultaneously — the in-flight
 * promise is tracked so only ONE network request ever fires per page load,
 * regardless of how many components call `loadAiSettings()`.
 *
 * Per AGENTS.md §6: cross-island state goes through Nano Stores.
 */
import { atom } from 'nanostores';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AiSettingsState {
  /** Whether the fetch has been initiated (prevents duplicate requests) */
  fetched: boolean;
  /** Whether the fetch is in progress */
  loading: boolean;
  /** Whether the user has a valid AI API key stored */
  hasKey: boolean;
  /** The configured AI provider, or null if no key */
  provider: 'gemini' | 'openrouter' | null;
  /** Masked version of the key for display (e.g. AIza...kPQR) */
  maskedKey: string | null;
  /** Error message if the fetch failed */
  error: string | null;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const $aiSettings = atom<AiSettingsState>({
  fetched: false,
  loading: false,
  hasKey: false,
  provider: null,
  maskedKey: null,
  error: null,
});

// ─── In-flight promise guard ─────────────────────────────────────────────────
// Ensures that if multiple components call loadAiSettings() simultaneously
// (e.g. AIWriterMenu and AIChatPanel both mounting at the same time), only
// one fetch fires. Subsequent callers just await the same promise.

let _inflightPromise: Promise<void> | null = null;

/**
 * Fetch AI settings from /api/ai-settings and populate $aiSettings.
 * Safe to call from multiple components — only one HTTP request fires per
 * page lifecycle. Subsequent calls while a request is in-flight are no-ops.
 *
 * @param force - If true, bypasses the already-fetched guard and re-fetches.
 *                Use this after saving new settings in AISettingsForm.
 */
export async function loadAiSettings(force = false): Promise<void> {
  const current = $aiSettings.get();

  // Already fetched and not forcing a refresh — bail early
  if (current.fetched && !force) return;

  // In-flight request in progress — await the same promise to avoid a second request
  if (_inflightPromise && !force) {
    return _inflightPromise;
  }

  // Mark loading
  $aiSettings.set({ ...$aiSettings.get(), loading: true, fetched: true });

  _inflightPromise = (async () => {
    try {
      const res = await fetch('/api/ai-settings');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      $aiSettings.set({
        fetched: true,
        loading: false,
        hasKey: !!data.hasKey,
        provider: data.provider || null,
        maskedKey: data.maskedKey || null,
        error: null,
      });
    } catch (err: any) {
      $aiSettings.set({
        ...$aiSettings.get(),
        loading: false,
        fetched: true,
        error: err.message || 'Failed to load AI settings',
      });
    } finally {
      _inflightPromise = null;
    }
  })();

  return _inflightPromise;
}

/**
 * Optimistically update the AI settings store after a successful save.
 * Called by AISettingsForm after a successful POST /api/ai-settings, so
 * all components immediately reflect the new key/provider without re-fetching.
 */
export function updateAiSettings(patch: Partial<Pick<AiSettingsState, 'hasKey' | 'provider' | 'maskedKey'>>): void {
  $aiSettings.set({ ...$aiSettings.get(), ...patch });
}
