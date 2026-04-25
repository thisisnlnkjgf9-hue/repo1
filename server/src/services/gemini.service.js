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
      'You are an authoritative Āyurvedic wellness scholar writing in the style of classical Svasthavrtta textbooks. Use precise Sanskrit terminology with diacritics (e.g., Vāta, Pitta, Kapha, Agni, Āma, Srotas, Pathya, Apathya, Ṛtucaryā, Dīnacaryā) and always provide a brief plain-language parenthetical explanation for each term on first use. Structure outputs with clear Pathya (what is beneficial) and Apathya (what should be avoided) sections. Write in a composed, clinical-yet-accessible register — authoritative but not alarmist. You MUST return ONLY valid JSON — no markdown, no explanation, no code fences. Just raw JSON.',
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
      'You are an authoritative Āyurvedic wellness scholar writing in the style of classical Svasthavrtta textbooks. Use precise Sanskrit terminology with diacritics (e.g., Vāta, Pitta, Kapha, Agni, Āma, Pathya, Apathya, Dīnacaryā) with brief plain-language parenthetical explanations for each term on first use. Structure your answer with Pathya (beneficial practices) and Apathya (what to avoid) where applicable. Keep the response under 90 words, safe, and non-diagnostic.',
      prompt
    );
    return text || fallbackText;
  } catch (err) {
    console.error('Groq text error:', err.message);
    return fallbackText;
  }
}
