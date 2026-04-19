import { MessageCircle, Send, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ChatPanelProps {
  gameId: string;
  isOpen?: boolean;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  color: string;
  timestamp: Date;
  isSystem: boolean;
}

const QUICK_EMOTES = ["👏", "🎲", "🔥", "😮", "💀", "🏆"];

const SYSTEM_EVENTS: ChatMessage[] = [
  {
    id: "sys-1",
    sender: "System",
    text: "Welcome to LudoVerse ICP — Game started. Good luck, players!",
    color: "#a855f7",
    timestamp: new Date(),
    isSystem: true,
  },
  {
    id: "sys-2",
    sender: "System",
    text: "[Red] rolled a 6 — bonus turn!",
    color: "#a855f7",
    timestamp: new Date(Date.now() - 30000),
    isSystem: true,
  },
];

const AI_PLAYERS = [
  { name: "NeonBot", color: "#ec4899" },
  { name: "CyberKing", color: "#22d3ee" },
  { name: "QuantumPro", color: "#4ade80" },
];

const AI_LINES = [
  "Let's go! 🔥",
  "Nice move!",
  "This is intense!",
  "Almost home!",
  "My strategy is unmatched 🎯",
  "Rolling for glory!",
  "Who dares challenge me?",
  "GG incoming!",
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPanel({
  gameId: _gameId,
  isOpen = true,
  onClose,
}: ChatPanelProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const [messages, setMessages] = useState<ChatMessage[]>(SYSTEM_EVENTS);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message change is intentional
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate AI chat messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.65) {
        const player =
          AI_PLAYERS[Math.floor(Math.random() * AI_PLAYERS.length)];
        const text = AI_LINES[Math.floor(Math.random() * AI_LINES.length)];
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: player.name,
            text,
            color: player.color,
            timestamp: new Date(),
            isSystem: false,
          },
        ]);
      }
    }, 18000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const name = userProfile?.name ?? "You";
    const color = userProfile?.color ?? "#a855f7";
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: name,
        text: text.trim(),
        color,
        timestamp: new Date(),
        isSystem: false,
      },
    ]);
  };

  const handleSend = () => {
    sendMessage(inputText);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmote = (emote: string) => {
    sendMessage(emote);
  };

  if (!isOpen) return null;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden border border-purple-500/30 h-[480px] sm:h-[520px]"
      style={{
        background:
          "linear-gradient(180deg, rgba(12,0,18,0.95) 0%, rgba(18,0,28,0.95) 100%)",
        backdropFilter: "blur(20px)",
      }}
      data-ocid="chat.panel"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-purple-500/20 shrink-0"
        style={{ background: "rgba(168,85,247,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-background" />
          </div>
          <span className="font-semibold text-sm text-foreground">
            Live Chat
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            Live
          </span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-7 h-7 text-muted-foreground hover:text-foreground"
            aria-label="Close chat"
            data-ocid="chat.close_button"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(168,85,247,0.3) transparent",
        }}
        data-ocid="chat.messages.list"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`animate-in fade-in slide-in-from-bottom-1 duration-200 ${msg.isSystem ? "opacity-70" : ""}`}
            data-ocid="chat.message.item"
          >
            {msg.isSystem ? (
              <div className="flex items-center gap-2 py-1">
                <div className="h-px flex-1 bg-purple-500/20" />
                <p className="text-[11px] text-purple-400/80 italic px-2">
                  {msg.text}
                </p>
                <div className="h-px flex-1 bg-purple-500/20" />
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `${msg.color}25`,
                    border: `1px solid ${msg.color}50`,
                  }}
                >
                  <span style={{ color: msg.color }}>
                    {msg.sender.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: msg.color }}
                    >
                      {msg.sender}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/85 break-words leading-snug mt-0.5">
                    {msg.text}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick emotes */}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-purple-500/10 shrink-0">
        {QUICK_EMOTES.map((emote) => (
          <button
            key={emote}
            type="button"
            onClick={() => handleEmote(emote)}
            className="text-lg hover:scale-125 transition-transform duration-150 rounded-lg p-1 hover:bg-purple-500/10"
            aria-label={`Send ${emote}`}
            data-ocid={"chat.emote.button"}
          >
            {emote}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-purple-500/15 shrink-0">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Say something..."
          maxLength={200}
          className="bg-white/5 border-white/10 focus:border-purple-500/40 text-sm"
          data-ocid="chat.message.input"
        />
        <Button
          onClick={handleSend}
          disabled={!inputText.trim()}
          size="icon"
          className="shrink-0"
          style={{ background: "linear-gradient(135deg, #a855f7, #22d3ee)" }}
          aria-label="Send message"
          data-ocid="chat.send.button"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
