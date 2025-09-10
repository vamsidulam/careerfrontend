import React, { useEffect, useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  profileData?: any; // Added for inline profile data
  resumeData?: any; // Added for inline resume data
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messages: Message[];
}

const Chat = () => {
  const STORAGE_KEY = 'chat_conversations_v1';
  const { toast } = useToast();
  // Generate a unique user identifier for this session
  const [userEmail] = useState(() => {
    // Try to get from localStorage first, otherwise generate a new one
    const stored = localStorage.getItem('user_email');
    if (stored) return stored;
    const newEmail = `user_${Date.now()}@example.com`;
    localStorage.setItem('user_email', newEmail);
    return newEmail;
  });
  const seed: Conversation = {
    id: `seed-${Date.now()}`,
    title: 'New Conversation',
    lastMessage: '',
    timestamp: 'Just now',
    messages: [],
  };
  const [conversations, setConversations] = useState<Conversation[]>([seed]);
  const [activeConversationId, setActiveConversationId] = useState<string>(seed.id);
  const [isTyping, setIsTyping] = useState(false);

  // Profile input states
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [codechefUrl, setCodechefUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileInput, setShowProfileInput] = useState(false);
  
  // Profile extraction results
  const [profileData, setProfileData] = useState<any>(null);
  
  // Resume upload states
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  
  // Suggested messages states
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Initialize with a single conversation
  useEffect(() => {
    // Always start with one conversation
    const first: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      lastMessage: '',
      timestamp: 'Just now',
      messages: [],
    };
    setConversations([first]);
    setActiveConversationId(first.id);
  }, [userEmail]); // Re-run when user email changes

  // Prevent page scrolling when on chat page
  useEffect(() => {
    document.body.classList.add('chat-page');
    
    return () => {
      document.body.classList.remove('chat-page');
    };
  }, []);

  // Note: Conversations are now managed by the backend, no localStorage persistence needed

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];
  
  // Debug logging
  console.log('Current user email:', userEmail);
  console.log('Active conversation:', activeConversation);
  console.log('Messages being passed to ChatInterface:', messages);
  console.log('Total conversations:', conversations.length);

  // Function to create a new conversation
  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      lastMessage: '',
      timestamp: 'Just now',
      messages: [],
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    
    // Reset profile data for new conversation
    setProfileData(null);
    setShowResumeUpload(false);
    setResumeFile(null);
    
    // Show profile input modal for new conversation
    setShowProfileInput(true);
  };

  // Function to clear all chats for current user
  const clearAllChats = async () => {
    if (!userEmail || userEmail === 'anonymous@example.com') return;
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/chats/${userEmail}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Create a new conversation after clearing
        const first: Conversation = {
          id: Date.now().toString(),
          title: 'New Conversation',
          lastMessage: '',
          timestamp: 'Just now',
          messages: [],
        };
        setConversations([first]);
        setActiveConversationId(first.id);
        
        toast({
          title: "Success",
          description: "All chat history cleared successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to clear chat history",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (messageText: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    // Update the conversation with the new message
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id !== activeConversationId) return conv;
        const isFirstMessage = (conv.messages?.length || 0) === 0;
        const derivedTitle = isFirstMessage
          ? messageText.trim().slice(0, 40) || 'New Conversation'
          : conv.title;
        return {
          ...conv,
          title: derivedTitle,
          messages: [...conv.messages, newMessage],
          lastMessage: messageText,
          timestamp: 'Just now',
        };
      })
    );

    // Check if this is the first message from user
    const currentConversation = conversations.find(c => c.id === activeConversationId);
    const isFirstMessage = (currentConversation?.messages?.length || 0) === 0;
    
    // If it's the first message and no profile data has been provided, show profile input modal
    if (isFirstMessage && !profileData) {
      setIsTyping(true);
      setTimeout(async () => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: `Great! I can be your AI career mentor. Share your profile links so I can tailor guidance to you:

• LinkedIn URL
• GitHub URL
• CodeChef URL

Once I have these, I'll analyze your background and suggest the best next steps, roles to target, and a learning roadmap.`,
          sender: 'assistant',
          timestamp: new Date(),
        };

        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, botResponse],
                  lastMessage: botResponse.text.substring(0, 50) + '...',
                  timestamp: 'Just now',
                }
              : conv
          )
        );
        
        // Fetch suggested messages for the first bot response
        await fetchSuggestedMessages(botResponse.text);
        
        setShowProfileInput(true);
        setSuggestedMessages([]); // Clear suggested messages when showing profile input
        setIsTyping(false);
      }, 1000);
      return;
    }

    // For subsequent messages, call the AI backend
    setIsTyping(true);
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': userEmail
        },
        body: JSON.stringify({
          message: messageText,
          user_email: userEmail,
          context: 'job_search_career'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Chat response:', data);
      console.log('Response structure:', {
        success: data.success,
        message: data.message,
        data: data.data,
        source: data.source,
        timestamp: data.timestamp
      });

      // Extract the message from the response
      let responseText = 'I apologize, but I couldn\'t generate a response at the moment.';
      
      if (data.success && data.data && data.data.ai_response) {
        responseText = data.data.ai_response;
      } else if (data.success && data.message) {
        responseText = data.message;
      } else if (data.data && data.data.message) {
        responseText = data.data.message;
      } else if (typeof data === 'string') {
        responseText = data;
      } else if (data.message) {
        responseText = data.message;
      }
      
      console.log('Extracted response text:', responseText);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText || 'Thank you for your message! I\'m here to help with your career guidance.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      
            console.log('Bot response created:', botResponse);
      
      setConversations(prev => {
        const updated = prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, botResponse],
                lastMessage: botResponse.text.substring(0, 50) + '...',
                timestamp: 'Just now',
              }
            : conv
        );
        console.log('Updated conversations:', updated);
        console.log('Bot response being added:', botResponse);
        return updated;
      });

      // Fetch suggested messages based on bot response
      await fetchSuggestedMessages(responseText);

      // Check if the AI response mentions resume upload
      if (data.message && (data.message.toLowerCase().includes('resume') || data.message.toLowerCase().includes('upload'))) {
        setShowResumeUpload(true);
      }

      // Note: Chat history is maintained in the current conversation, no need to refresh

    } catch (error) {
      console.error('Error calling chat API:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment.`,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, errorMessage],
                lastMessage: errorMessage.text.substring(0, 50) + '...',
                timestamp: 'Just now',
              }
            : conv
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmitProfiles = async () => {
    const hasAny = githubUrl.trim() || codechefUrl.trim();
    if (!hasAny) {
      toast({
        title: "Error",
        description: "Please enter at least GitHub or CodeChef profile URL",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      console.log('Submitting to:', `${baseUrl}/extract`);
      
      const response = await fetch(`${baseUrl}/extract`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': userEmail
        },
        body: JSON.stringify({
          linkedin_url: linkedinUrl.trim() || null,
          github_url: githubUrl.trim() || null,
          codechef_url: codechefUrl.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response:', data);

      // Store profile data for display
      setProfileData(data);

      // Create success message with inline profile cards
      let messageText = `✅ **Profile Analysis Complete!** ${data.database_status || 'Data extracted and stored.'}\n\n`;
      messageText += `📄 **Next Step:** Upload your resume to get complete career analysis and personalized guidance!`;

      const successMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: messageText,
        sender: 'assistant',
        timestamp: new Date(),
        profileData: data, // Add profile data to the message
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, successMessage],
                lastMessage: successMessage.text.substring(0, 50) + '...',
                timestamp: 'Just now',
              }
            : conv
        )
      );

      // Show toast notification
      toast({
        title: "Success!",
        description: "Profiles extracted and stored in database",
      });

      // Add a follow-up message asking for resume upload
      setTimeout(() => {
        const resumeMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: `Now, please upload your resume so I can provide you with comprehensive career analysis and personalized guidance based on your experience and skills.`,
          sender: 'assistant',
          timestamp: new Date(),
        };

        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, resumeMessage],
                  lastMessage: resumeMessage.text.substring(0, 50) + '...',
                  timestamp: 'Just now',
                }
              : conv
          )
        );

        // Show resume upload section after successful profile extraction
        setShowResumeUpload(true);
      }, 2000);
      
      // Hide profile input and clear fields
      setShowProfileInput(false);
      setLinkedinUrl('');
      setGithubUrl('');
      setCodechefUrl('');
      setSuggestedMessages([]); // Clear suggested messages when profile input is hidden

    } catch (error) {
      console.error('Error submitting profiles:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ Failed to submit profiles: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, errorMessage],
                lastMessage: errorMessage.text.substring(0, 50) + '...',
                timestamp: 'Just now',
              }
            : conv
        )
      );

      // Show error toast
      toast({
        title: "Error",
        description: "Failed to submit profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    setIsResumeUploading(true);
    
    try {
      // Use the new AI-powered resume parser service
      const resumeParserUrl = import.meta.env.VITE_RESUME_PARSER_URL || 'http://localhost:5000';
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${resumeParserUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI Resume analysis response:', data);
      console.log('Resume data structure:', data.resume_data);
      console.log('Resume data keys:', Object.keys(data.resume_data || {}));

      if (!data.success) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      // Create success message with inline resume data
      let messageText = `✅ **AI-Powered Resume Analysis Complete!**\n\n`;
      messageText += `🎉 **AI Analysis Summary:**\n`;
      messageText += `Based on your resume analysis using advanced AI, I can now provide personalized career guidance! What would you like to focus on?`;

      const successMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: messageText,
        sender: 'assistant',
        timestamp: new Date(),
        resumeData: data.resume_data, // Add resume data to the message
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, successMessage],
                lastMessage: successMessage.text.substring(0, 50) + '...',
                timestamp: 'Just now',
              }
            : conv
        )
      );

      // Save resume data to Pinecone
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const saveResponse = await fetch(`${baseUrl}/resume-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': userEmail
          },
          body: JSON.stringify({
            user_email: userEmail,
            resume_data: data.resume_data
          }),
        });

        if (saveResponse.ok) {
          console.log('Resume data saved to Pinecone successfully');
        } else {
          console.error('Failed to save resume data to Pinecone:', saveResponse.status);
        }
      } catch (saveError) {
        console.error('Error saving resume data to Pinecone:', saveError);
      }

      // Show success toast
      toast({
        title: "Success!",
        description: "Resume analyzed and saved successfully",
      });

      // Hide resume upload section
      setShowResumeUpload(false);
      setResumeFile(null);

    } catch (error) {
      console.error('Error uploading resume:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, errorMessage],
                lastMessage: errorMessage.text.substring(0, 50) + '...',
                timestamp: 'Just now',
              }
            : conv
        )
      );

      toast({
        title: "Error",
        description: "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResumeUploading(false);
    }
  };

  const handleDeleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      const remaining = conversations.filter(c => c.id !== conversationId);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      }
    }
  };

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      lastMessage: '',
      timestamp: 'Just now',
      messages: [],
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setSuggestedMessages([]); // Clear suggested messages for new conversation
  };

  const fetchSuggestedMessages = async (botMessage: string) => {
    setIsLoadingSuggestions(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      
      // Build conversation history for context
      const conversationHistory = messages.slice(-6).map(msg => ({
        user: msg.sender === 'user' ? msg.text : '',
        bot: msg.sender === 'assistant' ? msg.text : ''
      })).filter(msg => msg.user || msg.bot);
      
      const response = await fetch(`${baseUrl}/suggested-messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': userEmail
        },
        body: JSON.stringify({
          bot_message: botMessage,
          context: 'job_search_career',
          conversation_history: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Suggested messages response:', data);

      if (data.success && data.data.suggested_messages) {
        console.log('Setting suggested messages:', data.data.suggested_messages);
        setSuggestedMessages(data.data.suggested_messages);
      } else {
        console.log('No suggested messages found, setting empty array');
        setSuggestedMessages([]);
      }
    } catch (error) {
      console.error('Error fetching suggested messages:', error);
      setSuggestedMessages([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <Button onClick={handleNewConversation} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>
        
        {/* Recent Conversations */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Conversations</h3>
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-secondary/60 ${
                    conversation.id === activeConversationId ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveConversationId(conversation.id)}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{conversation.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conversation.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {/* Profile Input Modal */}
        {showProfileInput && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Share Your Profiles</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Help me understand your background to provide personalized career guidance
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* LinkedIn Profile */}
                  <div className="space-y-3">
                    <Label htmlFor="linkedin" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </div>
                        <span>LinkedIn Profile</span>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">Optional</span>
                      </div>
                    </Label>
                    <Input
                      id="linkedin"
                      placeholder="https://www.linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      disabled={isSubmitting}
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                    />
                  </div>
                  
                  {/* GitHub Profile */}
                  <div className="space-y-3">
                    <Label htmlFor="github" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </div>
                        <span>GitHub Profile</span>
                        <span className="text-xs text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">Required</span>
                      </div>
                    </Label>
                    <Input
                      id="github"
                      placeholder="https://github.com/username"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      disabled={isSubmitting}
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                    />
                  </div>
                  
                  {/* CodeChef Profile */}
                  <div className="space-y-3">
                    <Label htmlFor="codechef" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm0 4c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2c2.209 0 4 1.791 4 4s-1.791 4-4 4-4-1.791-4-4 1.791-4 4-4z"/>
                          </svg>
                        </div>
                        <span>CodeChef Profile</span>
                        <span className="text-xs text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">Required</span>
                      </div>
                    </Label>
                    <Input
                      id="codechef"
                      placeholder="https://www.codechef.com/users/handle"
                      value={codechefUrl}
                      onChange={(e) => setCodechefUrl(e.target.value)}
                      disabled={isSubmitting}
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                    />
                  </div>
                
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <Button
                      onClick={handleSubmitProfiles}
                      disabled={isSubmitting || (!githubUrl.trim() && !codechefUrl.trim())}
                      className="min-w-[160px] h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Analyze Profiles
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setLinkedinUrl('');
                        setGithubUrl('');
                        setCodechefUrl('');
                      }}
                      disabled={isSubmitting}
                      className="h-12 px-6"
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      💡 LinkedIn is optional! More profiles = better insights!
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowProfileInput(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

                 {/* Resume Upload Modal */}
         {showResumeUpload && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
               <div className="p-8">
                 <div className="text-center mb-8">
                   <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                   </div>
                   <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload Your Resume</h3>
                   <p className="text-gray-600 dark:text-gray-300">
                     Upload your resume to get comprehensive career analysis and personalized guidance
                   </p>
                 </div>
                 
                 <div className="space-y-6">
                   {/* File Upload Area */}
                   <div className="space-y-3">
                     <Label htmlFor="resume" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                           <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                           </svg>
                         </div>
                         <span>Resume File</span>
                         <span className="text-xs text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">Required</span>
                       </div>
                     </Label>
                     
                     <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors">
                       <input
                         type="file"
                         id="resume"
                         accept=".pdf,.doc,.docx"
                         onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                             setResumeFile(file);
                           }
                         }}
                         className="hidden"
                         disabled={isResumeUploading}
                       />
                       <label htmlFor="resume" className="cursor-pointer">
                         <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                           <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                           </svg>
                         </div>
                         <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                           {resumeFile ? resumeFile.name : 'Click to upload resume'}
                         </p>
                         <p className="text-sm text-gray-500 dark:text-gray-400">
                           {resumeFile ? `File size: ${Math.round(resumeFile.size / 1024)} KB` : 'PDF, DOC, or DOCX files accepted'}
                         </p>
                       </label>
                     </div>
                   </div>
                 
                   <div className="mt-8 flex items-center justify-center gap-4">
                     <Button
                       onClick={() => {
                         if (resumeFile) {
                           handleResumeUpload(resumeFile);
                         }
                       }}
                       disabled={isResumeUploading || !resumeFile}
                       className="min-w-[160px] h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold"
                       size="lg"
                     >
                       {isResumeUploading ? (
                         <>
                           <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                           Analyzing...
                         </>
                       ) : (
                         <>
                           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           Analyze Resume
                         </>
                       )}
                     </Button>
                     
                     <Button
                       variant="outline"
                       onClick={() => {
                         setResumeFile(null);
                       }}
                       disabled={isResumeUploading}
                       className="h-12 px-6"
                     >
                       Clear
                     </Button>
                   </div>
                   
                   <div className="mt-6 text-center">
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                       💡 Supported formats: PDF, DOC, DOCX (Max 10MB)
                     </p>
                   </div>
                 </div>
               </div>
               
               {/* Close Button */}
               <button
                 onClick={() => setShowResumeUpload(false)}
                 className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
               >
                 <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>
           </div>
         )}

                             

          

          {/* Chat Interface - Fixed height with proper spacing */}
           <div className="flex-1 h-full flex flex-col">
             <ChatInterface
               messages={messages}
               onSendMessage={handleSendMessage}
               isTyping={isTyping}
               suggestedMessages={suggestedMessages}
               isLoadingSuggestions={isLoadingSuggestions}
               onClearAllChats={clearAllChats}
               onNewChat={createNewConversation}
             />
           </div>
      </main>
    </div>
  );
};

export default Chat;
