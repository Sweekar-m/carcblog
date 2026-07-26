import type { APIRoute } from 'astro';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { encryptApiKey, decryptApiKey, maskApiKey } from '@/lib/encryption';
import { aiSettingsSchema } from '@/schemas/ai';

export const prerender = false;

/**
 * Minimal test connection to verify provider API key before saving.
 * Uses gemini-3.6-flash via Interactions API & generateContent API.
 */
async function testProviderConnection(provider: 'gemini' | 'openrouter', apiKey: string): Promise<{ ok: boolean; message?: string }> {
  try {
    if (provider === 'gemini') {
      const modelName = 'gemini-3.6-flash';

      // 1. Try modern Interactions API first
      try {
        const intRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            model: modelName,
            input: 'Hello'
          })
        });

        if (intRes.ok) {
          return { ok: true };
        }
      } catch (e) {
        // Fallback to generateContent
      }

      // 2. Fallback to generateContent REST endpoint
      const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const genRes = await fetch(generateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });

      if (genRes.ok) {
        return { ok: true };
      }

      const errData = await genRes.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${genRes.status} ${genRes.statusText}`;
      return { ok: false, message: `Gemini API test failed: ${errMsg}` };
    } else if (provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://carcblog.com',
          'X-Title': 'CarcBlog AI Writer'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${res.status} ${res.statusText}`;
        return { ok: false, message: `OpenRouter API test failed: ${errMsg}` };
      }
      return { ok: true };
    }

    return { ok: false, message: 'Invalid provider specified.' };
  } catch (err: any) {
    return { ok: false, message: `Network/API error: ${err?.message || 'Connection failed'}` };
  }
}

/**
 * GET /api/ai-settings
 * Returns AI configuration status (hasKey, provider, maskedKey). Never returns raw plaintext keys.
 */
export const GET: APIRoute = async ({ locals }) => {
  const user = await getCurrentUser(locals);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('ai_provider, ai_api_key_encrypted')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const hasKey = !!(profile?.ai_api_key_encrypted && profile?.ai_provider);
    let maskedKey: string | null = null;

    if (hasKey && profile.ai_api_key_encrypted) {
      try {
        const decrypted = decryptApiKey(profile.ai_api_key_encrypted);
        maskedKey = maskApiKey(decrypted);
      } catch (err) {
        console.error('Failed to decrypt stored AI key:', err);
      }
    }

    return new Response(
      JSON.stringify({
        hasKey,
        provider: profile?.ai_provider || null,
        maskedKey
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), { status: 500 });
  }
};

/**
 * POST /api/ai-settings
 * Tests API key against provider, encrypts key, and saves settings to Supabase profile.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = await getCurrentUser(locals);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const rawBody = await request.json().catch(() => ({}));

    const parsed = aiSettingsSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed: ' + parsed.error.issues.map(i => i.message).join('; ') }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { provider, apiKey, testOnly } = parsed.data;

    let cleanKey = apiKey.trim();

    if (cleanKey === 'KEEP_EXISTING') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('ai_api_key_encrypted')
        .eq('id', user.id)
        .single();

      if (!profile?.ai_api_key_encrypted) {
        return new Response(JSON.stringify({ error: 'No existing key found to test. Please enter a new API key.' }), { status: 400 });
      }

      try {
        cleanKey = decryptApiKey(profile.ai_api_key_encrypted);
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Stored key decryption failed. Please enter a new API key.' }), { status: 400 });
      }
    }

    // 1. Test Connection
    const testResult = await testProviderConnection(provider, cleanKey);
    if (!testResult.ok) {
      return new Response(JSON.stringify({ error: testResult.message }), { status: 400 });
    }

    // If request was only for testing connection without saving
    if (testOnly) {
      return new Response(JSON.stringify({ success: true, message: 'API key connection verified successfully!' }), { status: 200 });
    }

    // 2. Encrypt Key securely (will throw if ENCRYPTION_SECRET is missing)
    const encryptedKey = encryptApiKey(cleanKey);

    // 3. Save to Supabase profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        ai_provider: provider,
        ai_api_key_encrypted: encryptedKey,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        provider,
        maskedKey: maskApiKey(cleanKey),
        message: 'AI settings saved securely!'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Error saving AI settings:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to save AI configuration.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * DELETE /api/ai-settings
 * Clears stored AI provider and key from Supabase profile.
 */
export const DELETE: APIRoute = async ({ locals }) => {
  const user = await getCurrentUser(locals);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ai_provider: null,
        ai_api_key_encrypted: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: 'AI configuration removed.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to delete AI settings.' }), { status: 500 });
  }
};
