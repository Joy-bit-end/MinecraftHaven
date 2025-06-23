import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  onLogin: () => void;
}

export default function Navigation({ onLogin }: NavigationProps) {
  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Box className="text-indigo-500 text-2xl mr-3" />
              <span className="text-xl font-bold text-white">BlockCraft</span>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium">Features</a>
              <a href="#pricing" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium">Pricing</a>
              <a href="#" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium">Support</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onLogin} className="text-slate-300 hover:text-white">
              Login
            </Button>
            <Button onClick={onLogin} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
