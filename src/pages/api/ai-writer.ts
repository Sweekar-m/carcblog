import type { APIRoute } from 'astro';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { decryptApiKey } from '@/lib/encryption';
import { aiWriterSchema } from '@/schemas/ai';

export const prerender = false;

const MAX_INPUT_CHARS = 10000;
const REQUEST_TIMEOUT_MS = 35000; // 35 second timeout guardrail

/**
 * System prompts tailored to CarcBlog's editorial design system & writing standards.
 */
const SYSTEM_PROMPTS = {
  chat: `You are CarcBlog AI Assistant, an elite editorial co-writer for CarcBlog (a publication focused on tech, startup founders, and modern innovation).
Your goal is to help authors transform any prompt, story idea, or text into a full, publishable blog article.

When given a prompt or request, respond with a valid JSON object matching this structure (DO NOT wrap in Markdown code blocks, output RAW JSON only):
{
  "replyText": "A warm, helpful 1-2 sentence message summarizing what you created.",
  "headline": "A sharp, catchy editorial headline (Title)",
  "subtitle": "A compelling 1-2 sentence subtitle/deck",
  "articleBody": "A complete, beautifully written blog post formatted in Markdown with section headers (##, ###), engaging paragraphs, and bullet points where helpful.",
  "imageSuggestion": "A 3-5 word descriptive visual search query for cover media, e.g. 'Minimalist tech startup office night'"
}`,

  outline: `You are an expert editorial editor for CarcBlog, a startup and tech publication. 
Generate a clear, well-structured article outline using Markdown headings (# for Main Title, ## for Main Sections, ### for Subsections). 
Keep section titles concise and punchy. Return ONLY the Markdown outline text without preamble or commentary.`,

  continue: `You are a professional co-writer for CarcBlog. Continue the article text seamlessly from where it left off. 
Maintain the existing writing style, tone, and formatting. Output ONLY the paragraph text to append directly.`,

  improve: `You are a senior editor at CarcBlog. Rewrite the provided text selection to improve clarity, flow, tone, and conciseness while preserving the original meaning. 
Return ONLY the rewritten text without explanations or quotes.`
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = await getCurrentUser(locals);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Please sign in to use the AI Writer.' }), { status: 401 });
  }

  try {
    const rawBody = await request.json().catch(() => ({}));

    const parsed = aiWriterSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed: ' + parsed.error.issues.map(i => i.message).join('; ') }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { action, context, selection, prompt } = parsed.data;

    // Guardrail: Total combined input length
    const combinedInputLength = (prompt + selection + context).length;
    if (combinedInputLength > MAX_INPUT_CHARS) {
      return new Response(
        JSON.stringify({
          error: `Input content exceeds the maximum limit of ${MAX_INPUT_CHARS} characters. Please shorten your request.`
        }),
        { status: 400 }
      );
    }

    // Fetch user's encrypted AI key and provider from Supabase profile
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('ai_provider, ai_api_key_encrypted')
      .eq('id', user.id)
      .single();

    if (dbError || !profile || !profile.ai_api_key_encrypted || !profile.ai_provider) {
      return new Response(
        JSON.stringify({
          error: 'NO_KEY_CONFIGURED',
          message: 'No AI API key configured. Please add your Gemini or OpenRouter key in Settings (Profile).'
        }),
        { status: 400 }
      );
    }

    let apiKey = '';
    try {
      apiKey = decryptApiKey(profile.ai_api_key_encrypted);
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: 'KEY_DECRYPTION_FAILED',
          message: 'Failed to decrypt your API key. Please re-enter your key in Profile Settings.'
        }),
        { status: 500 }
      );
    }

    // Build prompt based on action
    const systemPrompt = SYSTEM_PROMPTS[action as keyof typeof SYSTEM_PROMPTS];
    let userPrompt = userPromptText.trim() || 'Write a startup article about innovation and growth.';

    if (action === 'continue') {
      userPrompt = `Current Document Context:\n"""${context.trim()}"""\n\nContinue writing from here:`;
    } else if (action === 'improve') {
      userPrompt = `Target Selection to Improve:\n"""${selection.trim()}"""\n\nContext around selection:\n"""${context.trim()}"""`;
    }

    // Guardrail 2: Timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let generatedText = '';

    try {
      if (profile.ai_provider === 'gemini') {
        const modelName = 'gemini-3.6-flash';
        const fullPromptText = `${systemPrompt}\n\nUser Request: ${userPrompt}`;

        // 1. Try modern Interactions API first
        try {
          const intRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            signal: controller.signal,
            body: JSON.stringify({
              model: modelName,
              input: fullPromptText
            })
          });

          if (intRes.ok) {
            clearTimeout(timeoutId);
            const intData = await intRes.json();
            generatedText = intData.outputText || intData.result || intData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
        } catch (e) {
          // Fallback to generateContent
        }

        // 2. Fallback to generateContent REST endpoint
        if (!generatedText) {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const apiRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            signal: controller.signal,
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ parts: [{ text: userPrompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
              }
            })
          });

          clearTimeout(timeoutId);

          if (!apiRes.ok) {
            const errData = await apiRes.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${apiRes.status} ${apiRes.statusText}`;
            if (apiRes.status === 429) {
              return new Response(JSON.stringify({ error: 'RATE_LIMITED', message: 'Gemini API rate limit exceeded. Please wait a moment and try again.' }), { status: 429 });
            }
            return new Response(JSON.stringify({ error: 'PROVIDER_ERROR', message: `Gemini API error: ${errMsg}` }), { status: 400 });
          }

          const resData = await apiRes.json();
          generatedText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } else if (profile.ai_provider === 'openrouter') {
        const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://carcblog.com',
            'X-Title': 'CarcBlog AI Writer'
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-001',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 2048
          })
        });

        clearTimeout(timeoutId);

        if (!apiRes.ok) {
          const errData = await apiRes.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${apiRes.status} ${apiRes.statusText}`;
          if (apiRes.status === 429) {
            return new Response(JSON.stringify({ error: 'RATE_LIMITED', message: 'OpenRouter rate limit exceeded. Please wait a moment and try again.' }), { status: 429 });
          }
          return new Response(JSON.stringify({ error: 'PROVIDER_ERROR', message: `OpenRouter API error: ${errMsg}` }), { status: 400 });
        }

        const resData = await apiRes.json();
        generatedText = resData.choices?.[0]?.message?.content || '';
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'TIMEOUT', message: 'AI request timed out after 35 seconds. Please try again.' }), { status: 504 });
      }
      throw err;
    }

    if (!generatedText.trim()) {
      return new Response(JSON.stringify({ error: 'EMPTY_RESPONSE', message: 'AI model returned an empty response. Please try rephrasing.' }), { status: 500 });
    }

    // Try parsing structured JSON response if action is 'chat'
    let structuredResponse: any = null;
    if (action === 'chat') {
      try {
        let cleanJsonStr = generatedText.trim();
        // Remove markdown ```json ``` wraps if model added them
        if (cleanJsonStr.startsWith('```')) {
          cleanJsonStr = cleanJsonStr.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
        }
        structuredResponse = JSON.parse(cleanJsonStr);
      } catch (e) {
        // Fallback if model returned plain text instead of JSON
        structuredResponse = {
          replyText: 'Here is your story generated for CarcBlog:',
          headline: 'Article Story',
          subtitle: '',
          articleBody: generatedText.trim(),
          imageSuggestion: 'Startup team technology'
        };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        result: generatedText.trim(),
        structured: structuredResponse
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('AI Writer Proxy Error:', err);
    return new Response(
      JSON.stringify({ error: 'SERVER_ERROR', message: err.message || 'An unexpected error occurred processing your AI request.' }),
      { status: 500 }
    );
  }
};
