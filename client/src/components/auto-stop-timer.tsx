import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MinecraftServer } from "@shared/schema";

interface AutoStopTimerProps {
  server: MinecraftServer;
}

export default function AutoStopTimer({ server }: AutoStopTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(60);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Only show for servers with auto-stop enabled (non-premium)
  if (!server.autoStopEnabled || server.status !== 'online') {
    return null;
  }

  const offlineTimeUsed = server.offlineTimeUsed || 0;
  const remaining = Math.max(0, 60 - offlineTimeUsed);
  const progressValue = (offlineTimeUsed / 60) * 100;

  const renewMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/servers/${server.id}/renew`),
    onSuccess: () => {
      toast({
        title: "Timer Reset",
        description: "Your server auto-stop timer has been reset to 60 minutes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reset timer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = () => {
    if (remaining > 30) return "text-green-500";
    if (remaining > 10) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = () => {
    if (remaining > 30) return "bg-green-500";
    if (remaining > 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Auto-Stop Timer
          {remaining <= 10 && <AlertTriangle className="h-5 w-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Time until auto-stop:</span>
            <span className={`font-mono font-semibold ${getStatusColor()}`}>
              {remaining} minutes
            </span>
          </div>
          <Progress 
            value={progressValue} 
            className="h-2"
            style={{
              backgroundColor: "var(--muted)",
            }}
          />
          <div className="text-xs text-muted-foreground">
            Server will stop automatically after 60 minutes with no players online
          </div>
        </div>

        {remaining <= 15 && (
          <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Your server will stop automatically in {remaining} minutes to save resources.
                </p>
                <Button
                  onClick={() => renewMutation.mutate()}
                  disabled={renewMutation.isPending}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {renewMutation.isPending ? "Resetting..." : "Reset Timer (+60 min)"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Timer resets when players join your server</p>
          <p>• Upgrade to Premium to disable auto-stop</p>
        </div>
      </CardContent>
    </Card>
  );
}