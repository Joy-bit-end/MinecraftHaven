import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Box, 
  Shield, 
  Globe, 
  ChartLine, 
  Smartphone, 
  Puzzle,
  Server,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Play
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: Server,
      title: "Server Management",
      description: "Complete control panel with start/stop, console access, file manager, and scheduling.",
      highlights: ["Real-time console", "File manager", "Auto-restart scheduling"],
      color: "bg-indigo-600"
    },
    {
      icon: Puzzle,
      title: "Plugin & Mod Support",
      description: "One-click installation for Spigot, Bukkit, Forge, and Fabric plugins.",
      highlights: ["Auto dependency checks", "Modpack support", "Version compatibility"],
      color: "bg-purple-600"
    },
    {
      icon: Shield,
      title: "DDoS Protection",
      description: "Enterprise-grade security with automatic backups and access controls.",
      highlights: ["24/7 monitoring", "IP whitelisting", "Auto backups"],
      color: "bg-emerald-600"
    },
    {
      icon: Globe,
      title: "Global Deployment",
      description: "Deploy servers in multiple regions with auto-scaling capabilities.",
      highlights: ["US, EU, Asia locations", "Auto-scaling resources", "Container isolation"],
      color: "bg-amber-600"
    },
    {
      icon: ChartLine,
      title: "Advanced Analytics",
      description: "Detailed performance metrics, player logs, and crash reports.",
      highlights: ["Player statistics", "Performance monitoring", "Uptime reports"],
      color: "bg-cyan-600"
    },
    {
      icon: Smartphone,
      title: "Mobile Access",
      description: "Manage your servers on-the-go with our mobile app and push notifications.",
      highlights: ["iOS & Android apps", "Push notifications", "Responsive dashboard"],
      color: "bg-pink-600"
    }
  ];

  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Perfect for testing",
      features: ["1GB RAM", "10 Player Slots", "Basic Support", "5GB Storage"],
      popular: false
    },
    {
      name: "Basic",
      price: 9,
      description: "Great for small communities",
      features: ["4GB RAM", "Unlimited Player Slots", "Priority Support", "50GB Storage", "Plugin Support"],
      popular: true
    },
    {
      name: "Premium",
      price: 19,
      description: "For large communities",
      features: ["8GB RAM", "Unlimited Player Slots", "24/7 Priority Support", "200GB Storage", "Custom Domain", "Advanced Analytics"],
      popular: false
    }
  ];

  const stats = [
    { icon: Users, value: "50K+", label: "Active Servers", color: "text-indigo-400" },
    { icon: CheckCircle, value: "99.9%", label: "Uptime", color: "text-emerald-400" },
    { icon: Clock, value: "24/7", label: "Support", color: "text-purple-400" },
    { icon: Play, value: "1M+", label: "Players Served", color: "text-amber-400" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navigation */}
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
              <Button 
                variant="ghost" 
                onClick={handleLogin}
                className="text-slate-300 hover:text-white"
              >
                Login
              </Button>
              <Button 
                onClick={handleLogin}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20"></div>
        <div className="absolute inset-0 minecraft-pattern"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Minecraft</span> Hosting
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Host your Minecraft Bedrock server with enterprise-grade performance, DDoS protection, and 24/7 support. Join thousands of satisfied server owners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={handleLogin}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-4 h-auto"
              >
                Start Your Server
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-slate-600 hover:border-slate-500 text-white text-lg px-8 py-4 h-auto"
              >
                View Pricing
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-xl text-slate-400">Professional server management tools and features</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="text-white text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 mb-4">{feature.description}</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="text-emerald-400 mr-2 h-4 w-4" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
            <p className="text-xl text-slate-400">Scalable hosting plans for every server size</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'bg-gradient-to-b from-indigo-900/50 to-slate-800/50 border-indigo-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-white mb-2">
                      ${plan.price}<span className="text-lg text-slate-400">/month</span>
                    </div>
                    <p className="text-slate-400">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-slate-300">
                        <CheckCircle className="text-emerald-400 mr-3 h-5 w-5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                    onClick={handleLogin}
                  >
                    {plan.name === 'Free' ? 'Get Started' : `Choose ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
