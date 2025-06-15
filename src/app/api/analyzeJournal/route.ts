// app/api/analyzeJournal/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Client, Databases, ID } from "node-appwrite";

const openai = new OpenAI({
  baseURL: "https://api.novita.ai/v3/openai",
  apiKey: process.env.NEXT_PUBLIC_NOVITA_API_KEY!,
});

// Appwrite setup using NEXT_PUBLIC_ variables
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!) // e.g. 'https://cloud.appwrite.io/v1'
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!) // Your project ID
  .setKey(process.env.APPWRITE_API_KEY!); // Your API key

const databases = new Databases(client);

export async function POST(req: Request) {
  const body = await req.json();

  // If database IDs are available and it's a journal entry, save it
  if (
    body.text &&
    body.mood !== undefined &&
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID &&
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID
  ) {
    try {
      const createdAt = new Date().toISOString();
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
        ID.unique(),
        {
          text: body.text,
          createdAt,
          mood: body.mood,
        }
      );
    } catch (error) {
      console.error("Error saving journal entry to database:", error);
      // Continue without throwing - we still want to get AI response
    }
  }

  // Use messages for chat, or build messages from text if not provided
  const messages = body.messages || [
    {
      role: "system",
      content: `You're a friendly, supportive AI journal companion. 
Your job is to listen to the user's journal entry and respond with empathy and encouragement.
If the entry is sad, comfort them and suggest something gentle they can do to feel better.
If the entry is happy, celebrate it warmly.
Avoid sounding clinical or analytical.
Keep the response short, warm, and in second person, like a caring friend talking directly to them.
Use simple words, short paragraphs, and friendly tone. Emojis are welcome if they feel natural.
Detect emotion or sentiment.
Offer supportive messages, motivational quotes, or simple CBT prompts.
Suggest self-care tips like: "Try a short breathing exercise" if negative mood is detected.
`,
    },
    {
      role: "user",
      content: `Here's my journal entry: ${body.text}`,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "meta-llama/llama-3.2-1b-instruct",
    messages,
  });

  const reply =
    completion.choices[0]?.message.content || "I'm here for you. ❤️";
  return NextResponse.json({ reply });
}
