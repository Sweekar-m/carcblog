import type { APIRoute } from 'astro';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { decryptApiKey } from '@/lib/encryption';
import { aiWriterSchema } from '@/schemas/ai';

export const prerender = false;

const MAX_INPUT_CHARS = 10000;
const REQUEST_TIMEOUT_MS = 30000; // 30s guardrail (reduced from 35s — if it hits this, it's a provider issue)

/**
 * System prompts tailored to CarcBlog's editorial design system & writing standards.
 */
const SYSTEM_PROMPTS = {
  chat: `You are CarcBlog AI Assistant, an elite editorial co-writer for CarcBlog (a publication focused on tech, startup founders, and modern innovation).
Your goal is to help authors transform their prompts, story ideas, or notes into publishable blog articles.

CRITICAL INSTRUCTIONS FOR CONVERSATIONAL FLOW:
1. EVALUATE CONTEXT & USER INTENT:
   - Carefully analyze the user's latest prompt AND the full conversation history so far.
   - Determine if the user has provided enough concrete, specific information (e.g. specific article topic, story angle, target audience, startup details, or key takeaways) to write a real, customized article.

2. CASE A — VAGUE / GREETING / LACKS TOPIC CONTEXT (e.g. "hi", "I need your help", "can you help me write something", "I want to write an article"):
   - Do NOT generate a structured article card (no headline, no subtitle, no article body, no image suggestion).
   - Respond conversationally in "replyText" by asking 1 to 3 targeted clarifying questions (e.g. What is the article about? Who is the target audience? Do you have a specific angle, story, or startup in mind? Any key points to include?).
   - Set "headline", "subtitle", "articleBody", and "imageSuggestion" to empty strings ("").

3. CASE B — SPECIFIC TOPIC / ADEQUATE CONTEXT (e.g. "write a story about a founder who pivoted to voice AI", or after the user has answered your clarifying questions in the conversation):
   - Generate the full, publishable blog post package using all information provided across the conversation history.
   - Provide a sharp headline, compelling subtitle, complete Markdown articleBody (with headings ##, ###, bullet points, engaging paragraphs), and a 3-5 word image search query.

Output format requirement:
Respond with a valid JSON object matching this structure (DO NOT wrap in Markdown code blocks, output RAW JSON only):
{
  "replyText": "Your conversational response to the user.",
  "headline": "Proposed Headline (or empty string if asking clarifying questions)",
  "subtitle": "Proposed Subtitle (or empty string if asking clarifying questions)",
  "articleBody": "Full article markdown body (or empty string if asking clarifying questions)",
  "imageSuggestion": "3-5 word cover image search query (or empty string if asking clarifying questions)"
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
  const t0 = performance.now();
  console.log('[ai-writer] Request received');

  const user = await getCurrentUser(locals);
  const tAuth = performance.now();
  console.log(`[ai-writer] Auth check: ${(tAuth - t0).toFixed(1)}ms — user=${user?.id ?? 'null'}`);

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

    const { action, context, selection, prompt, messages = [] } = parsed.data;

    // Guardrail: Total combined input length
    const historyChars = messages.reduce((acc, m) => acc + m.content.length, 0);
    const combinedInputLength = (prompt + selection + context).length + historyChars;
    if (combinedInputLength > MAX_INPUT_CHARS) {
      return new Response(
        JSON.stringify({
          error: `Input content exceeds the maximum limit of ${MAX_INPUT_CHARS} characters. Please shorten your request.`
        }),
        { status: 400 }
      );
    }

    // Fetch user's encrypted AI key and provider from Supabase profile
    const tDbStart = performance.now();
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('ai_provider, ai_api_key_encrypted')
      .eq('id', user.id)
      .single();
    const tDbEnd = performance.now();
    console.log(`[ai-writer] Supabase profile fetch: ${(tDbEnd - tDbStart).toFixed(1)}ms — provider=${profile?.ai_provider ?? 'null'}, hasKey=${!!profile?.ai_api_key_encrypted}`);

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
      const tDecryptStart = performance.now();
      apiKey = decryptApiKey(profile.ai_api_key_encrypted);
      console.log(`[ai-writer] Key decryption: ${(performance.now() - tDecryptStart).toFixed(1)}ms`);
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
    let userPrompt = (prompt || '').trim() || 'Write a startup article about innovation and growth.';

    if (action === 'continue') {
      userPrompt = `Current Document Context:\n"""${context.trim()}"""\n\nContinue writing from here:`;
    } else if (action === 'improve') {
      userPrompt = `Target Selection to Improve:\n"""${selection.trim()}"""\n\nContext around selection:\n"""${context.trim()}"""`;
    }

    // Guardrail 2: Timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let generatedText = '';
    const tProviderStart = performance.now();
    console.log(`[ai-writer] Starting AI provider call — provider=${profile.ai_provider}, action=${action}`);

    try {
      if (profile.ai_provider === 'gemini') {
        const modelName = 'gemini-3.6-flash';
        console.log(`[ai-writer] Using Gemini model: ${modelName}`);
        let fullPromptText = `${systemPrompt}\n\n`;
        if (action === 'chat' && messages.length > 0) {
          fullPromptText += `Conversation History:\n`;
          for (const m of messages) {
            fullPromptText += `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}\n`;
          }
          fullPromptText += `\n`;
        }
        fullPromptText += `User Request: ${userPrompt}`;

        // 1. Try modern Interactions API first
        try {
          const tIntStart = performance.now();
          console.log('[ai-writer] Attempting Gemini Interactions API...');
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

          console.log(`[ai-writer] Interactions API response: HTTP ${intRes.status} in ${(performance.now() - tIntStart).toFixed(1)}ms`);
          if (intRes.ok) {
            clearTimeout(timeoutId);
            const intData = await intRes.json();
            generatedText = intData.outputText || intData.result || intData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          } else {
            const errBody = await intRes.text().catch(() => '');
            console.warn(`[ai-writer] Interactions API failed (${intRes.status}), falling back to generateContent. Body: ${errBody.slice(0, 200)}`);
          }
        } catch (e: any) {
          // AbortError means timeout — re-throw so the outer catch handles it
          if (e?.name === 'AbortError') throw e;
          console.warn(`[ai-writer] Interactions API threw: ${e?.message} — falling back to generateContent`);
        }

        // 2. Fallback to generateContent REST endpoint
        if (!generatedText) {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

          const geminiContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
          if (action === 'chat' && messages.length > 0) {
            for (const msg of messages) {
              geminiContents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
              });
            }
          }
          const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
          if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content.trim() !== userPrompt.trim()) {
            geminiContents.push({
              role: 'user',
              parts: [{ text: userPrompt }]
            });
          }

          const apiRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            signal: controller.signal,
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: geminiContents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
              }
            })
          });
          console.log(`[ai-writer] generateContent response: HTTP ${apiRes.status} in ${(performance.now() - tProviderStart).toFixed(1)}ms`);

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
        const openRouterMessages: Array<{ role: string; content: string }> = [
          { role: 'system', content: systemPrompt }
        ];

        if (action === 'chat' && messages.length > 0) {
          for (const msg of messages) {
            openRouterMessages.push({
              role: msg.role === 'assistant' ? 'assistant' : 'user',
              content: msg.content
            });
          }
        }
        const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
        if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content.trim() !== userPrompt.trim()) {
          openRouterMessages.push({
            role: 'user',
            content: userPrompt
          });
        }

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
            messages: openRouterMessages,
            temperature: 0.7,
            max_tokens: 2048
          })
        });
        console.log(`[ai-writer] OpenRouter response: HTTP ${apiRes.status} in ${(performance.now() - tProviderStart).toFixed(1)}ms`);

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
      console.error(`[ai-writer] Provider call failed after ${(performance.now() - tProviderStart).toFixed(1)}ms:`, err?.name, err?.message);
      if (err.name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'TIMEOUT', message: 'AI request timed out after 30 seconds. Please try again.' }), { status: 504 });
      }
      throw err;
    }

    console.log(`[ai-writer] Total provider time: ${(performance.now() - tProviderStart).toFixed(1)}ms | Total request time: ${(performance.now() - t0).toFixed(1)}ms`);

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
          replyText: generatedText.trim(),
          headline: '',
          subtitle: '',
          articleBody: '',
          imageSuggestion: ''
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
