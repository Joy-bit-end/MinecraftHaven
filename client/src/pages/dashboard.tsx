import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Users, DollarSign, TrendingUp, Settings, Play } from "lucide-react";
import { Link } from "wouter";
import type { MinecraftServer } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: servers = [], isLoading: serversLoading, error } = useQuery({
    queryKey: ["/api/servers"],
    retry: false,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  if (isLoading || serversLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const activeServers = servers.filter((server: MinecraftServer) => server.status === 'online').length;
  const totalPlayers = servers.reduce((sum: number, server: MinecraftServer) => {
    // Mock player count based on server status
    return sum + (server.status === 'online' ? Math.floor(Math.random() * (server.maxPlayers || 20)) : 0);
  }, 0);
  const monthlySpend = servers.length * 9; // Mock calculation
  const uptime = 99.8; // Mock uptime

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'server-status-online';
      case 'offline':
        return 'server-status-offline';
      case 'starting':
        return 'server-status-starting';
      case 'stopping':
        return 'server-status-stopping';
      default:
        return 'server-status-offline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>;
      case 'offline':
        return <div className="w-3 h-3 bg-red-400 rounded-full"></div>;
      case 'starting':
        return <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>;
      case 'stopping':
        return <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>;
      default:
        return <div className="w-3 h-3 bg-red-400 rounded-full"></div>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
          <p className="text-slate-400">Here's an overview of your servers and account</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Servers</p>
                  <p className="text-2xl font-bold text-white">{activeServers}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Server className="text-white h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Players</p>
                  <p className="text-2xl font-bold text-white">{totalPlayers}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Users className="text-white h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Monthly Spend</p>
                  <p className="text-2xl font-bold text-white">${monthlySpend}</p>
                </div>
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-white h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Uptime</p>
                  <p className="text-2xl font-bold text-white">{uptime}%</p>
                </div>
                <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Server List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white">Your Servers</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {servers.length === 0 ? (
              <div className="text-center py-8">
                <Server className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No servers yet</h3>
                <p className="text-slate-400 mb-4">Create your first Minecraft server to get started</p>
                <Link href="/create-server">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Create Server
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {servers.map((server: MinecraftServer) => (
                  <div key={server.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Server className="text-white h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{server.name}</h3>
                        <p className="text-slate-400 text-sm">{server.subdomain}.blockcraft.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(server.status)}
                          <Badge className={`${getStatusColor(server.status)} capitalize`}>
                            {server.status}
                          </Badge>
                        </div>
                        <div className="text-slate-400 text-sm">
                          {server.status === 'online' ? `${Math.floor(Math.random() * server.maxPlayers)}/${server.maxPlayers}` : `0/${server.maxPlayers}`} players
                        </div>
                      </div>
                      <Link href={`/servers/${server.id}`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
