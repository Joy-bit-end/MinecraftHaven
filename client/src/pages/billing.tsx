import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Receipt, Calendar, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function Billing() {
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

  const { data: subscriptions = [], isLoading: subscriptionsLoading, error: subscriptionsError } = useQuery({
    queryKey: ["/api/billing/subscriptions"],
    retry: false,
    enabled: !authLoading && isAuthenticated,
  });

  const { data: billingHistory = [], isLoading: historyLoading, error: historyError } = useQuery({
    queryKey: ["/api/billing/history"],
    retry: false,
    enabled: !authLoading && isAuthenticated,
  });

  if ((subscriptionsError && isUnauthorizedError(subscriptionsError as Error)) || 
      (historyError && isUnauthorizedError(historyError as Error))) {
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

  if (authLoading || subscriptionsLoading || historyLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Mock current plan data - in a real app this would come from the API
  const currentPlan = {
    name: "Basic Plan",
    price: 9.00,
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  };

  // Mock payment method - in a real app this would come from the API
  const paymentMethod = {
    last4: "4242",
    brand: "Visa",
    expiresMonth: 12,
    expiresYear: 2025,
  };

  // Mock billing history if empty
  const mockBillingHistory = billingHistory.length > 0 ? billingHistory : [
    {
      id: 1,
      description: "Basic Plan Subscription",
      amount: "9.00",
      status: "paid",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
    {
      id: 2,
      description: "Basic Plan Subscription",
      amount: "9.00",
      status: "paid",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    },
    {
      id: 3,
      description: "Basic Plan Subscription",
      amount: "9.00",
      status: "paid",
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscriptions</h1>
          <p className="text-slate-400">Manage your subscription and payment methods</p>
        </div>

        {/* Current Plan */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{currentPlan.name}</div>
                <div className="text-slate-400">
                  Next billing date: {format(currentPlan.nextBillingDate, "MMMM d, yyyy")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">${currentPlan.price.toFixed(2)}</div>
                <div className="text-slate-400">per month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Receipt className="mr-2 h-5 w-5" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mockBillingHistory.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No billing history</h3>
                <p className="text-slate-400">Your billing history will appear here once you have transactions.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockBillingHistory.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-b-0">
                    <div>
                      <div className="text-white font-semibold">{item.description}</div>
                      <div className="text-slate-400 text-sm">
                        {format(new Date(item.createdAt), "MMMM d, yyyy")}
                      </div>
                    </div>
                    <div className="text-right flex items-center space-x-3">
                      <div className="text-white font-semibold">${item.amount}</div>
                      <Badge className={item.status === 'paid' ? 'bg-emerald-600' : 'bg-red-600'}>
                        {item.status === 'paid' ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Paid
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Methods
            </CardTitle>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Add Payment Method
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <CreditCard className="text-white text-sm" />
                </div>
                <div>
                  <div className="text-white font-semibold">•••• •••• •••• {paymentMethod.last4}</div>
                  <div className="text-slate-400 text-sm">
                    Expires {paymentMethod.expiresMonth}/{paymentMethod.expiresYear}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-emerald-600">Primary</Badge>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
