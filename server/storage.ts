import {
  users,
  serverPlans,
  minecraftServers,
  serverSubscriptions,
  billingHistory,
  type User,
  type UpsertUser,
  type ServerPlan,
  type InsertServerPlan,
  type MinecraftServer,
  type InsertMinecraftServer,
  type ServerSubscription,
  type InsertServerSubscription,
  type BillingHistory,
  type InsertBillingHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Server plan operations
  getServerPlans(): Promise<ServerPlan[]>;
  getServerPlan(id: number): Promise<ServerPlan | undefined>;
  createServerPlan(plan: InsertServerPlan): Promise<ServerPlan>;
  
  // Minecraft server operations
  getUserServers(userId: string): Promise<MinecraftServer[]>;
  getServer(id: number): Promise<MinecraftServer | undefined>;
  createServer(server: InsertMinecraftServer): Promise<MinecraftServer>;
  updateServer(id: number, updates: Partial<InsertMinecraftServer>): Promise<MinecraftServer>;
  deleteServer(id: number): Promise<void>;
  
  // Auto-stop system operations
  renewServerTime(serverId: number, userId: string): Promise<MinecraftServer>;
  updateServerPing(serverId: number, playersOnline: number): Promise<void>;
  getServersForAutoStop(): Promise<MinecraftServer[]>;
  
  // Subscription operations
  getUserSubscriptions(userId: string): Promise<ServerSubscription[]>;
  createSubscription(subscription: InsertServerSubscription): Promise<ServerSubscription>;
  updateSubscription(id: number, updates: Partial<InsertServerSubscription>): Promise<ServerSubscription>;
  
  // Billing operations
  getUserBillingHistory(userId: string): Promise<BillingHistory[]>;
  createBillingRecord(record: InsertBillingHistory): Promise<BillingHistory>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
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

  // Server plan operations
  async getServerPlans(): Promise<ServerPlan[]> {
    return await db.select().from(serverPlans).where(eq(serverPlans.isActive, true));
  }

  async getServerPlan(id: number): Promise<ServerPlan | undefined> {
    const [plan] = await db.select().from(serverPlans).where(eq(serverPlans.id, id));
    return plan;
  }

  async createServerPlan(plan: InsertServerPlan): Promise<ServerPlan> {
    const [createdPlan] = await db.insert(serverPlans).values(plan).returning();
    return createdPlan;
  }

  // Minecraft server operations
  async getUserServers(userId: string): Promise<MinecraftServer[]> {
    return await db
      .select()
      .from(minecraftServers)
      .where(eq(minecraftServers.userId, userId))
      .orderBy(desc(minecraftServers.createdAt));
  }

  async getServer(id: number): Promise<MinecraftServer | undefined> {
    const [server] = await db.select().from(minecraftServers).where(eq(minecraftServers.id, id));
    return server;
  }

  async createServer(server: InsertMinecraftServer): Promise<MinecraftServer> {
    const [createdServer] = await db.insert(minecraftServers).values(server).returning();
    return createdServer;
  }

  async updateServer(id: number, updates: Partial<InsertMinecraftServer>): Promise<MinecraftServer> {
    const [updatedServer] = await db
      .update(minecraftServers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(minecraftServers.id, id))
      .returning();
    return updatedServer;
  }

  async deleteServer(id: number): Promise<void> {
    await db.delete(minecraftServers).where(eq(minecraftServers.id, id));
  }

  // Auto-stop system operations
  async renewServerTime(serverId: number, userId: string): Promise<MinecraftServer> {
    const server = await this.getServer(serverId);
    if (!server || server.userId !== userId) {
      throw new Error("Server not found or access denied");
    }

    const [updatedServer] = await db
      .update(minecraftServers)
      .set({
        offlineTimeUsed: 0,
        startTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(minecraftServers.id, serverId))
      .returning();
    
    return updatedServer;
  }

  async updateServerPing(serverId: number, playersOnline: number): Promise<void> {
    await db
      .update(minecraftServers)
      .set({
        playersOnline,
        lastPingTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(minecraftServers.id, serverId));
  }

  async getServersForAutoStop(): Promise<MinecraftServer[]> {
    return await db
      .select()
      .from(minecraftServers)
      .where(
        and(
          eq(minecraftServers.status, 'online'),
          eq(minecraftServers.autoStopEnabled, true)
        )
      );
  }

  // Subscription operations
  async getUserSubscriptions(userId: string): Promise<ServerSubscription[]> {
    return await db
      .select()
      .from(serverSubscriptions)
      .where(eq(serverSubscriptions.userId, userId))
      .orderBy(desc(serverSubscriptions.createdAt));
  }

  async createSubscription(subscription: InsertServerSubscription): Promise<ServerSubscription> {
    const [createdSubscription] = await db.insert(serverSubscriptions).values(subscription).returning();
    return createdSubscription;
  }

  async updateSubscription(id: number, updates: Partial<InsertServerSubscription>): Promise<ServerSubscription> {
    const [updatedSubscription] = await db
      .update(serverSubscriptions)
      .set(updates)
      .where(eq(serverSubscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  // Billing operations
  async getUserBillingHistory(userId: string): Promise<BillingHistory[]> {
    return await db
      .select()
      .from(billingHistory)
      .where(eq(billingHistory.userId, userId))
      .orderBy(desc(billingHistory.createdAt));
  }

  async createBillingRecord(record: InsertBillingHistory): Promise<BillingHistory> {
    const [createdRecord] = await db.insert(billingHistory).values(record).returning();
    return createdRecord;
  }
}

export const storage = new DatabaseStorage();
