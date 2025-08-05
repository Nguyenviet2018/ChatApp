import { User } from "@shared/schema";

interface UsersSidebarProps {
  users: User[];
  currentUsername: string;
  isConnected: boolean;
  isMobileOpen: boolean;
  onClose: () => void;
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

export function UsersSidebar({ users, currentUsername, isConnected, isMobileOpen, onClose }: UsersSidebarProps) {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`w-64 bg-white border-r border-gray-200 flex-shrink-0 transform transition-transform duration-300 ease-in-out fixed lg:relative h-full z-40 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <h2 className="font-semibold text-gray-800">Tao Chat</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
        
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Active Users ({users.length})
          </h3>
          
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="relative">
                  <div className={`w-8 h-8 ${getUserColor(user.username)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                    {getUserInitial(user.username)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {user.username === currentUsername ? 'You' : user.username}
                  </p>
                  <p className="text-xs text-gray-500">Active now</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Status */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-600">
                {isConnected ? 'Real-time connected' : 'Connection lost'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
