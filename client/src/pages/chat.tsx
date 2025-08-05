import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/use-socket";
import { UsernameModal } from "@/components/username-modal";
import { UsersSidebar } from "@/components/users-sidebar";
import { ChatArea } from "@/components/chat-area";
import { useToast } from "@/hooks/use-toast";
import type { Message, User } from "@shared/schema";

export default function Chat() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  const [joinError, setJoinError] = useState<string>("");

  const { toast } = useToast();
  const { socket, connected, error, joinChat, sendMessage, startTyping, stopTyping } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Handle successful join
    socket.on("joined", (data: { user: User }) => {
      setCurrentUser(data.user);
      setShowUsernameModal(false);
      setJoinError("");
      toast({
        title: "Welcome to Tao Chat!",
        description: "You have successfully joined the chat room.",
      });
    });

    // Handle message history
    socket.on("message_history", (messageHistory: Message[]) => {
      setMessages(messageHistory);
    });

    // Handle new messages
    socket.on("new_message", (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Handle users updates
    socket.on("users_updated", (activeUsers: User[]) => {
      setUsers(activeUsers);
    });

    // Handle user joined
    socket.on("user_joined", (data: { username: string }) => {
      toast({
        title: "User joined",
        description: `${data.username} joined the chat`,
      });
    });

    // Handle user left
    socket.on("user_left", (data: { username: string }) => {
      toast({
        title: "User left", 
        description: `${data.username} left the chat`,
      });
    });

    // Handle typing indicators
    socket.on("user_typing", (data: { username: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return prev.includes(data.username) ? prev : [...prev, data.username];
        } else {
          return prev.filter(user => user !== data.username);
        }
      });
    });

    // Handle socket errors
    socket.on("error", (data: { message: string }) => {
      setJoinError(data.message);
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
      });
    });

    return () => {
      socket.off("joined");
      socket.off("message_history");
      socket.off("new_message");
      socket.off("users_updated");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("user_typing");
      socket.off("error");
    };
  }, [socket, toast]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Connection Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleJoinChat = (username: string) => {
    setJoinError("");
    joinChat(username);
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (showUsernameModal || !currentUser) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <UsernameModal
          isOpen={showUsernameModal}
          onSubmit={handleJoinChat}
          error={joinError}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <UsersSidebar
        users={users}
        currentUsername={currentUser.username}
        isConnected={connected}
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <ChatArea
        messages={messages}
        users={users}
        currentUsername={currentUser.username}
        isConnected={connected}
        onSendMessage={handleSendMessage}
        onStartTyping={startTyping}
        onStopTyping={stopTyping}
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
        typingUsers={typingUsers.filter(user => user !== currentUser.username)}
      />
    </div>
  );
}
