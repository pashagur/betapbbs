import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertMessageSchema, updateProfileSchema } from "@shared/schema";
import { z } from "zod";
import { downloadAndProcessAvatar, deleteAvatarFile } from "./avatarUtils";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Serve static avatar files
  app.use('/avatars', (req, res, next) => {
    const filename = path.basename(req.path);
    const filepath = path.join(process.cwd(), 'avatars', filename);
    
    // Basic security check
    if (!filename.match(/^[a-f0-9-_]+\.(webp|jpg|jpeg|png)$/i)) {
      return res.status(404).send('File not found');
    }
    
    res.sendFile(filepath, (err) => {
      if (err) {
        res.status(404).send('Avatar not found');
      }
    });
  });

  // Message routes
  app.get('/api/messages', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const messages = await storage.getMessages(limit, offset);
      const totalCount = await storage.getMessageCount();
      
      res.json({ messages, totalCount });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        userId,
      });

      // Validate content length
      if (messageData.content.length > 500) {
        return res.status(400).json({ message: "Message too long (max 500 characters)" });
      }

      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.delete('/api/messages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const userId = req.user.id;
      
      const success = await storage.deleteMessage(messageId, userId);
      
      if (!success) {
        return res.status(403).json({ message: "Not authorized to delete this message" });
      }
      
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== 1) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const targetUserId = req.params.id;
      const { role } = req.body;
      
      const adminUser = await storage.getUser(adminId);
      if (!adminUser || adminUser.role !== 1) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      await storage.updateUserRole(targetUserId, role);
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const targetUserId = req.params.id;
      
      const adminUser = await storage.getUser(adminId);
      if (!adminUser || adminUser.role !== 1) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Prevent admin from deleting themselves
      if (adminId === targetUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(targetUserId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Profile routes
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Validate profile data
      const profileData = updateProfileSchema.parse(req.body);
      
      await storage.updateUserProfile(userId, profileData);
      const user = await storage.getUser(userId);
      
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Avatar upload endpoint
  app.post('/api/profile/avatar', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { imageUrl } = req.body;

      if (!imageUrl || typeof imageUrl !== 'string') {
        return res.status(400).json({ message: "Image URL is required" });
      }

      // Get current user to check for existing avatar
      const currentUser = await storage.getUser(userId);
      const oldAvatarUrl = currentUser?.avatarUrl;

      // Download and process the image
      const avatarPath = await downloadAndProcessAvatar(imageUrl, userId);
      
      // Update user avatar in database
      await storage.updateUserAvatar(userId, avatarPath);
      
      // Delete old avatar file if it exists
      if (oldAvatarUrl && oldAvatarUrl !== avatarPath) {
        await deleteAvatarFile(oldAvatarUrl);
      }

      // Return updated user data
      const updatedUser = await storage.getUser(userId);
      res.json({ 
        message: "Avatar updated successfully", 
        user: updatedUser 
      });

    } catch (error) {
      console.error("Error updating avatar:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to update avatar" 
      });
    }
  });

  app.put('/api/change-password', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      const success = await storage.changePassword(userId, currentPassword, newPassword);
      if (!success) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.delete('/api/account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.deleteUser(userId);
      
      req.logout((err: any) => {
        if (err) {
          console.error("Error logging out after account deletion:", err);
        }
        res.json({ message: "Account deleted successfully" });
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
