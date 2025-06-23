import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Server plans table
export const serverPlans = pgTable("server_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  ram: integer("ram").notNull(), // RAM in GB
  storage: integer("storage").notNull(), // Storage in GB
  maxPlayers: integer("max_players"),
  features: text("features").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Minecraft servers table
export const minecraftServers = pgTable("minecraft_servers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => serverPlans.id),
  name: varchar("name").notNull(),
  subdomain: varchar("subdomain").unique().notNull(),
  version: varchar("version").notNull(),
  region: varchar("region").notNull(),
  serverType: varchar("server_type").notNull(), // 'bedrock' or 'java'
  gameMode: varchar("game_mode").default("survival"),
  difficulty: varchar("difficulty").default("normal"),
  maxPlayers: integer("max_players").default(20),
  pvpEnabled: boolean("pvp_enabled").default(true),
  commandBlocksEnabled: boolean("command_blocks_enabled").default(false),
  generateStructures: boolean("generate_structures").default(true),
  status: varchar("status").default("offline"), // 'online', 'offline', 'starting', 'stopping'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Server subscriptions table
export const serverSubscriptions = pgTable("server_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  serverId: integer("server_id").notNull().references(() => minecraftServers.id),
  planId: integer("plan_id").notNull().references(() => serverPlans.id),
  status: varchar("status").default("active"), // 'active', 'cancelled', 'expired'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Billing history table
export const billingHistory = pgTable("billing_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  subscriptionId: integer("subscription_id").references(() => serverSubscriptions.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status").default("paid"), // 'paid', 'pending', 'failed'
  paymentMethod: varchar("payment_method"),
  transactionId: varchar("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertServerPlanSchema = createInsertSchema(serverPlans).omit({
  id: true,
  createdAt: true,
});
export type InsertServerPlan = z.infer<typeof insertServerPlanSchema>;
export type ServerPlan = typeof serverPlans.$inferSelect;

export const insertMinecraftServerSchema = createInsertSchema(minecraftServers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMinecraftServer = z.infer<typeof insertMinecraftServerSchema>;
export type MinecraftServer = typeof minecraftServers.$inferSelect;

export const insertServerSubscriptionSchema = createInsertSchema(serverSubscriptions).omit({
  id: true,
  createdAt: true,
});
export type InsertServerSubscription = z.infer<typeof insertServerSubscriptionSchema>;
export type ServerSubscription = typeof serverSubscriptions.$inferSelect;

export const insertBillingHistorySchema = createInsertSchema(billingHistory).omit({
  id: true,
  createdAt: true,
});
export type InsertBillingHistory = z.infer<typeof insertBillingHistorySchema>;
export type BillingHistory = typeof billingHistory.$inferSelect;
