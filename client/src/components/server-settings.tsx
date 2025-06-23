import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import type { MinecraftServer } from "@shared/schema";

interface ServerSettingsProps {
  server: MinecraftServer;
}

const serverSettingsSchema = z.object({
  name: z.string().min(1, "Server name is required").max(50, "Server name must be less than 50 characters"),
  maxPlayers: z.number().min(1, "Must have at least 1 player slot").max(500, "Maximum 500 players"),
  gameMode: z.enum(["survival", "creative", "adventure", "spectator"]),
  difficulty: z.enum(["peaceful", "easy", "normal", "hard"]),
  pvpEnabled: z.boolean(),
  commandBlocksEnabled: z.boolean(),
  generateStructures: z.boolean(),
});

type ServerSettingsForm = z.infer<typeof serverSettingsSchema>;

export default function ServerSettings({ server }: ServerSettingsProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ServerSettingsForm>({
    resolver: zodResolver(serverSettingsSchema),
    defaultValues: {
      name: server.name,
      maxPlayers: server.maxPlayers || 20,
      gameMode: (server.gameMode as "survival" | "creative" | "adventure" | "spectator") || "survival",
      difficulty: (server.difficulty as "peaceful" | "easy" | "normal" | "hard") || "normal",
      pvpEnabled: server.pvpEnabled ?? true,
      commandBlocksEnabled: server.commandBlocksEnabled ?? false,
      generateStructures: server.generateStructures ?? true,
    },
  });

  const updateServerMutation = useMutation({
    mutationFn: (data: ServerSettingsForm) => 
      apiRequest("PATCH", `/api/servers/${server.id}`, data),
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your server settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${server.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      setIsEditing(false);
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
        description: "Failed to update server settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServerSettingsForm) => {
    updateServerMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const gameModeOptions = [
    { value: "survival", label: "Survival" },
    { value: "creative", label: "Creative" },
    { value: "adventure", label: "Adventure" },
    { value: "spectator", label: "Spectator" },
  ];

  const difficultyOptions = [
    { value: "peaceful", label: "Peaceful" },
    { value: "easy", label: "Easy" },
    { value: "normal", label: "Normal" },
    { value: "hard", label: "Hard" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Server Settings</h3>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Edit Settings
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Settings */}
          <Card className="bg-slate-700/30 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Server Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          className="bg-slate-700 border-slate-600 text-white focus:border-indigo-500 disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxPlayers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Max Players</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={!isEditing}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="bg-slate-700 border-slate-600 text-white focus:border-indigo-500 disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gameMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Game Mode</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white disabled:opacity-50">
                            <SelectValue placeholder="Select game mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gameModeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Difficulty</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white disabled:opacity-50">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {difficultyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="bg-slate-700/30 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="pvpEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEditing}
                        className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-slate-300 cursor-pointer">
                        Enable PvP
                      </FormLabel>
                      <p className="text-sm text-slate-400">
                        Allow players to fight each other
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Separator className="bg-slate-600" />

              <FormField
                control={form.control}
                name="commandBlocksEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEditing}
                        className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-slate-300 cursor-pointer">
                        Enable Command Blocks
                      </FormLabel>
                      <p className="text-sm text-slate-400">
                        Allow command blocks to function in the world
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Separator className="bg-slate-600" />

              <FormField
                control={form.control}
                name="generateStructures"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEditing}
                        className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-slate-300 cursor-pointer">
                        Generate Structures
                      </FormLabel>
                      <p className="text-sm text-slate-400">
                        Generate villages, dungeons, and other structures
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center space-x-4">
              <Button
                type="submit"
                disabled={updateServerMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {updateServerMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={updateServerMutation.isPending}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Form>

      {/* Server Information */}
      <Card className="bg-slate-700/30 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">Server Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Server Type:</span>
            <span className="text-white capitalize">{server.serverType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Version:</span>
            <span className="text-white">{server.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Region:</span>
            <span className="text-white capitalize">{server.region.replace('-', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Server Address:</span>
            <span className="text-white">{server.subdomain}.blockcraft.com</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Created:</span>
            <span className="text-white">
              {server.createdAt ? new Date(server.createdAt).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
