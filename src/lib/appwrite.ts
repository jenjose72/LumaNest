import { Client, Account, Databases } from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  throw new Error('Missing required environment variables for Appwrite configuration');
}

const client = new Client();
client.setEndpoint(endpoint);
client.setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);