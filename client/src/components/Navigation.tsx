import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getBadgeInfo } from "@/lib/badges";
import { VERSION_INFO } from "@/lib/version";
import { Link } from "wouter";
import type { User } from "@shared/schema";

export default function Navigation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const badgeInfo = user ? getBadgeInfo(user.postCount || 0) : null;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      queryClient.setQueryData(["/api/user"], null);
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    },
  });

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-dark border-b border-gray-700 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center space-x-2 text-white text-xl font-bold">
            <i className="fas fa-comments text-blue-500"></i>
            <span>Beta BSS</span>
          </a>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {VERSION_INFO.version} • Build: {VERSION_INFO.buildDate}
            </span>
            
            {user && (
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
                  data-testid="button-user-menu"
                  onClick={() => {
                    const dropdown = document.getElementById('user-dropdown');
                    dropdown?.classList.toggle('hidden');
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="User avatar" 
                        className="w-full h-full rounded-full object-cover"
                        data-testid="img-user-avatar"
                      />
                    ) : (
                      <i className="fas fa-user text-gray-300"></i>
                    )}
                  </div>
                  <span data-testid="text-nav-username">{user.username}</span>
                  {badgeInfo && (
                    <span 
                      className={badgeInfo.className} 
                      title={badgeInfo.title}
                      data-testid="badge-user-tier"
                    >
                      <i className={badgeInfo.icon}></i>
                    </span>
                  )}
                  {user.role === 1 && (
                    <span 
                      className="px-2 py-1 text-xs bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"
                      title="Administrator"
                      data-testid="badge-admin"
                    >
                      Admin
                    </span>
                  )}
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
                
                <div 
                  id="user-dropdown"
                  className="hidden absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50"
                >
                  <Link href="/profile" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 rounded-t-lg" data-testid="link-profile">
                    <i className="fas fa-user mr-2"></i>
                    Profile
                  </Link>
                  <Link href="/settings" className="flex items-center px-4 py-2 text-white hover:bg-gray-700" data-testid="link-settings">
                    <i className="fas fa-cog mr-2"></i>
                    Settings
                  </Link>
                  <hr className="border-gray-700" />
                  <button 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-gray-700 rounded-b-lg disabled:opacity-50"
                    data-testid="button-logout"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
