import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Box, Home, Server, Plus, CreditCard, HelpCircle, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home, active: location === "/" },
    { name: "My Servers", href: "/", icon: Server, active: location.startsWith("/servers") },
    { name: "Create Server", href: "/create-server", icon: Plus, active: location === "/create-server" },
    { name: "Billing", href: "/billing", icon: CreditCard, active: location === "/billing" },
    { name: "Support", href: "#", icon: HelpCircle, active: false },
  ];

  const getInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email;
    }
    return "User";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Box className="text-indigo-500 text-2xl mr-3" />
              <span className="text-xl font-bold text-white">BlockCraft Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="bg-indigo-600 text-white text-sm">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-slate-300 hidden sm:block">{getDisplayName(user)}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-white">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 min-h-screen border-r border-slate-800">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? "text-white bg-indigo-600"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
