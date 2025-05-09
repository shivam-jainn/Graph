"use client";
import React, { useEffect, useRef, useState } from 'react';
import ChatInput from './ChatInput';
import { useChat } from '@ai-sdk/react';
import { MessageBubble } from './MessageBubble';
import { useParams, useRouter } from 'next/navigation';

export default function ChatUI() {
  const params = useParams();
  const router = useRouter();
  const chatId = params?.id ? params.id[0] : null; // Extract chat ID from URL params
  const [sessionCreated, setSessionCreated] = useState(false);
  const [existingMessages, setExistingMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Initialize chat with ID if available
  const { messages, input, handleInputChange, handleSubmit, isLoading: isChatLoading } = useChat({
    id: chatId,
    onResponse: async (response) => {
      // Store the assistant's response in the database
      if (chatId) {
        await storeMessage({
          content: response.content,
          role: 'assistant',
          sessionId: chatId
        });
      }
    },
    onFinish: () => {
      // Refresh messages after completion
      if (chatId) {
        fetchExistingMessages();
      }
    }
  });
  
  // Add event listener for beforeunload to save pending messages
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      // If there's a pending message and we have a valid chatId, save it
      if (input && input.trim() !== '' && chatId) {
        // Store the current input as a message
        await storeMessage({
          content: input,
          role: 'user',
          sessionId: chatId
        });
      } else if (input && input.trim() !== '' && !chatId && !sessionCreated) {
        // For new chats, create a session and save the message
        const title = input.split(' ').slice(0, 5).join(' ');
        if (title) {
          const newChatId = await createNewChatSession(title);
          if (newChatId) {
            await storeMessage({
              content: input,
              role: 'user',
              sessionId: newChatId
            });
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [input, chatId, sessionCreated]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch existing messages when chat ID changes
  useEffect(() => {
    if (chatId) {
      fetchExistingMessages();
    }
  }, [chatId]);

  // Function to fetch existing messages for a chat session
  const fetchExistingMessages = async () => {
    if (!chatId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chatsessions/${chatId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setExistingMessages(data.messages || []);
      } else {
        console.error("Failed to fetch messages:", await response.json());
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to store a message in the database
  const storeMessage = async (messageData) => {
    // Don't attempt to store if we don't have a valid sessionId
    if (!messageData.sessionId) return;
    
    try {
      const response = await fetch(`/api/chatsessions/${messageData.sessionId}/messages`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
        credentials: "include",
      });
      
      if (!response.ok) {
        console.error("Failed to store message:", await response.json());
      }
    } catch (error) {
      console.error("Error storing message:", error);
    }
  };

  // Function to upload files
  const uploadFiles = async (files: File[], sessionId: string) => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        throw error;
      }
    });
    
    return Promise.all(uploadPromises);
  };

  // Custom submit handler to create session if needed and store user message
  const handleMessageSubmit = async (e, files: File[] = []) => {
    e.preventDefault();
    
    // Don't proceed if there's no input and no files
    if (input.trim() === '' && files.length === 0) return;
    
    // If this is a new chat (no chatId) and first message, create session first
    if (!chatId && messages.length === 0 && !sessionCreated) {
      // Extract title from input
      const title = input.split(' ').slice(0, 5).join(' ');
      
      if (title) {
        setSessionCreated(true); // Prevent multiple creations
        
        // Create the session first
        const newChatId = await createNewChatSession(title);
        
        if (newChatId) {
          // Upload files if any
          if (files.length > 0) {
            setIsUploading(true);
            try {
              await uploadFiles(files, newChatId);
            } catch (error) {
              console.error("Error uploading files:", error);
              alert("Failed to upload one or more files");
            } finally {
              setIsUploading(false);
            }
          }
          
          // Store the user message in the database
          await storeMessage({
            content: input,
            role: 'user',
            sessionId: newChatId
          });
          
          // Let the original submit handler process the message
          handleSubmit(e);
        }
      }
    } else if (chatId) {
      // Upload files if any
      if (files.length > 0) {
        setIsUploading(true);
        try {
          await uploadFiles(files, chatId);
        } catch (error) {
          console.error("Error uploading files:", error);
          alert("Failed to upload one or more files");
        } finally {
          setIsUploading(false);
        }
      }
      
      // Only store the message if we have a valid chatId
      await storeMessage({
        content: input,
        role: 'user',
        sessionId: chatId
      });
      
      // Submit the message normally
      handleSubmit(e);
    } else {
      // Just submit the message normally for new chats without storing yet
      handleSubmit(e);
    }
  };

  // Function to create a new chat session
  const createNewChatSession = async (title: string) => {
    try {
      const response = await fetch(`/api/chatsessions`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
        credentials: "include",
      });
      
      if (!response.ok) {
        console.error("Failed to create chat session:", await response.json());
        return null;
      }
      
      const data = await response.json();
      console.log("Created chat session:", data);
      
      // Only navigate if we're not on the root path
      if (window.location.pathname !== '/') {
        router.push(`/chat/${data.id}`);
      }
      
      return data.id;
    } catch (error) {
      console.error("Error creating chat session:", error);
      return null;
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, existingMessages]);
  
  // Combine existing messages from database with current chat messages
  const allMessages = chatId ? existingMessages : messages;
  
  return (
    <div className="h-screen flex flex-col">
      {/* Scrollable messages container */}
      <div
        ref={scrollRef}
        className="h-[80%] overflow-y-auto px-4 py-2 space-y-4"
      >
        {isLoading ? (
          <div className="text-center py-4">Loading messages...</div>
        ) : (
          allMessages.map((message, index) => (
            <MessageBubble 
              role={message.role} 
              key={index} 
              message={message.content} 
            />
          ))
        )}
        {(isChatLoading || isUploading) && (
          <div className="text-center py-2">
            <span className="animate-pulse">
              {isUploading ? "Uploading files..." : "AI is thinking..."}
            </span>
          </div>
        )}
      </div>
      
      {/* Centered ChatInput */}
      <ChatInput
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleMessageSubmit} // Use our custom submit handler
      />
    </div>
  );
}