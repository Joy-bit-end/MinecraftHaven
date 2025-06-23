import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ServerConsoleProps {
  serverId: number;
}

export default function ServerConsole({ serverId }: ServerConsoleProps) {
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState([
    { time: "12:34:56", level: "INFO", message: "Starting minecraft server version 1.20.4", type: "success" },
    { time: "12:34:57", level: "INFO", message: "Loading properties", type: "info" },
    { time: "12:34:58", level: "INFO", message: "Preparing level \"world\"", type: "info" },
    { time: "12:34:59", level: "INFO", message: "Preparing start region for dimension minecraft:overworld", type: "info" },
    { time: "12:35:02", level: "INFO", message: "Done (3.412s)! For help, type \"help\"", type: "success" },
    { time: "12:45:23", level: "INFO", message: "Player123 joined the game", type: "warning" },
    { time: "12:45:23", level: "INFO", message: "Player123[/192.168.1.100:54321] logged in", type: "info" },
    { time: "12:47:15", level: "CHAT", message: "<Player123> Hello world!", type: "chat" },
  ]);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    // Add command to console
    const newLog = {
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      level: "CMD",
      message: `> ${command}`,
      type: "command" as const,
    };

    setLogs(prev => [...prev, newLog]);
    setCommand("");

    // Mock command response
    setTimeout(() => {
      const response = {
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        level: "INFO",
        message: `Command executed: ${command}`,
        type: "info" as const,
      };
      setLogs(prev => [...prev, response]);
    }, 500);
  };

  const getLogStyle = (type: string) => {
    switch (type) {
      case "success":
        return "text-emerald-400";
      case "info":
        return "text-slate-300";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      case "chat":
        return "text-cyan-400";
      case "command":
        return "text-purple-400";
      default:
        return "text-slate-300";
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={consoleRef}
        className="bg-slate-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm"
      >
        {logs.map((log, index) => (
          <div key={index} className={`${getLogStyle(log.type)} mb-1`}>
            [{log.time}] [{log.level}]: {log.message}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendCommand} className="flex space-x-2">
        <Input
          type="text"
          placeholder="Enter server command..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="flex-1 bg-slate-700 border-slate-600 text-white focus:border-indigo-500"
        />
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
