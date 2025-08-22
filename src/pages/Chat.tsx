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

  // Load conversations from localStorage (or seed empty)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: Conversation[] = JSON.parse(raw).map((c: any) => ({
          ...c,
          messages: (c.messages || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
        }));
        setConversations(stored);
        if (stored[0]) setActiveConversationId(stored[0].id);
      } else {
        const first: Conversation = {
          id: Date.now().toString(),
          title: 'New Conversation',
          lastMessage: '',
          timestamp: 'Just now',
          messages: [],
        };
        setConversations([first]);
        setActiveConversationId(first.id);
      }
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

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

    // Check if this is the "hey guide me" message
    if (messageText.toLowerCase().includes('hey guide me') || messageText.toLowerCase().includes('guide me')) {
      setShowProfileInput(true);
    }

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(messageText),
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
      setIsTyping(false);
    }, 1500);
  };

  const handleSubmitProfiles = async () => {
    const hasAny = linkedinUrl.trim() || githubUrl.trim() || codechefUrl.trim();
    if (!hasAny) {
      toast({
        title: "Error",
        description: "Please enter at least one profile URL",
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
        headers: { 'Content-Type': 'application/json' },
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

      // Add success message to chat
      const successMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `✅ Profiles submitted successfully! ${data.database_status || 'Data extracted and stored.'}`,
        sender: 'assistant',
        timestamp: new Date(),
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

      // Hide profile input and clear fields
      setShowProfileInput(false);
      setLinkedinUrl('');
      setGithubUrl('');
      setCodechefUrl('');

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

  const generateResponse = (userMessage: string): string => {
    // Simple response generation based on keywords
    const message = userMessage.toLowerCase();
    
    if (message.includes('hey guide me') || message === 'guide me' || message.includes('help me') || message.includes('start')) {
      return `Great! I can be your AI career mentor. Share your profile links so I can tailor guidance to you:

• LinkedIn URL
• GitHub URL
• CodeChef URL

Once I have these, I'll analyze your background and suggest the best next steps, roles to target, and a learning roadmap.`;
    }

    if (message.includes('github') || message.includes('profile')) {
      return `I'd love to analyze your GitHub profile! Please share your GitHub username or the direct link to your profile. I'll examine:

• **Repository Quality**: Project complexity, code organization, and documentation
• **Programming Languages**: Your most-used languages and frameworks
• **Contribution Patterns**: Consistency, collaboration, and open-source involvement
• **Project Diversity**: Full-stack capabilities, specializations, and interests

Once I review your profile, I can provide:
✅ Personalized career path recommendations
✅ Skill gap analysis and learning priorities
✅ Industry-specific opportunities
✅ Step-by-step roadmap for advancement

What's your GitHub username?`;
    }
    
    if (message.includes('linkedin')) {
      return `Great! LinkedIn analysis provides valuable insights into your professional journey. I can help you optimize your profile and identify career opportunities based on:

• **Professional Experience**: Roles, responsibilities, and career progression
• **Skills & Endorsements**: Technical and soft skills validation
• **Network Analysis**: Industry connections and potential mentors
• **Content Engagement**: Thought leadership and industry involvement

Please share your LinkedIn profile URL, and I'll provide recommendations for:
🎯 Profile optimization strategies
🎯 Networking opportunities in your field
🎯 Career advancement pathways
🎯 Skill development priorities

What's your LinkedIn profile?`;
    }
    
    if (message.includes('roadmap') || message.includes('learn')) {
      return `I'll create a personalized learning roadmap for you! To provide the most relevant recommendations, I'd like to understand:

🎯 **Current Skill Level**: Beginner, intermediate, or advanced?
🎯 **Target Role**: What position are you aiming for?
🎯 **Timeline**: When do you want to achieve your goal?
🎯 **Learning Style**: Prefer courses, projects, or certifications?

Based on your goals, I can create a roadmap including:
📚 **Structured Learning Path**: Courses and resources
🛠️ **Hands-on Projects**: Portfolio-worthy applications  
🏆 **Certifications**: Industry-recognized credentials
⏰ **Timeline**: Realistic milestones and deadlines

What specific technology or role are you targeting?`;
    }

    return `I'm here to help guide your career journey! I can assist with:

🚀 **Profile Analysis**: GitHub, LinkedIn, and CodeChef review
📊 **Career Planning**: Personalized roadmaps and goal setting  
📚 **Skill Development**: Learning resources and project ideas
💼 **Job Preparation**: Interview tips and portfolio guidance

What specific aspect of your career would you like to focus on today? Feel free to share any profiles or ask about particular technologies or roles you're interested in!`;
  };

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      lastMessage: '',
      timestamp: 'Just now',
      messages: [],
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setShowProfileInput(false);
  };

  const handleDeleteConversation = (id: string) => {
    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);
    if (activeConversationId === id) {
      if (remaining[0]) {
        setActiveConversationId(remaining[0].id);
      } else {
        const first: Conversation = {
          id: Date.now().toString(),
          title: 'New Conversation',
          lastMessage: '',
          timestamp: 'Just now',
          messages: [],
        };
        setConversations([first]);
        setActiveConversationId(first.id);
      }
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id ? { ...conv, title: newTitle } : conv
      )
    );
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full bg-background flex">
      <aside className="w-56 border-r border-border bg-card/80 backdrop-blur flex flex-col">
        {/* New Chat Button */}
        <div className="p-3 border-b border-border">
          <Button onClick={handleNewChat} size="sm" className="w-full justify-start gap-2">
            <Plus className="w-4 h-4" />
            New Chat
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
        {/* Profile Input Section */}
        {showProfileInput && (
          <div className="border-b border-border p-4 bg-card/60">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-3">Enter Your Profile URLs</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://www.linkedin.com/in/username"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub URL</Label>
                  <Input
                    id="github"
                    placeholder="https://github.com/username"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codechef">CodeChef URL</Label>
                  <Input
                    id="codechef"
                    placeholder="https://www.codechef.com/users/handle"
                    value={codechefUrl}
                    onChange={(e) => setCodechefUrl(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button
                  onClick={handleSubmitProfiles}
                  disabled={isSubmitting || (!linkedinUrl.trim() && !githubUrl.trim() && !codechefUrl.trim())}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    'Extract Profiles'
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
                >
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowProfileInput(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="flex-1">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
          />
        </div>
      </main>
    </div>
  );
};

export default Chat;