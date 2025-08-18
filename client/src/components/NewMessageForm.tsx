import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function NewMessageForm() {
  const [content, setContent] = useState("");
  const [charCount, setCharCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string }) => {
      await apiRequest("POST", "/api/messages", messageData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message posted successfully!",
        variant: "default",
      });
      setContent("");
      setCharCount(0);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
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
        description: "Failed to post message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setContent(value);
      setCharCount(value.length);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Message content is required.",
        variant: "destructive",
      });
      return;
    }

    if (content.length > 500) {
      toast({
        title: "Error",
        description: "Message is too long (max 500 characters).",
        variant: "destructive",
      });
      return;
    }

    createMessageMutation.mutate({ content: content.trim() });
  };

  const getCharCountColor = () => {
    if (charCount > 450) return "text-red-400";
    if (charCount > 400) return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <div className="mb-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <i className="fas fa-plus-circle text-blue-500 mr-2"></i>
          <h3 className="text-lg font-semibold text-white">Post a Message</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="messageContent" className="block text-sm font-medium text-gray-300 mb-2">
              Your Message
            </label>
            <textarea
              id="messageContent"
              rows={4}
              maxLength={500}
              placeholder="Share your thoughts with the community..."
              value={content}
              onChange={handleContentChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              data-testid="textarea-message-content"
            />
            
            <div className="flex items-center justify-between mt-2">
              <div className={`text-sm ${getCharCountColor()}`}>
                <span data-testid="text-char-count">{charCount}</span> / 500 characters
              </div>
              
              <button
                type="submit"
                disabled={createMessageMutation.isPending || !content.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center"
                data-testid="button-post-message"
              >
                {createMessageMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Post Message
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
