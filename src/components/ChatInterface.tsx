import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import ChatMessage from '@/components/ChatMessage';
import { Send, Square, Paperclip, Mic, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  placeholder?: string;
}

const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  isTyping = false,
  placeholder = "Message Career Mentor..." 
}: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    onSendMessage(input.trim());
    setInput('');

    // Simulate response delay
    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const stopGeneration = () => {
    setIsGenerating(false);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const summary = Array.from(files)
      .map((f) => `${f.name} (${Math.round(f.size / 1024)} KB)`) 
      .join(', ');

    toast({ description: `Attached: ${summary}` });
    onSendMessage(`Attached: ${summary}`);
    e.currentTarget.value = '';
  };

  const toggleMic = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({ description: 'Speech recognition not supported in this browser.' });
        return;
      }

      if (!isRecording) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInput((prev) => (prev ? prev + ' ' : '') + transcript.trim());
        };
        recognition.onend = () => {
          setIsRecording(false);
          toast({ description: 'Recording stopped' });
        };
        recognition.onerror = () => {
          setIsRecording(false);
        };
        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
        toast({ description: 'Recording… speak now' });
      } else {
        recognitionRef.current?.stop();
        setIsRecording(false);
      }
    } catch (err) {
      setIsRecording(false);
    }
  };

  const quickPrompts: string[] = ['hey guide me'];

  const handleQuickPromptClick = (prompt: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    onSendMessage(prompt);
    setInput('');
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const getLastRelevantMessage = (): string => {
    if (messages.length === 0) return '';
    const lastUser = [...messages].reverse().find(m => m.sender === 'user');
    return (lastUser?.text || messages[messages.length - 1].text || '').toLowerCase();
  };

  const deriveSuggestions = (context: string): string[] => {
    const suggestions: string[] = [];
    const add = (arr: string[]) => arr.forEach(s => suggestions.push(s));

    if (context.includes('github') || context.includes('repo')) {
      add([
        'Assess my top languages',
        'Suggest improvements for my README',
        'Recommend projects to strengthen my profile',
        'Identify good first issues to contribute',
      ]);
    }

    if (context.includes('linkedin') || context.includes('profile')) {
      add([
        'Optimize my LinkedIn headline',
        'Rewrite my About section',
        'List keywords for my target role',
        'Suggest networking outreach messages',
      ]);
    }

    if (context.includes('roadmap') || context.includes('learn') || context.includes('skills')) {
      add([
        'Create a 3‑month learning roadmap',
        'Recommend courses and resources',
        'Give 3 portfolio project ideas',
        'Set milestones and weekly goals',
      ]);
    }

    if (context.includes('interview') || context.includes('prepare')) {
      add([
        'Generate mock interview questions',
        'ATS-check my resume summary',
        'List DSA topics to revise',
        'System design topics to study',
      ]);
    }

    if (suggestions.length === 0) {
      add([
        'Summarize what we discussed',
        'What should I do next?',
        'Share the best resources for me',
        'Suggest relevant certifications',
        'Draft a weekly study plan',
      ]);
    }

    // Deduplicate and cap
    return Array.from(new Set(suggestions)).slice(0, 6);
  };

  const contextualSuggestions = useMemo(() => deriveSuggestions(getLastRelevantMessage()), [messages]);

  return (
    <div className="flex flex-col h-full">
      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFilesSelected} />
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-background text-foreground">
            <div className="w-full px-4 max-w-3xl text-center">
              <h2 className="text-3xl md:text-4xl font-semibold mb-6">What are you working on?</h2>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {quickPrompts.map((p, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleQuickPromptClick(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-3 rounded-full px-4 py-3 shadow-card bg-white/5 ring-1 ring-primary/40 hover:ring-primary/60 transition-colors">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything"
                  className="flex-1 bg-transparent border-none focus-visible:ring-0"
                />
                <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${isRecording ? 'text-primary' : ''}`} onClick={toggleMic}>
                  <Mic className="w-4 h-4" />
                </Button>
                <Button onClick={handleSend} disabled={!input.trim() || isGenerating} size="sm" className="h-8 w-8 p-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">Try: “Analyze my GitHub profile and suggest roles to target.”</p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}

            {/* Typing Indicator */}
            {(isTyping || isGenerating) && (
              <div className="flex gap-4 p-6 bg-secondary/20">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">Career Mentor</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area (hidden for landing) */}
      {messages.length > 0 && (
      <div className="border-t border-border bg-background p-4">
        <div className="max-w-4xl mx-auto">
          {contextualSuggestions.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {contextualSuggestions.map((p, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleQuickPromptClick(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="relative rounded-2xl border border-border bg-card p-4">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[24px] max-h-[200px] resize-none border-none bg-transparent p-0 text-base focus-visible:ring-0 scrollbar-thin"
              rows={1}
            />
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${isRecording ? 'text-primary' : ''}`} onClick={toggleMic}>
                  <Mic className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {isGenerating && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopGeneration}
                    className="h-8"
                  >
                    <Square className="w-3 h-3 mr-1" />
                    Stop
                  </Button>
                )}
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isGenerating}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-2">
            <p className="text-xs text-muted-foreground">
              Career Mentor can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ChatInterface;