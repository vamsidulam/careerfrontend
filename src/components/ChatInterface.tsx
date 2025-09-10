import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import ProfileCard from './ProfileCard';
import ResumeDataDisplay from './ResumeDataDisplay';
import JobCards from './JobCards';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  profileData?: any;
  resumeData?: any;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  suggestedMessages: string[];
  isLoadingSuggestions: boolean;
  onClearAllChats?: () => void;
  onNewChat?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isTyping,
  suggestedMessages,
  isLoadingSuggestions,
  onClearAllChats,
  onNewChat,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if resume was extracted in the last message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'assistant' && lastMessage.resumeData) {
        // Show jobs after a short delay to let the user see the resume data first
        const timer = setTimeout(() => {
          setShowJobs(true);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        // Hide jobs if the last message doesn't have resume data
        setShowJobs(false);
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component mounts or when typing stops
  useEffect(() => {
    if (!isTyping && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !isTyping) {
      onSendMessage(trimmedValue);
      setInputValue('');
      // Focus back to input after sending
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !isTyping) {
        onSendMessage(trimmedValue);
        setInputValue('');
        // Focus back to input after sending
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
    }
  };

  const handleSendClick = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !isTyping) {
      onSendMessage(trimmedValue);
      setInputValue('');
      // Focus back to input after sending
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Input bar component
  const InputBar = () => (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex space-x-2 w-full">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 h-12 text-base bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isTyping}
          autoComplete="off"
          autoFocus={!isTyping}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={startListening}
          disabled={isTyping || isListening}
          className="h-12 w-12 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button 
          type="button"
          onClick={handleSendClick}
          disabled={!inputValue.trim() || isTyping} 
          className="h-12 w-12 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );

  // Suggestions component
  const Suggestions = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-sm text-gray-300 mb-2 font-medium flex items-center justify-center">
        <span className="mr-2">💡</span>
        Quick responses:
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {isLoadingSuggestions ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            <span className="text-sm text-gray-400">Loading suggestions...</span>
          </div>
        ) : suggestedMessages.length > 0 ? (
          suggestedMessages.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSendMessage(suggestion)}
              className="text-xs bg-blue-500 hover:bg-blue-600 border-blue-500 text-white hover:text-white transition-colors duration-200 px-3 py-1 rounded-md shadow-sm"
            >
              {suggestion}
            </Button>
          ))
        ) : (
          <div className="text-sm text-gray-400">
            No suggestions available yet. Type your message below.
          </div>
        )}
      </div>
    </div>
  );

  // If no messages, show centered layout
  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full bg-gray-900">
        {/* Header with New Chat button */}
        {onNewChat && (
          <div className="flex justify-end p-4 border-b border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={onNewChat}
              className="text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
            >
              ➕ New Chat
            </Button>
          </div>
        )}
        
        {/* Welcome Message */}
        <div className="flex-1 flex flex-col justify-center items-center p-8">
          <div className="w-full max-w-2xl space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Welcome to AI Career Mentor! 🚀
              </h2>
              <p className="text-gray-400">
                I'm here to help you with your career journey. Let's get started!
              </p>
            </div>

            {/* Hey Guide Me Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => onSendMessage("Hey guide me")}
                className="text-lg bg-blue-500 hover:bg-blue-600 border-blue-500 text-white hover:text-white transition-colors duration-200 px-10 py-4 rounded-xl shadow-lg"
              >
                🚀 Hey guide me
              </Button>
            </div>

            {/* Input Box - Centered */}
            <div className="flex justify-center">
              <InputBar />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there are messages, show normal layout with input at bottom
  return (
    <div className="flex flex-col h-full bg-gray-900 relative">
      {/* Header with New Chat and Clear All Chats buttons */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          {onNewChat && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNewChat}
              className="text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
            >
              ➕ New Chat
            </Button>
          )}
        </div>
        
        {onClearAllChats && messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAllChats}
            className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white transition-colors"
          >
            🗑️ Clear All Chats
          </Button>
        )}
      </div>
      
      {/* Messages Container - Takes available space */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-0"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-white'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.text}</div>
              
              {/* Display profile cards inline if profileData exists */}
              {message.profileData && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {message.profileData.linkedin && (
                      <ProfileCard
                        title="LinkedIn Profile"
                        icon="🔗"
                        color="bg-gradient-to-r from-blue-500 to-blue-600"
                        data={message.profileData.linkedin}
                        delay={0}
                      />
                    )}
                    
                    {message.profileData.github_repos && message.profileData.github_repos.length > 0 && (
                      <ProfileCard
                        title="GitHub Profile"
                        icon="🐙"
                        color="bg-gradient-to-r from-gray-700 to-gray-800"
                        data={message.profileData.github_repos}
                        delay={1}
                      />
                    )}
                    
                    {message.profileData.codechef && (
                      <ProfileCard
                        title="CodeChef Profile"
                        icon="🏆"
                        color="bg-gradient-to-r from-orange-500 to-orange-600"
                        data={message.profileData.codechef}
                        delay={2}
                      />
                    )}
                  </div>
                </div>
              )}
              
              {/* Display resume data inline if resumeData exists */}
              {message.resumeData && (
                <div className="mt-4">
                  <ResumeDataDisplay resumeData={message.resumeData} />
                </div>
              )}
              
                             {/* Display job cards if showJobs is true and resumeData exists */}
               {message.resumeData && (
                 <div className="mt-4">
                   {!showJobs && (
                     <div className="flex justify-center mb-4">
                       <Button
                         onClick={() => setShowJobs(true)}
                         className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                       >
                         <span>💼</span>
                         <span>Show Recommended Jobs</span>
                       </Button>
                     </div>
                   )}
                   
                   {showJobs && (
                     <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                       <div className="flex items-center justify-between mb-4">
                         <h3 className="text-lg font-semibold text-white flex items-center">
                           <span className="mr-2">💼</span>
                           Recommended Jobs Based on Your Resume
                         </h3>
                         <Button
                           onClick={() => setShowJobs(false)}
                           variant="outline"
                           size="sm"
                           className="text-gray-300 border-gray-600 hover:bg-gray-700"
                         >
                           Hide Jobs
                         </Button>
                       </div>
                       <JobCards limit={6} darkTheme={true} />
                     </div>
                   )}
                 </div>
               )}
              
              <div className="text-xs opacity-70 mt-1">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                <span className="text-sm text-gray-300">AI is typing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 bg-gray-900">
        {/* Suggestions - Sticky positioned above input */}
        {messages.length > 1 && (
          <div className="chat-suggestions-sticky">
            <Suggestions />
          </div>
        )}

        {/* Input Area - Sticky positioned at bottom */}
        <div className="chat-input-sticky">
          <InputBar />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;