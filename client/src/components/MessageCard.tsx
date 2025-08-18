import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { getBadgeInfo } from "@/lib/badges";
import type { MessageWithUser, User } from "@shared/schema";

interface MessageCardProps {
  message: MessageWithUser;
  currentUser: User;
}

export default function MessageCard({ message, currentUser }: MessageCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const badgeInfo = getBadgeInfo(message.user.postCount || 0);
  
  const canDelete = message.userId === currentUser.id || currentUser.role === 1;
  const isAuthor = message.userId === currentUser.id;

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  return (
    <>
      <div 
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 hover:transform hover:-translate-y-1 transition-all duration-200 shadow-lg hover:shadow-xl"
        data-testid={`card-message-${message.id}`}
      >
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
            {message.user.avatarUrl || message.user.profileImageUrl ? (
              <img 
                src={message.user.avatarUrl || message.user.profileImageUrl} 
                alt="User avatar" 
                className="w-full h-full rounded-full object-cover"
                data-testid={`img-avatar-${message.id}`}
              />
            ) : (
              <i className="fas fa-user text-gray-300"></i>
            )}
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h6 
                  className="font-semibold text-white"
                  data-testid={`text-username-${message.id}`}
                >
                  {message.user.username}
                </h6>
                
                {message.user.role === 1 && (
                  <span 
                    className="px-2 py-1 text-xs bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"
                    title="Administrator"
                    data-testid={`badge-admin-${message.id}`}
                  >
                    Admin
                  </span>
                )}
                
                {badgeInfo && (
                  <span 
                    className={badgeInfo.className} 
                    title={badgeInfo.title}
                    data-testid={`badge-tier-${message.id}`}
                  >
                    <i className={badgeInfo.icon}></i>
                  </span>
                )}
              </div>
              
              <small 
                className="text-gray-400"
                data-testid={`text-timestamp-${message.id}`}
              >
                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
              </small>
            </div>
            
            <p 
              className="text-gray-300 mb-3"
              data-testid={`text-content-${message.id}`}
            >
              {message.content}
            </p>
            
            <div className="flex items-center justify-between">
              <small 
                className="text-gray-500 flex items-center"
                data-testid={`text-full-timestamp-${message.id}`}
              >
                <i className="fas fa-clock mr-1"></i>
                {format(new Date(message.timestamp), 'MMMM d, yyyy \'at\' h:mm a')}
              </small>
              
              {canDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded transition-colors"
                  title={isAuthor ? "Delete your message" : "Delete message (Admin)"}
                  data-testid={`button-delete-${message.id}`}
                >
                  <i className="fas fa-trash text-sm"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center mb-4">
              <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
              <h3 className="text-lg font-semibold text-white">Confirm Delete</h3>
            </div>
            
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            
            <div className="bg-gray-900 p-3 rounded mb-4">
              <p className="text-gray-400 text-sm">{message.content}</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
                data-testid="button-cancel-delete"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement delete functionality
                  setShowDeleteModal(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                data-testid="button-confirm-delete"
              >
                <i className="fas fa-trash mr-2"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
