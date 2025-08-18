import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";

export default function AdminPanel() {
  const [showUserModal, setShowUserModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: number }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  const handleRoleToggle = (userId: string, currentRole: number) => {
    const newRole = currentRole === 1 ? 0 : 1;
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 border border-yellow-500">
          <div className="flex items-center mb-4">
            <i className="fas fa-shield-alt text-black mr-2"></i>
            <h3 className="text-lg font-semibold text-black">Admin Controls</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h6 className="font-semibold text-black mb-2 flex items-center">
                <i className="fas fa-users mr-2"></i>
                User Management
              </h6>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowUserModal(true)}
                  className="bg-black/20 hover:bg-black/30 text-black px-4 py-2 rounded transition-colors text-sm"
                  data-testid="button-view-users"
                >
                  <i className="fas fa-list mr-1"></i>
                  View Users
                </button>
                <button
                  className="bg-black/20 hover:bg-black/30 text-black px-4 py-2 rounded transition-colors text-sm"
                  data-testid="button-manage-users"
                >
                  <i className="fas fa-user-times mr-1"></i>
                  Manage
                </button>
              </div>
            </div>
            
            <div>
              <h6 className="font-semibold text-black mb-2 flex items-center">
                <i className="fas fa-chart-bar mr-2"></i>
                Statistics
              </h6>
              <div className="flex space-x-2">
                <button
                  className="bg-black/20 hover:bg-black/30 text-black px-4 py-2 rounded transition-colors text-sm"
                  data-testid="button-view-stats"
                >
                  <i className="fas fa-analytics mr-1"></i>
                  View Stats
                </button>
                <button
                  className="bg-black/20 hover:bg-black/30 text-black px-4 py-2 rounded transition-colors text-sm"
                  data-testid="button-export-data"
                >
                  <i className="fas fa-download mr-1"></i>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <i className="fas fa-users mr-2"></i>
                User Management
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-white"
                data-testid="button-close-user-modal"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-96">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-300">Loading users...</p>
                </div>
              ) : users?.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No users found.</p>
              ) : (
                <div className="space-y-3">
                  {users?.map((user) => (
                    <div 
                      key={user.id} 
                      className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                      data-testid={`user-row-${user.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                          {user.profileImageUrl || user.avatarUrl ? (
                            <img 
                              src={user.profileImageUrl || user.avatarUrl} 
                              alt="User avatar" 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <i className="fas fa-user text-gray-300 text-sm"></i>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          <p className="text-gray-500 text-xs">
                            Posts: {user.postCount} • 
                            Joined: {new Date(user.dateJoined!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span 
                          className={`px-2 py-1 text-xs rounded ${
                            user.role === 1 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-600 text-gray-300'
                          }`}
                        >
                          {user.role === 1 ? 'Admin' : 'User'}
                        </span>
                        
                        <button
                          onClick={() => handleRoleToggle(user.id, user.role || 0)}
                          disabled={updateRoleMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-xs transition-colors"
                          data-testid={`button-toggle-role-${user.id}`}
                        >
                          {user.role === 1 ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deleteUserMutation.isPending}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-xs transition-colors"
                          data-testid={`button-delete-${user.id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
