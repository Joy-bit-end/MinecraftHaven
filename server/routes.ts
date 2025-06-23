import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertMinecraftServerSchema,
  insertServerPlanSchema,
  insertServerSubscriptionSchema,
  insertBillingHistorySchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Initialize server plans if empty
  const initializeServerPlans = async () => {
    try {
      const existingPlans = await storage.getServerPlans();
      if (existingPlans.length === 0) {
        const defaultPlans = [
          {
            name: "Free",
            description: "Basic Minecraft server hosting with auto-stop after 60 minutes of inactivity",
            price: 0,
            maxPlayers: 10,
            ramGB: 1,
            storageGB: 5,
            features: ["1GB RAM", "10 Players", "5GB Storage", "Auto-stop after 60min idle", "Community Support"]
          },
          {
            name: "Starter",
            description: "Perfect for small communities with friends",
            price: 5.99,
            maxPlayers: 20,
            ramGB: 2,
            storageGB: 10,
            features: ["2GB RAM", "20 Players", "10GB Storage", "No Auto-stop", "Priority Support", "Plugin Support"]
          },
          {
            name: "Premium",
            description: "Great for active communities and content creators",
            price: 14.99,
            maxPlayers: 50,
            ramGB: 4,
            storageGB: 25,
            features: ["4GB RAM", "50 Players", "25GB Storage", "No Auto-stop", "24/7 Support", "Full Plugin Access", "Custom Branding"]
          }
        ];

        for (const plan of defaultPlans) {
          await storage.createServerPlan(plan);
        }
        console.log("Default server plans initialized");
      }
    } catch (error) {
      console.error("Error initializing server plans:", error);
    }
  };

  // Initialize plans on startup
  await initializeServerPlans();

  // Server plans routes
  app.get('/api/server-plans', async (req, res) => {
    try {
      const plans = await storage.getServerPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching server plans:", error);
      res.status(500).json({ message: "Failed to fetch server plans" });
    }
  });

  app.post('/api/server-plans', isAuthenticated, async (req, res) => {
    try {
      const planData = insertServerPlanSchema.parse(req.body);
      const plan = await storage.createServerPlan(planData);
      res.json(plan);
    } catch (error) {
      console.error("Error creating server plan:", error);
      res.status(500).json({ message: "Failed to create server plan" });
    }
  });

  // Minecraft servers routes
  app.get('/api/servers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const servers = await storage.getUserServers(userId);
      res.json(servers);
    } catch (error) {
      console.error("Error fetching servers:", error);
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });

  app.get('/api/servers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const serverId = parseInt(req.params.id);
      const server = await storage.getServer(serverId);
      
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }

      // Check if user owns this server
      if (server.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(server);
    } catch (error) {
      console.error("Error fetching server:", error);
      res.status(500).json({ message: "Failed to fetch server" });
    }
  });

  app.post('/api/servers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const serverData = insertMinecraftServerSchema.parse({
        ...req.body,
        userId,
        subdomain: req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        startTime: new Date(),
        offlineTimeUsed: 0,
        playersOnline: 0,
        autoStopEnabled: req.body.planId === 1, // Only enable for Free plan (ID: 1)
      });
      
      const server = await storage.createServer(serverData);
      
      // Create subscription record
      const subscription = await storage.createSubscription({
        userId,
        serverId: server.id,
        planId: serverData.planId,
        status: 'active',
        autoRenew: true,
      });

      res.json({ server, subscription });
    } catch (error) {
      console.error("Error creating server:", error);
      res.status(500).json({ message: "Failed to create server" });
    }
  });

  app.patch('/api/servers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const serverId = parseInt(req.params.id);
      const server = await storage.getServer(serverId);
      
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }

      // Check if user owns this server
      if (server.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = req.body;
      const updatedServer = await storage.updateServer(serverId, updates);
      res.json(updatedServer);
    } catch (error) {
      console.error("Error updating server:", error);
      res.status(500).json({ message: "Failed to update server" });
    }
  });

  app.delete('/api/servers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const serverId = parseInt(req.params.id);
      const server = await storage.getServer(serverId);
      
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }

      // Check if user owns this server
      if (server.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteServer(serverId);
      res.json({ message: "Server deleted successfully" });
    } catch (error) {
      console.error("Error deleting server:", error);
      res.status(500).json({ message: "Failed to delete server" });
    }
  });

  // Server actions (mocked for MVP)
  app.post('/api/servers/:id/start', isAuthenticated, async (req: any, res) => {
    try {
      const serverId = parseInt(req.params.id);
      const server = await storage.getServer(serverId);
      
      if (!server || server.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Server not found" });
      }

      // Get server plan to check if premium
      const plan = await storage.getServerPlan(server.planId);
      const isPremium = plan && plan.name !== "Free";

      // Mock server start with auto-stop settings
      await storage.updateServer(serverId, { 
        status: 'online',
        startTime: new Date(),
        offlineTimeUsed: 0,
        lastPingTime: new Date(),
        playersOnline: 0,
        autoStopEnabled: !isPremium // Only enable auto-stop for non-premium users
      });
      
      res.json({ message: "Server started successfully" });
    } catch (error) {
      console.error("Error starting server:", error);
      res.status(500).json({ message: "Failed to start server" });
    }
  });

  app.post('/api/servers/:id/stop', isAuthenticated, async (req: any, res) => {
    try {
      const serverId = parseInt(req.params.id);
      const server = await storage.getServer(serverId);
      
      if (!server || server.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Server not found" });
      }

      // Mock server stop
      await storage.updateServer(serverId, { status: 'offline' });
      res.json({ message: "Server stopped successfully" });
    } catch (error) {
      console.error("Error stopping server:", error);
      res.status(500).json({ message: "Failed to stop server" });
    }
  });

  app.post('/api/servers/:id/restart', isAuthenticated, async (req: any, res) => {
    try {
      const serverId = parseInt(req.params.id);
      const server = await storage.getServer(serverId);
      
      if (!server || server.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Server not found" });
      }

      // Mock server restart
      await storage.updateServer(serverId, { status: 'starting' });
      setTimeout(async () => {
        await storage.updateServer(serverId, { status: 'online' });
      }, 3000);
      
      res.json({ message: "Server restarting..." });
    } catch (error) {
      console.error("Error restarting server:", error);
      res.status(500).json({ message: "Failed to restart server" });
    }
  });

  // Server renew route (for auto-stop reset)
  app.post('/api/servers/:id/renew', isAuthenticated, async (req: any, res) => {
    try {
      const serverId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const server = await storage.renewServerTime(serverId, userId);
      res.json({ 
        message: "Server time renewed successfully",
        server: {
          ...server,
          offlineTimeUsed: 0,
          timeRemaining: 60
        }
      });
    } catch (error: any) {
      console.error("Error renewing server:", error);
      if (error.message === "Server not found or access denied") {
        res.status(403).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to renew server" });
      }
    }
  });

  // Billing routes
  app.get('/api/billing/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptions = await storage.getUserSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.get('/api/billing/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getUserBillingHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching billing history:", error);
      res.status(500).json({ message: "Failed to fetch billing history" });
    }
  });

  // Initialize default server plans if they don't exist
  try {
    const existingPlans = await storage.getServerPlans();
    if (existingPlans.length === 0) {
      const defaultPlans = [
        {
          name: "Free",
          price: "0.00",
          ram: 1,
          storage: 5,
          maxPlayers: 10,
          features: ["Basic Support", "5GB Storage", "10 Player Slots"],
          isActive: true,
        },
        {
          name: "Basic",
          price: "9.00",
          ram: 4,
          storage: 50,
          maxPlayers: null,
          features: ["Priority Support", "50GB Storage", "Unlimited Player Slots", "Plugin Support"],
          isActive: true,
        },
        {
          name: "Premium",
          price: "19.00",
          ram: 8,
          storage: 200,
          maxPlayers: null,
          features: ["24/7 Priority Support", "200GB Storage", "Unlimited Player Slots", "Custom Domain", "Advanced Analytics"],
          isActive: true,
        },
      ];

      for (const plan of defaultPlans) {
        await storage.createServerPlan(plan);
      }
    }
  } catch (error) {
    console.error("Error initializing default plans:", error);
  }

  const httpServer = createServer(app);
  return httpServer;
}
