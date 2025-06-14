'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';

// TypeScript interfaces
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function AiAssistant() {
  // Shared state
  const [activeMode, setActiveMode] = useState<'voice' | 'chat'>('voice');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Voice assistant state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  
  // Chat interface state
  const [inputMessage, setInputMessage] = useState<string>('');

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if browser supports SpeechRecognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setError('Your browser does not support speech recognition. Try the chat option instead.');
        setActiveMode('chat');
        return;
      }

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      // Set up event handlers
      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processUserInput(text);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);

        // Provide more specific error messages based on error type
        if (event.error === 'network') {
          setError(`Network error: Please check your internet connection.`);
        } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setError(`Microphone access denied: Please allow microphone access in your browser settings.`);
        } else if (event.error === 'no-speech') {
          setError(`No speech detected: Please speak more clearly or check your microphone.`);
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }

        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      // Initialize speech synthesis
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to check network connection
  const checkNetworkConnection = (): boolean => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  };

  // Function to toggle listening with network check
  const toggleListening = (): void => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Check network connection before starting
      if (!checkNetworkConnection()) {
        setError('Network error: Please check your internet connection.');
        return;
      }

      setError('');
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error: any) {
        console.error('Error starting speech recognition:', error);
        setError(`Error starting speech recognition: ${error.message}`);
      }
    }
  };

  // Function to validate API key format
  const validateApiKey = (key: string): boolean => {
    if (key.trim() === '') return false;
    return key.startsWith('AIza') && key.length > 20;
  };

  // Function to process user input (from voice or chat)
  const processUserInput = async (text: string): Promise<void> => {
    try {
      if (!text.trim()) return;
      
      setIsLoading(true);

      // Add user message to chat history
      const userMessage: Message = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);

      // API key for Gemini
      const API_KEY = 'AIzaSyARPOwdmt6WNWBB0f6rKZLz1mPUrPzIkso';
      if (!validateApiKey(API_KEY)) {
        throw new Error('Invalid API key. Please replace with a valid Gemini API key.');
      }

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      // Enhanced prompt for a motivational assistant
      const enhancedPrompt = `
        You are LumaNest's motivational coach assistant. Your purpose is to provide supportive, 
        encouraging guidance to users who need mental wellness support or motivation.
        
        Please follow these guidelines:
        1. Provide encouraging, positive responses that inspire action and personal growth
        2. Offer practical, actionable advice tailored to the user's situation
        3. Use a warm, supportive tone that builds trust and connection
        4. Never use asterisks (*) in your responses
        5. Keep responses concise and impactful
        6. Don't label your responses with prefixes like "Motivational Coach:"
        7. Speak directly to the user in a natural, conversational way
        
        The user has said: "${text}"
        
        Respond with motivational guidance:
      `;

      const response = await axios.post(
        API_URL,
        {
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract the response text from the API response
      const responseText = response.data.candidates[0].content.parts[0].text;
      
      // Add assistant message to chat history
      const assistantMessage: Message = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // If in voice mode, speak the response
      if (activeMode === 'voice' && synthRef.current) {
        speakResponse(responseText);
      }
    } catch (error: any) {
      console.error('Error processing text:', error);
      if (error.response?.data?.error) {
        setError(`API Error: ${error.response.data.error.message}`);
      } else {
        setError(`Error processing text: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
      setTranscript(''); // Clear transcript after processing in voice mode
    }
  };

  // Function to speak the response using speech synthesis
  const speakResponse = (text: string): void => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    synthRef.current.speak(utterance);
  };

  // Function to handle chat input submission
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    
    processUserInput(inputMessage);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex flex-col items-center flex-1 px-4 py-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="w-full max-w-4xl">
          <h1 className="mb-6 text-3xl font-bold text-center text-blue-600">AI Wellness Assistant</h1>
          
          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex overflow-hidden rounded-lg shadow-md">
              <button
                type="button"
                className={`px-6 py-3 text-sm font-medium transition-all ${
                  activeMode === 'voice'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setActiveMode('voice')}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Voice
                </div>
              </button>
              <button
                type="button"
                className={`px-6 py-3 text-sm font-medium transition-all ${
                  activeMode === 'chat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setActiveMode('chat')}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Chat
                </div>
              </button>
            </div>
          </div>
          
          {/* Chat Container */}
          <div className="mb-6 overflow-hidden bg-white border border-blue-100 shadow-lg rounded-xl">
            {/* Messages Area */}
            <div 
              ref={chatContainerRef}
              className="p-6 overflow-y-auto h-80 md:h-96"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="p-6 mb-4 rounded-full bg-blue-50">
                    <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-center">
                    Welcome to your AI wellness assistant!<br/>
                    {activeMode === 'voice' 
                      ? 'Click the microphone button and start speaking.' 
                      : 'Type a message below to begin.'}
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block px-4 py-3 rounded-2xl max-w-[80%] shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-blue-50 text-blue-900 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="px-4 py-3 shadow-sm bg-blue-50 rounded-2xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="px-6 py-3 border-t border-red-100 bg-red-50">
                <div className="flex items-center text-red-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="flex-1 text-sm">{error}</span>
                  <button 
                    onClick={() => setError('')}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Input Area */}
            <div className="p-4 bg-white border-t border-blue-100">
              {activeMode === 'voice' ? (
                <div className="flex flex-col items-center">
                  <button
                    onClick={toggleListening}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg focus:outline-none ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-200' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                    }`}
                    disabled={isLoading}
                  >
                    {isListening ? (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>
                  <p className="mt-2 text-sm text-gray-500">
                    {isListening ? 'Listening... Click to stop' : 'Click to speak'}
                  </p>
                  
                  {transcript && (
                    <div className="w-full mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                          Your message:
                        </label>
                        <button
                          onClick={() => processUserInput(transcript)}
                          className="px-3 py-1 text-sm text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          Send
                        </button>
                      </div>
                      <p className="p-2 text-gray-800 border border-blue-200 rounded-md bg-blue-50">
                        {transcript}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
                    disabled={isLoading || !inputMessage.trim()}
                  >
                    {isLoading ? (
                      <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
          
          <div className="text-sm text-center text-gray-500">
            <p>Your conversations are stored temporarily and will be lost when you refresh or close this page.</p>
          </div>
        </div>
      </main>
    </div>
  );
}