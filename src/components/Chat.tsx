'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedMsgIds = useRef<Set<string>>(new Set());

  const messageForm = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: ''
    }
  });

  const nameForm = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: ''
    }
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Safe way to add messages without duplicates
  const addMessage = useCallback((newMessage: Message) => {
    if (!newMessage.id) {
      newMessage.id = uuidv4(); // Ensure message has ID
    }
    
    // Check if this message ID has already been processed
    if (processedMsgIds.current.has(newMessage.id)) {
      console.log('Duplicate message prevented:', newMessage.id);
      return false; // Message was a duplicate
    }
    
    // Mark this ID as processed
    processedMsgIds.current.add(newMessage.id);
    
    // Add to messages state
    setMessages(prev => {
      // Double check the message isn't already in state
      if (prev.some(m => m.id === newMessage.id)) {
        return prev;
      }
      return [...prev, newMessage];
    });
    
    return true; // Message was added
  }, []);

  useEffect(() => {
    console.log('Initializing Socket.IO connection...');
    
    const socketInstance = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected successfully');
      setIsConnected(true);
      setError('');
      
      if (altName) {
        socketInstance.emit('join', altName);
      }
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
      setIsConnected(false);
      setError('Failed to connect to chat server. Trying to reconnect...');
    });

    socketInstance.on('chatHistory', (history) => {
      console.log('Received chat history:', history);
      
      // Clear any existing messages and processed IDs
      setMessages([]);
      processedMsgIds.current.clear();
      
      // Add each history message, avoiding duplicates
      history.forEach((msg: Message) => {
        processedMsgIds.current.add(msg.id);
      });
      
      // Set all messages at once
      setMessages(history);
    });

    socketInstance.on('message', (msg) => {
      console.log('Received message:', msg);
      addMessage(msg);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
      setError('Disconnected from chat server. Attempting to reconnect...');
    });

    setSocket(socketInstance);

    return () => {
      console.log('Cleaning up Socket.IO connection...');
      socketInstance.disconnect();
    };
  }, [altName, addMessage]);

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
      // Generate a message with client ID
      const newMessage = {
        id: uuidv4(),
        message,
        altName,
        timestamp: new Date().toISOString(),
      };
      
      // Only send to server - don't add locally
      // The server will broadcast it back and we'll receive it via the 'message' event
      socket.emit('message', newMessage);
      
      // Clear the input field
      messageForm.reset();
    }
  });


  if (!altName) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <form onSubmit={onNameSubmit} className="flex flex-col gap-4">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-slate-800">Lumanest Chat</h1>
              <p className="mt-2 text-slate-500">Connect and chat in real-time</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Your Display Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                {...nameForm.register('name')}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                autoFocus
              />
              {nameForm.formState.errors.name && (
                <p className="text-rose-500 text-sm">{nameForm.formState.errors.name.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Error message */}
      {error && (
        <div className="mx-2 mt-2 bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-2 rounded-md flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {/* Chat messages */}
      <div className="flex-grow overflow-y-auto p-2 md:p-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-center font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 max-w-4xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id || `msg-${msg.timestamp}-${msg.altName}`}
                className={`p-2 rounded-lg max-w-[90%] shadow-sm ${
                  msg.altName === 'System' 
                    ? 'bg-slate-200 mx-auto text-center' 
                    : msg.altName === altName 
                      ? 'bg-blue-500 text-white ml-auto' 
                      : 'bg-white border border-slate-200 mr-auto'
                }`}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className={`text-sm font-semibold ${msg.altName === altName ? 'text-blue-50' : 'text-slate-700'}`}>
                    {msg.altName}
                  </span>
                  <span className={`text-xs ml-4 ${msg.altName === altName ? 'text-blue-100' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className={`break-words ${msg.altName === altName ? 'text-white' : 'text-slate-800'}`}>{msg.message}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="p-2 md:p-3 bg-white border-t border-slate-200">
        <form onSubmit={onMessageSubmit} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Type your message"
            {...messageForm.register('message')}
            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            autoFocus
          />
          <button
            type="submit"
            disabled={!isConnected}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-lg transition-all duration-200 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Send</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        
        {messageForm.formState.errors.message && (
          <p className="mt-1 text-rose-500 text-sm max-w-4xl mx-auto">
            {messageForm.formState.errors.message.message}
          </p>
        )}
      </div>
    </div>
  );
}