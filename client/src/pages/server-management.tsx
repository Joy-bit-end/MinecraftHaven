import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";
import ServerStats from "@/components/server-stats";
import ServerConsole from "@/components/server-console";
import FileManager from "@/components/file-manager";
import PluginManager from "@/components/plugin-manager";
import ServerSettings from "@/components/server-settings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Square, RotateCcw, Users, Cpu, HardDrive, Clock } from "lucide-react";

export default function ServerManagement() {
  const { id } = useParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("console");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const { data: server, isLoading, error } = useQuery({
    queryKey: [`/api/servers/${id}`],
    retry: false,
    enabled: !!id && !authLoading && isAuthenticated,
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

  const startServerMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/servers/${id}/start`),
    onSuccess: () => {
      toast({
        title: "Server Started",
        description: "Your server is now starting up.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${id}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to start server. Please try again.",
        variant: "destructive",
      });
    },
  });

  const stopServerMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/servers/${id}/stop`),
    onSuccess: () => {
      toast({
        title: "Server Stopped",
        description: "Your server has been stopped.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${id}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to stop server. Please try again.",
        variant: "destructive",
      });
    },
  });

  const restartServerMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/servers/${id}/restart`),
    onSuccess: () => {
      toast({
        title: "Server Restarting",
        description: "Your server is restarting. This may take a few moments.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${id}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to restart server. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!server) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-white mb-4">Server Not Found</h1>
          <p className="text-slate-400">The server you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'offline':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'starting':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'stopping':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
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

  // Mock server stats
  const mockStats = {
    playersOnline: server.status === 'online' ? Math.floor(Math.random() * server.maxPlayers) : 0,
    maxPlayers: server.maxPlayers,
    cpuUsage: server.status === 'online' ? Math.floor(Math.random() * 50) + 20 : 0,
    ramUsage: server.status === 'online' ? Math.floor(Math.random() * 3) + 1 : 0,
    ramTotal: 4, // Based on basic plan
    uptime: server.status === 'online' ? '5d 12h' : '0m',
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Server Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{server.name}</h1>
            <p className="text-slate-400">{server.subdomain}.blockcraft.com</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(server.status)}
              <Badge className={`${getStatusColor(server.status)} capitalize`}>
                {server.status}
              </Badge>
            </div>
            <Button
              onClick={() => startServerMutation.mutate()}
              disabled={server.status === 'online' || server.status === 'starting' || startServerMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
            <Button
              onClick={() => stopServerMutation.mutate()}
              disabled={server.status === 'offline' || server.status === 'stopping' || stopServerMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
            <Button
              onClick={() => restartServerMutation.mutate()}
              disabled={server.status === 'offline' || restartServerMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart
            </Button>
          </div>
        </div>

        {/* Server Stats */}
        <ServerStats stats={mockStats} />

        {/* Management Tabs */}
        <Card className="bg-slate-800/50 border-slate-700">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-slate-700">
              <TabsList className="bg-transparent h-auto p-0">
                <TabsTrigger
                  value="console"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 border-b-2 border-transparent text-slate-400 hover:text-white py-4 px-6 rounded-none"
                >
                  Console
                </TabsTrigger>
                <TabsTrigger
                  value="files"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 border-b-2 border-transparent text-slate-400 hover:text-white py-4 px-6 rounded-none"
                >
                  File Manager
                </TabsTrigger>
                <TabsTrigger
                  value="plugins"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 border-b-2 border-transparent text-slate-400 hover:text-white py-4 px-6 rounded-none"
                >
                  Plugins
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 border-b-2 border-transparent text-slate-400 hover:text-white py-4 px-6 rounded-none"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="console" className="p-6">
              <ServerConsole serverId={server.id} />
            </TabsContent>

            <TabsContent value="files" className="p-6">
              <FileManager serverId={server.id} />
            </TabsContent>

            <TabsContent value="plugins" className="p-6">
              <PluginManager serverId={server.id} />
            </TabsContent>

            <TabsContent value="settings" className="p-6">
              <ServerSettings server={server} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
}
