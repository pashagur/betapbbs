import {
  users,
  messages,
  type User,
  type UpsertUser,
  type InsertUser,
  type Message,
  type InsertMessage,
  type MessageWithUser,
  type UpdateProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Authentication operations
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPostCount(userId: string, increment: number): Promise<void>;
  
  // Message operations
  getMessages(limit?: number, offset?: number): Promise<MessageWithUser[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(messageId: number, userId: string): Promise<boolean>;
  getMessageCount(): Promise<number>;
  
  // Profile operations
  updateUserProfile(userId: string, data: UpdateProfile): Promise<void>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>;
  updateUserAvatar(userId: string, avatarUrl: string): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: number): Promise<void>;
  deleteUser(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        username: userData.username || `user_${Date.now()}`,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Authentication operations
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.passwordHash!, 12);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        passwordHash: hashedPassword,
        dateJoined: new Date(),
        isActive: true,
        postCount: 0,
        role: 0,
      })
      .returning();
    return user;
  }

  async updateUserPostCount(userId: string, increment: number): Promise<void> {
    await db
      .update(users)
      .set({
        postCount: sql`${users.postCount} + ${increment}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Message operations
  async getMessages(limit: number = 20, offset: number = 0): Promise<MessageWithUser[]> {
    const result = await db
      .select()
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .orderBy(desc(messages.timestamp))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.messages,
      user: row.users!,
    }));
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    
    // Increment user post count
    await this.updateUserPostCount(messageData.userId, 1);
    
    return message;
  }

  async deleteMessage(messageId: number, userId: string): Promise<boolean> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));

    if (!message) return false;

    // Check if user owns the message or is admin
    const user = await this.getUser(userId);
    if (!user) return false;

    const canDelete = message.userId === userId || user.role === 1;
    if (!canDelete) return false;

    await db.delete(messages).where(eq(messages.id, messageId));
    
    // Decrement post count if user is deleting their own message
    if (message.userId === userId) {
      await this.updateUserPostCount(userId, -1);
    }
    
    return true;
  }

  async getMessageCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(messages);
    return result.count;
  }

  // Profile operations
  async updateUserProfile(userId: string, data: UpdateProfile): Promise<void> {
    await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
    await db
      .update(users)
      .set({
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.passwordHash) {
      return false;
    }

    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidCurrentPassword) {
      return false;
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    await db
      .update(users)
      .set({
        passwordHash: newHashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    return true;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.dateJoined));
  }

  async updateUserRole(userId: string, role: number): Promise<void> {
    await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete user's messages first
    await db.delete(messages).where(eq(messages.userId, userId));
    // Delete user
    await db.delete(users).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
