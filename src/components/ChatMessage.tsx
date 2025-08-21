import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, User, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
  };
  isLatest?: boolean;
}

const ChatMessage = ({ message, isLatest = false }: ChatMessageProps) => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        description: 'Message copied to clipboard',
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatMessage = (text: string) => {
    // Simple formatting for code blocks and line breaks
    const parts = text.split('```');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // Code block
        return (
          <div key={index} className="bg-secondary/50 rounded-lg p-3 my-2 font-mono text-sm overflow-x-auto">
            <pre className="whitespace-pre-wrap">{part}</pre>
          </div>
        );
      } else {
        // Regular text with line breaks
        return (
          <div key={index} className="whitespace-pre-wrap">
            {part}
          </div>
        );
      }
    });
  };

  return (
    <div className={`group flex gap-4 p-6 ${message.sender === 'assistant' ? 'bg-secondary/20' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          message.sender === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'gradient-primary'
        }`}>
          {message.sender === 'user' ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4 text-primary-foreground" />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm">
            {message.sender === 'user' ? 'You' : 'Career Mentor'}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>

        <div className="prose prose-sm max-w-none text-foreground">
          {formatMessage(message.text)}
        </div>

        {/* Message Actions */}
        {message.sender === 'assistant' && (
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(message.text)}
              className="h-8 px-2"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ThumbsDown className="w-4 h-4" />
            </Button>
            {isLatest && (
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;