import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import NewMessageForm from "@/components/NewMessageForm";
import MessageCard from "@/components/MessageCard";
import AdminPanel from "@/components/AdminPanel";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { MessageWithUser } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: messagesData, isLoading: messagesLoading, error } = useQuery<{
    messages: MessageWithUser[];
    totalCount: number;
  }>({
    queryKey: ["/api/messages"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
    }
  }, [error, toast]);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-dark text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center">
              <i className="fas fa-bullhorn mr-3 text-blue-500"></i>
              Beta BSS
            </h2>
            <p className="text-gray-300">
              <span data-testid="text-message-count">
                {messagesData?.totalCount || 0}
              </span> messages from our community
              • Welcome back, <strong data-testid="text-username">{user?.username}</strong>!
            </p>
          </div>
        </div>

        {/* New Message Form */}
        <NewMessageForm />

        {/* Admin Panel */}
        {user?.role === 1 && <AdminPanel />}

        {/* Messages List */}
        <div className="space-y-4">
          {messagesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading messages...</p>
            </div>
          ) : messagesData?.messages.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-comments text-6xl text-gray-600 mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
              <p className="text-gray-400">Be the first to share something with the community!</p>
            </div>
          ) : (
            messagesData?.messages.map((message) => (
              <MessageCard key={message.id} message={message} currentUser={user!} />
            ))
          )}
        </div>

        {/* Load More Button */}
        {messagesData && messagesData.messages.length > 0 && messagesData.messages.length < messagesData.totalCount && (
          <div className="text-center mt-8">
            <button 
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg border border-gray-600 transition-colors"
              data-testid="button-load-more"
            >
              <i className="fas fa-chevron-down mr-2"></i>
              Load More Messages
            </button>
          </div>
        )}
      </div>

      <DeleteConfirmModal />
    </div>
  );
}
