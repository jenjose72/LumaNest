'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const messageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

const nameSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type Message = {
  id: string;
  message: string;
  altName: string;
  timestamp: string;
};

export default function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [altName, setAltName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  const messageForm = useForm({
    resolver: zodResolver(messageSchema),
  });

  const nameForm = useForm({
    resolver: zodResolver(nameSchema),
  });

  useEffect(() => {
    console.log('Initializing Socket.IO connection...');
    const socketInstance = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected successfully');
      setIsConnected(true);
      setError('');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
      setIsConnected(false);
      setError('Failed to connect to chat server');
    });

    socketInstance.on('error', (err) => {
      console.error('Socket.IO error:', err);
      setError(err.message || 'An error occurred');
    });

    socketInstance.on('chatHistory', (history) => {
      console.log('Received chat history:', history);
      setMessages(history);
    });

    socketInstance.on('message', (message) => {
      console.log('Received message:', message);
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      console.log('Cleaning up Socket.IO connection...');
      socketInstance.disconnect();
    };
  }, []);

  const onNameSubmit = nameForm.handleSubmit(({ name }) => {
    console.log('Joining chat with name:', name);
    if (socket) {
      setAltName(name);
      socket.emit('join', name);
    }
  });

  const onMessageSubmit = messageForm.handleSubmit(({ message }) => {
    console.log('Sending message:', message);
    if (socket && altName) {
      const messageData = {
        message,
        altName,
        timestamp: new Date().toISOString(),
      };
      socket.emit('message', messageData);
      messageForm.reset();
    }
  });

  if (!altName) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <form onSubmit={onNameSubmit} className="flex flex-col gap-4 w-full max-w-md">
          <input
            type="text"
            placeholder="Enter your name"
            {...nameForm.register('name')}
            className="p-2 border rounded"
          />
          {nameForm.formState.errors.name && (
            <p className="text-red-500">{nameForm.formState.errors.name.message}</p>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Join Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-4xl flex flex-col gap-4">
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex items-center gap-2">
          <span className="text-sm text-black">
            Status: {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <span className="text-sm text-black">Name: {altName}</span>
        </div>
        <div className="h-[500px] border rounded p-4 overflow-y-auto flex flex-col gap-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded ${msg.altName === 'System' ? 'bg-gray-100' : msg.altName === altName ? 'bg-blue-100' : 'bg-green-100'} text-black`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{msg.altName}</span>
                <span className="text-xs text-gray-800">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className='text-black'>{msg.message}</p>
            </div>
          ))}
        </div>
        <form onSubmit={onMessageSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message"
            {...messageForm.register('message')}
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </form>
        {messageForm.formState.errors.message && (
          <p className="text-red-500">{messageForm.formState.errors.message.message}</p>
        )}
      </div>
    </div>
  );
}