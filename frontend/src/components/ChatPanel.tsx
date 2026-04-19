import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send, MessageCircle } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useQueries';

interface ChatPanelProps {
  gameId: string;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  color: string;
  timestamp: Date;
}

export default function ChatPanel({ gameId }: ChatPanelProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'System',
      text: 'Welcome to LudoVerse ICP! Game started - good luck!',
      color: '#a855f7',
      timestamp: new Date(),
    },
    {
      id: '2',
      sender: 'System',
      text: 'Real-time chat is active. All players can see your messages.',
      color: '#a855f7',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate receiving messages from other players
  useEffect(() => {
    const aiMessages = [
      'Good luck everyone!',
      'Nice move!',
      'This is intense!',
      'Great game so far',
      'Almost there!',
    ];

    const aiPlayers = [
      { name: 'AI Player 2', color: '#ec4899' },
      { name: 'AI Player 3', color: '#3b82f6' },
      { name: 'AI Player 4', color: '#22c55e' },
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomPlayer = aiPlayers[Math.floor(Math.random() * aiPlayers.length)];
        const randomMessage = aiMessages[Math.floor(Math.random() * aiMessages.length)];
        
        const newMessage: Message = {
          id: Date.now().toString(),
          sender: randomPlayer.name,
          text: randomMessage,
          color: randomPlayer.color,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!inputText.trim() || !userProfile) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: userProfile.name,
      text: inputText.trim(),
      color: userProfile.color,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-cyan-500/30 h-[400px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-cyan-400" />
          Live Chat
          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            Real-time
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 p-4 pt-0">
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
          {messages.map((message) => (
            <div key={message.id} className="text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="font-medium" style={{ color: message.color }}>
                {message.sender}:
              </span>{' '}
              <span className="text-muted-foreground">{message.text}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="bg-white/5 border-white/10 focus:border-cyan-500/50"
            maxLength={200}
          />
          <Button
            onClick={handleSend}
            disabled={!inputText.trim()}
            size="icon"
            className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
