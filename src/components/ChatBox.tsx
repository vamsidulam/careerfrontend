import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChatMessage from '@/components/ChatMessage';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatBoxProps {
  title?: string;
  heightClassName?: string; // e.g., 'h-[500px]'
}

const ChatBox = ({ title = 'Chat', heightClassName = 'h-[520px]' }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate assistant reply
    setIsTyping(true);
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: generateReply(content),
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, reply]);
      setIsTyping(false);
    }, 800);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const generateReply = (text: string) => {
    const m = text.toLowerCase();
    if (m.includes('github')) return 'Share your GitHub username; I will analyze your repositories and activity.';
    if (m.includes('linkedin')) return 'Send your LinkedIn URL; I will suggest profile improvements and roles to target.';
    if (m.includes('roadmap')) return 'Tell me your current level and target role; I will draft a learning roadmap.';
    return 'I am your AI career mentor. Ask about profiles, learning paths, or interview prep.';
  };

  return (
    <Card className="gradient-card border border-border">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex flex-col ${heightClassName}`}>
          <div className="flex-1 overflow-y-auto rounded-md bg-background/60 border border-border">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-6">
                Start the conversation using the input below.
              </div>
            ) : (
              <div>
                {messages.map((m, i) => (
                  <ChatMessage key={m.id} message={m} isLatest={i === messages.length - 1} />
                ))}
                {isTyping && (
                  <div className="flex gap-4 p-6 bg-secondary/20">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message"
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatBox;


