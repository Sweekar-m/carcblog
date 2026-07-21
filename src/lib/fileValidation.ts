/**
 * fileValidation.ts — Server-side file validation for upload endpoints.
 *
 * Enforces:
 * - Explicit MIME type allowlist (no SVG — can carry XSS payloads)
 * - File extension allowlist cross-checked against MIME type
 * - Maximum file size
 * - Content-Length header pre-check (reject before buffering body)
 *
 * Do NOT import this from client-side code.
 */

/** Maximum upload size: 5 MB */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Explicitly allowed image MIME types.
 * SVG is excluded — it can carry embedded JavaScript (XSS).
 */
export const ALLOWED_MIME_TYPES: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
]);

/**
 * Allowed file extensions, keyed to their canonical MIME type.
 * Extension → expected MIME. Used to cross-validate file.type vs file.name.
 */
export const EXTENSION_MIME_MAP: Readonly<Record<string, string>> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
};

export interface ValidationResult {
  ok: boolean;
  status?: number;
  error?: string;
}

/**
 * Validate a Content-Length header before the request body is buffered.
 * Returns a ValidationResult with ok=false if the header signals an oversize payload.
 *
 * Note: Content-Length can be absent (chunked transfer). When absent, we allow
 * the request through and rely on file.size validation after buffering.
 */
export function validateContentLength(request: Request): ValidationResult {
  const contentLength = request.headers.get('content-length');
  if (contentLength !== null) {
    const length = parseInt(contentLength, 10);
    if (isNaN(length) || length < 0) {
      return { ok: false, status: 400, error: 'Invalid Content-Length header.' };
    }
    if (length > MAX_UPLOAD_BYTES) {
      return {
        ok: false,
        status: 413,
        error: `File exceeds the maximum allowed size of ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`,
      };
    }
  }
  return { ok: true };
}

/**
 * Validate a file object after the multipart body has been parsed.
 * Checks MIME type (allowlist), file extension (allowlist + cross-match), and size.
 */
export function validateFile(file: File): ValidationResult {
  // 1. Check MIME type against allowlist
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      status: 415,
      error: `Unsupported file type: "${file.type}". Allowed types: JPEG, PNG, GIF, WebP, AVIF.`,
    };
  }

  // 2. Extract and validate file extension
  const nameParts = file.name.split('.');
  const ext = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';

  if (!ext || !(ext in EXTENSION_MIME_MAP)) {
    return {
      ok: false,
      status: 415,
      error: `Unsupported or missing file extension ".${ext}".`,
    };
  }

  // 3. Cross-check extension against declared MIME type
  const expectedMime = EXTENSION_MIME_MAP[ext];
  // Normalise image/jpg -> image/jpeg for comparison
  const normalisedDeclared = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  if (normalisedDeclared !== expectedMime) {
    return {
      ok: false,
      status: 415,
      error: `File extension ".${ext}" does not match declared MIME type "${file.type}".`,
    };
  }

  // 4. Enforce maximum size (post-buffer check)
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      status: 413,
      error: `File size ${(file.size / (1024 * 1024)).toFixed(2)} MB exceeds the ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB limit.`,
    };
  }

  return { ok: true };
}
