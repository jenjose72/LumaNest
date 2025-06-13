// lib/novitaClient.ts
import OpenAI from "openai";

export const openai = new OpenAI({
  baseURL: "https://api.novita.ai/v3/openai",
  apiKey: process.env.NEXT_PUBLIC_NOVITA_API_KEY || "", // Use .env
});
