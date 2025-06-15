import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

// Initialize the Appwrite client with server-side API key for database operations
const server = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(server);

export async function GET(request) {
  try {
    // Get userId from the request query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Query documents with a filter for userId
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOURNAL_ID!,
      [
        Query.equal("userId", userId) // Filter by userId field
      ]
    );

    return NextResponse.json({
      journals: response.documents
    });
  } catch (error) {
    console.error("Error fetching journals:", error);
    return NextResponse.json({ journals: [], error: String(error) }, { status: 500 });
  }
}