import { GROQ_API_KEY } from '../config/env.js';
import { tryParseJson } from '../utils/parsers.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

async function groqChat(systemPrompt, userPrompt) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

export async function runGeminiJson(prompt, fallback) {
  if (!GROQ_API_KEY) {
    return fallback;
  }

  try {
    const text = await groqChat(
      'You are a helpful Ayurvedic wellness assistant. You MUST return ONLY valid JSON — no markdown, no explanation, no code fences. Just raw JSON.',
      prompt
    );
    return tryParseJson(text, fallback);
  } catch (err) {
    console.error('Groq JSON error:', err.message);
    return fallback;
  }
}

export async function runGeminiText(prompt, fallbackText) {
  if (!GROQ_API_KEY) {
    return fallbackText;
  }

  try {
    const text = await groqChat(
      'You are a safe Ayurveda support assistant. Keep responses clear, helpful, and concise.',
      prompt
    );
    return text || fallbackText;
  } catch (err) {
    console.error('Groq text error:', err.message);
    return fallbackText;
  }
}
