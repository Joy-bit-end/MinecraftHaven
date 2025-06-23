import { Card, CardContent } from "@/components/ui/card";
import { Users, Cpu, HardDrive, Clock } from "lucide-react";

interface ServerStatsProps {
  stats: {
    playersOnline: number;
    maxPlayers: number;
    cpuUsage: number;
    ramUsage: number;
    ramTotal: number;
    uptime: string;
  };
}

export default function ServerStats({ stats }: ServerStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Players Online</p>
              <p className="text-2xl font-bold text-white">{stats.playersOnline}/{stats.maxPlayers}</p>
            </div>
            <Users className="text-indigo-400 h-8 w-8" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">CPU Usage</p>
              <p className="text-2xl font-bold text-white">{stats.cpuUsage}%</p>
            </div>
            <Cpu className="text-emerald-400 h-8 w-8" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">RAM Usage</p>
              <p className="text-2xl font-bold text-white">{stats.ramUsage}/{stats.ramTotal}GB</p>
            </div>
            <HardDrive className="text-purple-400 h-8 w-8" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Uptime</p>
              <p className="text-2xl font-bold text-white">{stats.uptime}</p>
            </div>
            <Clock className="text-amber-400 h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
