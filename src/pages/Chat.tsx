import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/ChatSidebar';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

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
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Career Path Analysis',
      lastMessage: 'Based on your GitHub profile...',
      timestamp: '2 hours ago',
      messages: [
        {
          id: '1',
          text: 'Hi! Can you analyze my GitHub profile and suggest a career path?',
          sender: 'user',
          timestamp: new Date(Date.now() - 7200000),
        },
        {
          id: '2',
          text: 'I\'d be happy to help analyze your GitHub profile! Please share your GitHub username or profile link, and I\'ll examine your repositories, programming languages, contribution patterns, and project complexity to provide personalized career recommendations.\n\nI can help identify:\n• Your strongest programming languages and frameworks\n• Project management and collaboration skills\n• Areas for skill development\n• Potential career paths that match your interests\n• Specific learning roadmaps\n\nWhat\'s your GitHub profile?',
          sender: 'assistant',
          timestamp: new Date(Date.now() - 7180000),
        },
      ],
    },
    {
      id: '2',
      title: 'React Developer Roadmap',
      lastMessage: 'Here\'s your personalized roadmap...',
      timestamp: '1 day ago',
      messages: [
        {
          id: '3',
          text: 'I want to become a senior React developer. What should I learn?',
          sender: 'user',
          timestamp: new Date(Date.now() - 86400000),
        },
      ],
    },
  ]);

  const [activeConversationId, setActiveConversationId] = useState<string>('1');
  const [isTyping, setIsTyping] = useState(false);

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
      prev.map(conv =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: messageText,
              timestamp: 'Just now',
            }
          : conv
      )
    );

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

  const generateResponse = (userMessage: string): string => {
    // Simple response generation based on keywords
    const message = userMessage.toLowerCase();
    
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
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id && conversations.length > 1) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConversationId(remaining[0].id);
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
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
        />

        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between h-14 px-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SidebarTrigger>
                <h1 className="font-semibold text-lg">
                  {activeConversation?.title || 'Career Mentor'}
                </h1>
              </div>
            </div>
          </header>

          {/* Chat Interface */}
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Chat;