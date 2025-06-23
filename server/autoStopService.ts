import { storage } from "./storage";

class AutoStopService {
  private interval: NodeJS.Timeout | null = null;
  private readonly OFFLINE_TIME_LIMIT = 60; // 60 minutes
  private readonly CHECK_INTERVAL = 60000; // 1 minute

  start() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    console.log("[AutoStop] Service started - checking every minute");
    
    this.interval = setInterval(async () => {
      await this.checkServers();
    }, this.CHECK_INTERVAL);

    // Run initial check
    this.checkServers();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log("[AutoStop] Service stopped");
    }
  }

  private async checkServers() {
    try {
      const servers = await storage.getServersForAutoStop();
      
      for (const server of servers) {
        await this.processServer(server);
      }
    } catch (error) {
      console.error("[AutoStop] Error checking servers:", error);
    }
  }

  private async processServer(server: any) {
    const now = new Date();
    const lastPing = server.lastPingTime ? new Date(server.lastPingTime) : new Date(server.startTime || now);
    const timeSinceLastPing = Math.floor((now.getTime() - lastPing.getTime()) / (1000 * 60)); // minutes

    // Update server ping with mock player data
    const mockPlayersOnline = server.playersOnline || Math.floor(Math.random() * (server.maxPlayers || 20));
    await storage.updateServerPing(server.id, mockPlayersOnline);

    // If no players online, accumulate offline time
    if (mockPlayersOnline === 0) {
      const newOfflineTime = (server.offlineTimeUsed || 0) + 1;
      
      await storage.updateServer(server.id, {
        offlineTimeUsed: newOfflineTime,
      });

      console.log(`[AutoStop] Server ${server.name} (ID: ${server.id}) - Offline time: ${newOfflineTime}/${this.OFFLINE_TIME_LIMIT} minutes`);

      // Auto-stop if limit reached
      if (newOfflineTime >= this.OFFLINE_TIME_LIMIT) {
        await this.autoStopServer(server);
      }
    } else {
      console.log(`[AutoStop] Server ${server.name} (ID: ${server.id}) - ${mockPlayersOnline} players online, skipping offline time`);
    }
  }

  private async autoStopServer(server: any) {
    try {
      await storage.updateServer(server.id, {
        status: 'offline',
        offlineTimeUsed: 0,
      });

      console.log(`[AutoStop] Server ${server.name} (ID: ${server.id}) automatically stopped after ${this.OFFLINE_TIME_LIMIT} minutes of offline time`);
    } catch (error) {
      console.error(`[AutoStop] Error stopping server ${server.id}:`, error);
    }
  }
}

export const autoStopService = new AutoStopService();