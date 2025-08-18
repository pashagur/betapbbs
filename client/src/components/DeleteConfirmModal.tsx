import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface DeleteConfirmModalProps {
  messageId?: number;
  messageContent?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DeleteConfirmModal({ 
  messageId, 
  messageContent, 
  isOpen = false, 
  onClose 
}: DeleteConfirmModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/messages/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      onClose?.();
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
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (messageId) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex items-center mb-4">
          <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
          <h3 className="text-lg font-semibold text-white">Confirm Delete</h3>
        </div>
        
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete this message? This action cannot be undone.
        </p>
        
        {messageContent && (
          <div className="bg-gray-900 p-3 rounded mb-4">
            <p className="text-gray-400 text-sm">{messageContent}</p>
          </div>
        )}
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={deleteMessageMutation.isPending}
            className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
            data-testid="button-cancel-delete-modal"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMessageMutation.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
            data-testid="button-confirm-delete-modal"
          >
            {deleteMessageMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                Deleting...
              </>
            ) : (
              <>
                <i className="fas fa-trash mr-2"></i>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
