import { Client, Account, Databases } from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('your-project-id'); // Replace with your project ID

export const account = new Account(client);
export const databases = new Databases(client);

export const appwriteConfig = {
    projectId: 'your-project-id',
    databaseId: 'your-database-id',
    usersCollectionId: 'users',
};