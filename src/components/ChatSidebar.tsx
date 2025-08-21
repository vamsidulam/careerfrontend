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
  Search,
  Trash2,
  Edit3,
  User,
  Settings,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <Sidebar className="border-r border-border bg-card">
      <SidebarContent className="flex flex-col h-full">
        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-3 h-12"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span>New Chat</span>}
          </Button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50"
              />
            </div>
          </div>
        )}

        {/* Conversations */}
        <SidebarGroup className="flex-1">
          {!collapsed && (
            <SidebarGroupLabel className="px-4 text-muted-foreground">
              Recent Conversations
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {filteredConversations.map((conversation) => (
                <SidebarMenuItem key={conversation.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={conversation.id === activeConversationId}
                  >
                    <div
                      className={`group flex items-center gap-3 w-full p-3 rounded-lg cursor-pointer transition-colors hover:bg-secondary/80 ${
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
                              <>
                                <div className="font-medium text-sm truncate mb-1">
                                  {conversation.title}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {conversation.lastMessage}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRename(conversation.id, conversation.title);
                              }}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
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

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="justify-start flex-1">
              <User className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Profile</span>}
            </Button>
            {!collapsed && (
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default ChatSidebar;