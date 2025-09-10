import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const ChatInputTest = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSend = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      setMessages(prev => [...prev, trimmedValue]);
      setInputValue('');
      // Focus back to input after sending
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Chat Input Test</h2>
      
      {/* Messages Display */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg min-h-[200px] max-h-[300px] overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet. Type something below!</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="mb-2 p-2 bg-white rounded border">
              {msg}
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1"
          autoComplete="off"
        />
        <Button 
          type="button"
          onClick={handleSend}
          disabled={!inputValue.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Test Instructions */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ul className="text-sm space-y-1">
          <li>• Type a message and press Enter</li>
          <li>• Click the send button</li>
          <li>• Verify input clears and refocuses</li>
          <li>• Check that you can type multiple messages</li>
        </ul>
      </div>
    </div>
  );
};

export default ChatInputTest;
