import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.novita.ai/v3/openai",
  apiKey: process.env.NEXT_PUBLIC_NOVITA_API_KEY!,
});

export async function POST(req: Request) {
  const { journals } = await req.json() as { journals: { createdAt: string; mood: string; text: string }[] };
  const prompt = `
Here are the user's journal mood entries for the past week:
${journals.map((j: { createdAt: string; mood: string; text: string }) => `Date: ${j.createdAt}, Mood: ${j.mood}, Text: ${j.text}`).join("\n")}

Summarize the user's weekly mood like talking to user(fpp). Highlight patterns, energetic days, and stress trends in 2-3 friendly sentences.
`;

  const completion = await openai.chat.completions.create({
    model: "meta-llama/llama-3.2-1b-instruct",
    messages: [
      { role: "system", content: "You are a helpful mood analysis assistant." },
      { role: "user", content: prompt },
    ],
  });

  const summary = completion.choices[0]?.message.content || "No summary available.";
  return NextResponse.json({ summary });
}