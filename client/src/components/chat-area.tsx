import { useEffect, useRef, useState } from "react";
import { Menu, Users, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageInput } from "./message-input";
import type { Message, User } from "@shared/schema";

interface ChatAreaProps {
  messages: Message[];
  users: User[];
  currentUsername: string;
  isConnected: boolean;
  onSendMessage: (content: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  typingUsers: string[];
  onClearMessages: () => void;
}

function getUserInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}

function getUserColor(username: string): string {
  const colors = [
    "bg-indigo-500",
    "bg-emerald-500", 
    "bg-purple-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-amber-500",
    "bg-red-500",
    "bg-blue-500"
  ];
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date));
}

export function ChatArea({
  messages,
  users,
  currentUsername,
  isConnected,
  onSendMessage,
  onStartTyping,
  onStopTyping,
  onToggleSidebar,
  isSidebarOpen,
  typingUsers,
  onClearMessages
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-white lg:ml-0">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
          <h1 className="text-lg font-semibold text-gray-800">General Chat</h1>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{users.length}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {messages.length >= 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearMessages}
              disabled={!isConnected}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Xóa chat
            </Button>
          )}
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => {
          const isOwnMessage = message.username === currentUsername;
          
          return (
            <div 
              key={message.id} 
              className={`flex items-start space-x-3 ${isOwnMessage ? 'justify-end' : ''}`}
            >
              {isOwnMessage ? (
                <>
                  <div className="flex-1 flex flex-col items-end">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                      <span className="text-sm font-medium text-gray-800">You</span>
                    </div>
                    <div className="bg-indigo-600 rounded-lg p-3 max-w-md">
                      <p className="text-sm text-white">{message.content}</p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 ${getUserColor(message.username)} rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                    {getUserInitial(message.username)}
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-8 h-8 ${getUserColor(message.username)} rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                    {getUserInitial(message.username)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {message.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                      <p className="text-sm text-gray-800">{message.content}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              ?
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {typingUsers.length === 1 
                      ? `${typingUsers[0]} is typing...`
                      : `${typingUsers.length} people are typing...`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onStartTyping={onStartTyping}
        onStopTyping={onStopTyping}
        isConnected={isConnected}
      />
    </div>
  );
}
