import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Plus,
  MessageSquare,
  Trash2,
} from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isActive?: boolean;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
}

const ChatSidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
}: ChatSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations;

  const handleRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const submitRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation?.(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitRename();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditTitle('');
    }
  };

    return (
    <Sidebar className="border-r border-border bg-card h-full">
      <SidebarContent className="flex flex-col h-full">
        {/* Conversations Section starting from New Chat */}
        <SidebarGroup className="overflow-hidden">
          <SidebarGroupContent className="overflow-y-auto max-h-[150px]">
            <SidebarMenu className="space-y-2 px-3 py-2">
              {/* New Chat Button - starting point of the conversation box */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div
                    className="group flex items-center gap-3 w-full py-3 px-4 rounded-lg cursor-pointer transition-colors hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                    onClick={onNewChat}
                  >
                    <Plus className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          New Chat
                        </div>
                      </div>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Existing conversations */}
              {filteredConversations.map((conversation) => (
                <SidebarMenuItem key={conversation.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={conversation.id === activeConversationId}
                  >
                    <div
                      className={`group flex items-center gap-3 w-full py-3 px-4 rounded-lg cursor-pointer transition-colors hover:bg-secondary/80 ${
                        conversation.id === activeConversationId
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            {editingId === conversation.id ? (
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={handleKeyPress}
                                onBlur={submitRename}
                                className="h-6 text-sm bg-transparent border-none p-0 focus-visible:ring-1"
                                autoFocus
                              />
                            ) : (
                              <div className="font-medium text-sm truncate">
                                {conversation.title}
                              </div>
                            )}
                          </div>
                          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteConversation?.(conversation.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>
    </Sidebar>
  );
};

export default ChatSidebar;