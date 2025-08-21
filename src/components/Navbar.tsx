import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Menu, Settings, LogOut, MessageSquare } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-[100px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md gradient-primary shadow-glow" />
            <span className="font-semibold text-lg tracking-tight">Career Mentor</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <Link to="/" className="text-sm px-3 py-2 rounded-md hover:bg-secondary/60 transition-colors">Home</Link>
          <Link to="/chat" className="text-sm px-3 py-2 rounded-md hover:bg-secondary/60 transition-colors">Chat</Link>
          <Link to="/settings" className="text-sm px-3 py-2 rounded-md hover:bg-secondary/60 transition-colors">Settings</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback>CM</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">You</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-sm">Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;


