// app/api/analyzeJournal/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.novita.ai/v3/openai",
  apiKey: process.env.NEXT_PUBLIC_NOVITA_API_KEY!,
});

export async function POST(req: Request) {
  const { text } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "meta-llama/llama-3.2-1b-instruct",
    messages: [
      {
        role: "system",
        content: `You're a friendly, supportive AI journal companion. 
Your job is to listen to the user's journal entry and respond with empathy and encouragement.
If the entry is sad, comfort them and suggest something gentle they can do to feel better.
If the entry is happy, celebrate it warmly.
Avoid sounding clinical or analytical.
Keep the response short, warm, and in second person, like a caring friend talking directly to them.
Use simple words, short paragraphs, and friendly tone. Emojis are welcome if they feel natural.`
      },
      {
        role: "user",
        content: `Here's my journal entry: ${text}`
      }
    ]
  });

  const reply = completion.choices[0]?.message.content || "I'm here for you. ❤️";
  return NextResponse.json({ reply });
}
