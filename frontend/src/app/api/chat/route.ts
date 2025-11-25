// src/app/api/chat/route.ts
import { google } from "@ai-sdk/google";
import { streamText, type UIMessage, convertToModelMessages } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-1.5-flash"),
    messages: convertToModelMessages(messages),
    system:
      "Sen Ülgen Paslanmaz'ın Türkçe konuşan müşteri destek asistanısın. " +
      "Kibar, kısa ve net cevaplar ver. Gereksiz uzun konuşma.",
  });

  return result.toTextStreamResponse();
}
