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
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings, Lock, Bell, Trash2, Shield } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newMessageAlerts: true,
    weeklyDigest: false,
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      const res = await apiRequest("PUT", "/api/change-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully!",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/account");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      queryClient.setQueryData(["/api/user"], null);
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark text-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-400">Please log in to access settings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center">
              <Settings className="mr-3 h-8 w-8 text-blue-500" />
              Settings
            </h1>
            <p className="text-gray-400 mt-2">Manage your account preferences and security</p>
          </div>

          <div className="space-y-6">
            {/* Security Settings */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-3 h-6 w-6 text-green-500" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-gray-300">
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      data-testid="input-current-password"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword" className="text-gray-300">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      data-testid="input-new-password"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-300">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      data-testid="input-confirm-new-password"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-change-password"
                  >
                    {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-3 h-6 w-6 text-yellow-500" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300 font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-400">Receive email updates about your account</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                    data-testid="switch-email-notifications"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300 font-medium">New Message Alerts</Label>
                    <p className="text-sm text-gray-400">Get notified when someone replies to your messages</p>
                  </div>
                  <Switch
                    checked={notificationSettings.newMessageAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, newMessageAlerts: checked }))
                    }
                    data-testid="switch-message-alerts"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300 font-medium">Weekly Digest</Label>
                    <p className="text-sm text-gray-400">Receive a weekly summary of community activity</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyDigest}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, weeklyDigest: checked }))
                    }
                    data-testid="switch-weekly-digest"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-3 h-6 w-6 text-blue-500" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 font-medium">Username</Label>
                    <p className="text-gray-400" data-testid="text-settings-username">{user.username}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300 font-medium">Email</Label>
                    <p className="text-gray-400" data-testid="text-settings-email">{user.email || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300 font-medium">Account Status</Label>
                    <p className="text-green-400">Active</p>
                  </div>
                  <div>
                    <Label className="text-gray-300 font-medium">Role</Label>
                    <p className="text-gray-400">{user.role === 1 ? "Administrator" : "User"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-red-900/20 border-red-500/50">
              <CardHeader>
                <CardTitle className="flex items-center text-red-400">
                  <Trash2 className="mr-3 h-6 w-6" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Delete Account</h3>
                    <p className="text-gray-400 mb-4">
                      Once you delete your account, there is no going back. This action cannot be undone.
                      All your messages and data will be permanently removed.
                    </p>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                          data-testid="button-delete-account-trigger"
                        >
                          Delete My Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-400">
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300">
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers. Type your username "{user.username}" to confirm.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white" data-testid="button-cancel-delete">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAccountMutation.mutate()}
                            disabled={deleteAccountMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                            data-testid="button-confirm-delete"
                          >
                            {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}