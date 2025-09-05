import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBadgeInfo } from "@/lib/badges";
import { User2, Mail, Calendar, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    passwordHint: user?.passwordHint || "",
    avatarUrl: user?.avatarUrl || "",
  });

  const badgeInfo = user ? getBadgeInfo(user.postCount || 0) : null;

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { email: string; firstName: string; lastName: string; passwordHint: string; }) => {
      const res = await apiRequest("PUT", "/api/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const res = await apiRequest("POST", "/api/profile/avatar", { imageUrl });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Avatar updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Update local state with new avatar
      if (data.user) {
        setProfileData(prev => ({ ...prev, avatarUrl: data.user.avatarUrl || "" }));
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to update avatar",
        variant: "destructive",
      });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Only update profile data, not avatar
    const profileUpdateData = {
      email: profileData.email,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      passwordHint: profileData.passwordHint,
    };
    updateProfileMutation.mutate(profileUpdateData);
  };

  const handleCancel = () => {
    setProfileData({
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      passwordHint: user?.passwordHint || "",
      avatarUrl: user?.avatarUrl || "",
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    const avatarUrl = profileData.avatarUrl.trim();
    if (!avatarUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }
    uploadAvatarMutation.mutate(avatarUrl);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark text-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-400">Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center">
              <User2 className="mr-3 h-8 w-8 text-blue-500" />
              My Profile
            </h1>
            <p className="text-gray-400 mt-2">Manage your account information and settings</p>
          </div>

          {/* Profile Overview */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={`${user.username}'s avatar`}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                      onError={(e) => {
                        // Fallback to initial if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mr-4 ${user.avatarUrl ? 'hidden' : ''}`}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" data-testid="text-profile-username">
                      {user.username}
                    </h2>
                    <div className="flex items-center mt-1">
                      {badgeInfo && (
                        <>
                          <i className={`${badgeInfo.icon} mr-2 ${badgeInfo.className}`}></i>
                          <span className="text-sm text-gray-400">{badgeInfo.title}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                  data-testid="button-edit-profile"
                >
                  <i className="fas fa-edit mr-2"></i>
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Basic Information</h3>
                  
                  {isEditing ? (
                    <form onSubmit={handleSave} className="space-y-4">
                      <div>
                        <Label htmlFor="email" className="text-gray-300">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          data-testid="input-profile-email"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="firstName" className="text-gray-300">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          data-testid="input-profile-firstname"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName" className="text-gray-300">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          data-testid="input-profile-lastname"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="passwordHint" className="text-gray-300">
                          Password Hint
                        </Label>
                        <Input
                          id="passwordHint"
                          type="text"
                          value={profileData.passwordHint}
                          onChange={(e) => setProfileData(prev => ({ ...prev, passwordHint: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="A hint to help you remember your password"
                          data-testid="input-profile-passwordhint"
                        />
                        <p className="text-xs text-gray-400 mt-1">This is private and only visible to you</p>
                      </div>

                      <div>
                        <Label htmlFor="avatarUrl" className="text-gray-300">
                          Avatar Image URL
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            id="avatarUrl"
                            type="url"
                            value={profileData.avatarUrl}
                            onChange={(e) => setProfileData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                            className="bg-gray-700 border-gray-600 text-white flex-1"
                            placeholder="https://example.com/image.jpg"
                            data-testid="input-avatar-url"
                          />
                          <Button
                            type="button"
                            onClick={handleAvatarUpload}
                            disabled={uploadAvatarMutation.isPending || !profileData.avatarUrl.trim()}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid="button-upload-avatar"
                          >
                            {uploadAvatarMutation.isPending ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Enter a direct link to an image. Supported formats: JPEG, PNG, WebP, GIF
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                          data-testid="button-save-profile"
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          data-testid="button-cancel-edit"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-300">{user.email || "No email provided"}</span>
                      </div>
                      <div className="flex items-center">
                        <User2 className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-300">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : "Name not provided"
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-300">
                          Joined {user.dateJoined ? formatDistanceToNow(new Date(user.dateJoined), { addSuffix: true }) : 'recently'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-key w-5 h-5 text-gray-400 mr-3"></i>
                        <span className="text-gray-300">
                          Password Hint: {user.passwordHint || "Not set"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Activity Stats */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Activity Stats</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <i className="fas fa-comments text-blue-500 mr-3"></i>
                          <span className="text-gray-300">Total Posts</span>
                        </div>
                        <span className="font-bold text-xl" data-testid="text-post-count">
                          {user.postCount || 0}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Trophy className="text-yellow-500 mr-3" />
                          <span className="text-gray-300">Current Badge</span>
                        </div>
                        <div className="text-right">
                          {badgeInfo && (
                            <div className="flex items-center">
                              <i className={`${badgeInfo.icon} mr-2 ${badgeInfo.className}`}></i>
                              <span className="font-semibold">{badgeInfo.title}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Show progress to next badge level */}
                      {(user.postCount || 0) < 50 && (
                        <div className="mt-2 text-sm text-gray-400">
                          {(user.postCount || 0) < 5 ? `${5 - (user.postCount || 0)} more posts to reach Active Member` :
                           (user.postCount || 0) < 10 ? `${10 - (user.postCount || 0)} more posts to reach Bronze Contributor` :
                           (user.postCount || 0) < 25 ? `${25 - (user.postCount || 0)} more posts to reach Silver Contributor` :
                           `${50 - (user.postCount || 0)} more posts to reach Gold Contributor`}
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <i className="fas fa-shield-alt text-green-500 mr-3"></i>
                          <span className="text-gray-300">Account Status</span>
                        </div>
                        <span className="font-semibold text-green-400">
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {user.role === 1 && (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <i className="fas fa-crown text-yellow-500 mr-3"></i>
                            <span className="text-gray-300">Role</span>
                          </div>
                          <span className="font-semibold text-yellow-400">Administrator</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}