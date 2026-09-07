import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are NexusIDE AI — a world-class senior software architect and AI pair programmer.
You are embedded directly inside a developer workspace.

Guidelines:
1. Provide concise, clean, production-grade code.
2. If fixing an error, explain the root cause in 1-2 sentences, then show the fixed code block.
3. Always specify the language tag in markdown code blocks: e.g. \`\`\`typescript, \`\`\`python.
4. Skip verbose generic introductions. Get straight to the answer.`;

export async function POST(request: NextRequest) {
  let body: { prompt: string; code?: string; useLocal?: boolean; model?: string };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { prompt, code, useLocal = false, model } = body;

  if (!prompt?.trim()) {
    return new Response(JSON.stringify({ error: "prompt is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userMessage = code?.trim()
    ? `${prompt.trim()}\n\n---\n**Current Active File Context:**\n\`\`\`\n${code.trim()}\n\`\`\``
    : prompt.trim();

  const encoder = new TextEncoder();

  // ── Local AI Branch (Llama 3.2 / DeepSeek via Docker Model Runner / Ollama) ─
  if (useLocal) {
    const localModel = model || process.env.LOCAL_AI_MODEL || "ai/llama3.2";
    const localBaseUrl = process.env.LOCAL_AI_URL || "http://localhost:12434/engines/v1";

    const openai = new OpenAI({
      baseURL: localBaseUrl,
      apiKey: "local-dev",
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = await openai.chat.completions.create({
            model: localModel,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userMessage },
            ],
            stream: true,
            temperature: 0.2,
            max_tokens: 2048,
          });

          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content;
            if (token) controller.enqueue(encoder.encode(token));
          }
        } catch (error) {
          const errMsg = `\n\n⚠️ Local Model Error: ${(error as Error).message}\nEnsure Docker Model Runner or Ollama is running at ${localBaseUrl}.`;
          controller.enqueue(encoder.encode(errMsg));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "X-AI-Mode": "local",
        "X-AI-Model": localModel,
      },
    });
  }

  // ── Cloud Gemini Branch (Gemini 2.0 Flash / Pro) ─────────────────────────
  const selectedModel = model || process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const apiKey = process.env.GEMINI_API_KEY || "";

  if (!apiKey || apiKey === "your_google_api_key_here" || apiKey === "your_gemini_api_key_here") {
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            "⚠️ **Gemini API Key Required**\n\nPlease add a valid free Gemini API key to your `.env` or `.env.local` file:\n```env\nGEMINI_API_KEY=AIzaSy...\n```\nGet your free key at [Google AI Studio](https://aistudio.google.com/app/apikey). Alternatively, switch to **Local Llama 3.2** in the header toggle!"
          )
        );
        controller.close();
      },
    });
    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const genAI = new GoogleGenAI({ apiKey });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await genAI.models.generateContentStream({
          model: selectedModel,
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.2, // Fast, deterministic code generation
            maxOutputTokens: 2048,
          },
        });

        for await (const chunk of stream) {
          const token = chunk.text;
          if (token) controller.enqueue(encoder.encode(token));
        }
      } catch (error) {
        const errMsg = `\n\n⚠️ Gemini API Error: ${(error as Error).message}\nModel: ${selectedModel}. Please check your GEMINI_API_KEY.`;
        controller.enqueue(encoder.encode(errMsg));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "X-AI-Mode": "cloud",
      "X-AI-Model": selectedModel,
    },
  });
}
