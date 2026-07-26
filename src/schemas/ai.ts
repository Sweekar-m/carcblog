/**
 * Zod validation schemas for AI-related API routes.
 *
 * POST /api/ai-settings — save/test AI provider config
 * POST /api/ai-writer  — generate/improve article content
 */
import { z } from 'zod';

// ─── AI Settings ────────────────────────────────────────────────────────────

export const AI_PROVIDERS = ['gemini', 'openrouter'] as const;
export type AIProvider = (typeof AI_PROVIDERS)[number];

/**
 * Schema for POST /api/ai-settings.
 * Validates provider selection, API key format, and the optional testOnly flag.
 */
export const aiSettingsSchema = z.object({
  provider: z.enum(AI_PROVIDERS, {
    errorMap: () => ({ message: 'Provider must be "gemini" or "openrouter"' }),
  }),
  /** Raw API key, or the sentinel "KEEP_EXISTING" to re-test the stored key. */
  apiKey: z
    .string()
    .min(1, 'API key is required')
    .max(500, 'API key is too long'),
  /** If true, only test the connection — do not save the key. */
  testOnly: z.boolean().optional().default(false),
});

export type AISettingsInput = z.infer<typeof aiSettingsSchema>;

// ─── AI Writer ──────────────────────────────────────────────────────────────

export const AI_WRITER_ACTIONS = ['chat', 'outline', 'continue', 'improve'] as const;
export type AIWriterAction = (typeof AI_WRITER_ACTIONS)[number];

const MAX_PROMPT_CHARS = 10_000;

/**
 * Schema for POST /api/ai-writer.
 * Validates the action type and enforces input length limits.
 */
export const aiWriterSchema = z.object({
  action: z.enum(AI_WRITER_ACTIONS, {
    errorMap: () => ({
      message: `Action must be one of: ${AI_WRITER_ACTIONS.join(', ')}`,
    }),
  }),
  /** The article context / existing content (sent for continue/improve actions). */
  context: z.string().max(MAX_PROMPT_CHARS, `Context must be under ${MAX_PROMPT_CHARS} characters`).optional().default(''),
  /** Selected text to act on (used by the improve action). */
  selection: z.string().max(MAX_PROMPT_CHARS, `Selection must be under ${MAX_PROMPT_CHARS} characters`).optional().default(''),
  /** The user's prompt / instruction to the AI. */
  prompt: z.string().max(MAX_PROMPT_CHARS, `Prompt must be under ${MAX_PROMPT_CHARS} characters`).optional().default(''),
});

export type AIWriterInput = z.infer<typeof aiWriterSchema>;
