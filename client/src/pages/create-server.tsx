import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Smartphone, Monitor, CheckCircle } from "lucide-react";
import type { ServerPlan } from "@shared/schema";

const createServerSchema = z.object({
  name: z.string().min(1, "Server name is required").max(50, "Server name must be less than 50 characters"),
  serverType: z.enum(["bedrock", "java"]),
  version: z.string().min(1, "Version is required"),
  region: z.string().min(1, "Region is required"),
  planId: z.number().min(1, "Plan selection is required"),
});

type CreateServerForm = z.infer<typeof createServerSchema>;

export default function CreateServer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  const { data: plans = [], isLoading: plansLoading, error } = useQuery({
    queryKey: ["/api/server-plans"],
    retry: false,
    enabled: !authLoading && isAuthenticated,
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

  const form = useForm<CreateServerForm>({
    resolver: zodResolver(createServerSchema),
    defaultValues: {
      name: "",
      serverType: "bedrock",
      version: "1.20.4",
      region: "us-east",
      planId: plans.find((p: ServerPlan) => p.name === "Free")?.id || 1,
    },
  });

  const createServerMutation = useMutation({
    mutationFn: (data: CreateServerForm) => apiRequest("POST", "/api/servers", data),
    onSuccess: () => {
      toast({
        title: "Server Created",
        description: "Your server has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      setLocation("/");
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
        description: "Failed to create server. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateServerForm) => {
    createServerMutation.mutate(data);
  };

  if (authLoading || plansLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedPlan = plans.find((p: ServerPlan) => p.id === form.watch("planId"));

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Create New Server</h1>
          <p className="text-slate-400">Set up your new Minecraft server in minutes</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Server Type Selection */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Server Type</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="serverType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bedrock" id="bedrock" />
                            <Label htmlFor="bedrock" className="flex items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600 cursor-pointer hover:border-indigo-500 transition-colors flex-1">
                              <Smartphone className="mr-3 h-5 w-5 text-indigo-400" />
                              <div>
                                <div className="text-white font-semibold">Bedrock Edition</div>
                                <div className="text-slate-400 text-sm">For mobile, console, and Windows 10</div>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="java" id="java" />
                            <Label htmlFor="java" className="flex items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600 cursor-pointer hover:border-indigo-500 transition-colors flex-1">
                              <Monitor className="mr-3 h-5 w-5 text-indigo-400" />
                              <div>
                                <div className="text-white font-semibold">Java Edition</div>
                                <div className="text-slate-400 text-sm">For PC with mod support</div>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Server Configuration */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Server Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Server Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="My Awesome Server"
                          className="bg-slate-700 border-slate-600 text-white focus:border-indigo-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Version</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select version" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1.20.4">1.20.4 (Latest)</SelectItem>
                            <SelectItem value="1.20.2">1.20.2</SelectItem>
                            <SelectItem value="1.19.4">1.19.4</SelectItem>
                            <SelectItem value="1.18.2">1.18.2</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Region</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="us-east">US East (Virginia)</SelectItem>
                            <SelectItem value="us-west">US West (California)</SelectItem>
                            <SelectItem value="eu-central">EU (Frankfurt)</SelectItem>
                            <SelectItem value="asia-southeast">Asia (Singapore)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Plan Selection */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Choose Your Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="planId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value?.toString()}
                          className="space-y-3"
                        >
                          {plans.map((plan: ServerPlan) => (
                            <div key={plan.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={plan.id.toString()} id={plan.id.toString()} />
                              <Label
                                htmlFor={plan.id.toString()}
                                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 cursor-pointer hover:border-indigo-500 transition-colors flex-1"
                              >
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-white font-semibold flex items-center gap-2">
                                      {plan.name}
                                      {plan.name === "Basic" && <Badge className="bg-indigo-600">Most Popular</Badge>}
                                    </div>
                                    <div className="text-slate-400 text-sm">
                                      {plan.ram}GB RAM • {plan.maxPlayers ? 'Unlimited' : '10'} Players • {plan.storage}GB Storage
                                    </div>
                                  </div>
                                </div>
                                <div className="text-white font-bold">${plan.price}/mo</div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={createServerMutation.isPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12"
            >
              {createServerMutation.isPending ? "Creating Server..." : "Create Server"}
            </Button>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
