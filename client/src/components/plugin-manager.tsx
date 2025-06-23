import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Home, Plus, Search, Settings, Download, Trash2 } from "lucide-react";

interface PluginManagerProps {
  serverId: number;
}

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  status: "active" | "inactive";
  icon: any;
  color: string;
}

export default function PluginManager({ serverId }: PluginManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"installed" | "browse">("installed");

  // Mock installed plugins
  const installedPlugins: Plugin[] = [
    {
      id: "worldguard",
      name: "WorldGuard",
      version: "7.0.8",
      description: "World protection plugin",
      status: "active",
      icon: Shield,
      color: "bg-emerald-600"
    },
    {
      id: "essentialsx",
      name: "EssentialsX",
      version: "2.20.1",
      description: "Essential commands and features",
      status: "active",
      icon: Home,
      color: "bg-purple-600"
    },
  ];

  // Mock available plugins
  const availablePlugins: Plugin[] = [
    {
      id: "worldedit",
      name: "WorldEdit",
      version: "7.2.15",
      description: "In-game map editor for builders",
      status: "inactive",
      icon: Settings,
      color: "bg-blue-600"
    },
    {
      id: "vault",
      name: "Vault",
      version: "1.7.3",
      description: "Economy API for other plugins",
      status: "inactive",
      icon: Shield,
      color: "bg-amber-600"
    },
  ];

  const currentPlugins = activeTab === "installed" ? installedPlugins : availablePlugins;
  const filteredPlugins = currentPlugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTogglePlugin = (pluginId: string) => {
    // Mock plugin toggle - in real app, this would make an API call
    console.log(`Toggling plugin: ${pluginId}`);
  };

  const handleInstallPlugin = (pluginId: string) => {
    // Mock plugin installation - in real app, this would make an API call
    console.log(`Installing plugin: ${pluginId}`);
  };

  const handleUninstallPlugin = (pluginId: string) => {
    // Mock plugin uninstallation - in real app, this would make an API call
    console.log(`Uninstalling plugin: ${pluginId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("installed")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "installed"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Installed Plugins
            </button>
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "browse"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Browse Plugins
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search plugins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white w-64"
            />
          </div>
          {activeTab === "installed" && (
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Install Plugin
            </Button>
          )}
        </div>
      </div>

      {/* Plugin List */}
      <div className="grid gap-4">
        {filteredPlugins.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400 mb-4">
              {activeTab === "installed" ? "No plugins installed" : "No plugins found"}
            </div>
            {activeTab === "installed" && (
              <Button
                onClick={() => setActiveTab("browse")}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Plugins
              </Button>
            )}
          </div>
        ) : (
          filteredPlugins.map((plugin) => (
            <Card key={plugin.id} className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${plugin.color} rounded-lg flex items-center justify-center`}>
                      <plugin.icon className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{plugin.name}</h3>
                      <p className="text-slate-400 text-sm">v{plugin.version} - {plugin.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {activeTab === "installed" ? (
                      <>
                        <Badge className={plugin.status === "active" ? "bg-emerald-600" : "bg-slate-600"}>
                          {plugin.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePlugin(plugin.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUninstallPlugin(plugin.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleInstallPlugin(plugin.id)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Install
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
