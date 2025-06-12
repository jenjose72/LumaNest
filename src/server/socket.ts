import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { databases } from '../lib/appwrite';
import { ID } from 'appwrite';

export function initSocketServer(server: NetServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', async (socket) => {
    console.log('A user connected', socket.id);

    try {
      // Fetch chat history on connection
      console.log('Fetching chat history...');
      const messages = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CHAT_ID!,
      );
      console.log('Chat history fetched:', messages.documents);
      socket.emit('chatHistory', messages.documents);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      socket.emit('error', { message: 'Failed to load chat history' });
    }

    socket.on('join', (altName) => {
      console.log('User joined:', altName);
      socket.data.altName = altName;
      
      const welcomeMessage = {
        id: ID.unique(),
        altName: 'System',
        message: `Welcome to the chat, ${altName}!`,
        timestamp: new Date().toISOString(),
      };
      
      const joinMessage = {
        id: ID.unique(),
        altName: 'System',
        message: `${altName} joined the chat`,
        timestamp: new Date().toISOString(),
      };

      socket.emit('message', welcomeMessage);
      socket.broadcast.emit('message', joinMessage);
    });

    socket.on('message', async (data) => {
      const { message, altName, timestamp } = data;
      console.log('Message received:', { message, altName });
      
      try {
        // Store message in Appwrite
        console.log('Saving message to Appwrite...');
        const savedMessage = await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CHAT_ID!,
          ID.unique(),
          {
            message,
            altName,
            timestamp,
          }
        );
        console.log('Message saved:', savedMessage);

        // Broadcast message to all connected clients
        io.emit('message', savedMessage);
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      const altName = socket.data.altName;
      if (altName) {
        const leaveMessage = {
          id: ID.unique(),
          altName: 'System',
          message: `${altName} left the chat`,
          timestamp: new Date().toISOString(),
        };
        io.emit('message', leaveMessage);
      }
      console.log('A user disconnected:', socket.id);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
}