import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, CreditCard, IndianRupee, History, Wallet, QrCode, TrendingUp, Clock, CheckCircle2, Zap } from 'lucide-react';
import PaymentHistory from '@/components/PaymentHistory';
import PaymentMethods from '@/components/PaymentMethods';
import PaymentForm from '@/components/PaymentForm';
import PaymentReceive from '@/components/PaymentReceive';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <header className="bg-gradient-primary shadow-lg shadow-primary/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 animate-slide-down">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">PayEasy</h1>
              <p className="text-xs text-white/80 hidden sm:block">Secure Payment Gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-white/80">{user?.email}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut} 
              className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-success/5 hover-lift animate-slide-up overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-success opacity-10 rounded-full -mr-8 -mt-8"></div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-semibold">
                <span className="text-muted-foreground text-xs sm:text-sm">Total</span>
                <div className="p-2 bg-gradient-success rounded-xl shadow-lg shadow-success/30 animate-pulse-success">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold bg-gradient-success bg-clip-text text-transparent">₹0.00</div>
                <p className="text-xs text-muted-foreground">+0% from last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-warning/5 hover-lift animate-slide-up overflow-hidden relative" style={{ animationDelay: '0.1s' }}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-warning opacity-10 rounded-full -mr-8 -mt-8"></div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-semibold">
                <span className="text-muted-foreground text-xs sm:text-sm">Pending</span>
                <div className="p-2 bg-gradient-to-br from-warning to-warning/80 rounded-xl shadow-lg shadow-warning/30">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-warning">₹0.00</div>
                <p className="text-xs text-muted-foreground">Outstanding amount</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-primary/5 hover-lift animate-slide-up overflow-hidden relative" style={{ animationDelay: '0.2s' }}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-primary opacity-10 rounded-full -mr-8 -mt-8"></div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-semibold">
                <span className="text-muted-foreground text-xs sm:text-sm">Success Rate</span>
                <div className="p-2 bg-gradient-primary rounded-xl shadow-lg shadow-primary/30">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold gradient-text">100%</div>
                <p className="text-xs text-muted-foreground">All transactions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-accent/5 hover-lift animate-slide-up overflow-hidden relative" style={{ animationDelay: '0.3s' }}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-accent opacity-10 rounded-full -mr-8 -mt-8"></div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-semibold">
                <span className="text-muted-foreground text-xs sm:text-sm">Methods</span>
                <div className="p-2 bg-gradient-accent rounded-xl shadow-lg shadow-accent/30">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-accent">0</div>
                <p className="text-xs text-muted-foreground">Active methods</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="w-full animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl p-1.5 h-auto gap-1.5 rounded-2xl">
            <TabsTrigger 
              value="payments" 
              className="flex items-center justify-center gap-2 py-3 px-3 sm:px-4 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 rounded-xl transition-all text-xs sm:text-sm font-semibold hover:bg-primary/5"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Make Payment</span>
              <span className="sm:hidden">Pay</span>
            </TabsTrigger>
            <TabsTrigger 
              value="receive" 
              className="flex items-center justify-center gap-2 py-3 px-3 sm:px-4 data-[state=active]:bg-gradient-success data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-success/30 rounded-xl transition-all text-xs sm:text-sm font-semibold hover:bg-success/5"
            >
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Receive</span>
              <span className="sm:hidden">Receive</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center justify-center gap-2 py-3 px-3 sm:px-4 data-[state=active]:bg-gradient-accent data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-accent/30 rounded-xl transition-all text-xs sm:text-sm font-semibold hover:bg-accent/5"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger 
              value="methods" 
              className="flex items-center justify-center gap-2 py-3 px-3 sm:px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-secondary/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-secondary/30 rounded-xl transition-all text-xs sm:text-sm font-semibold hover:bg-secondary/5"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Methods</span>
              <span className="sm:hidden">Methods</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="receive" className="mt-6 animate-scale-in">
            <PaymentReceive />
          </TabsContent>

          <TabsContent value="payments" className="mt-6 animate-scale-in">
            <PaymentForm />
          </TabsContent>

          <TabsContent value="history" className="mt-6 animate-scale-in">
            <PaymentHistory />
          </TabsContent>

          <TabsContent value="methods" className="mt-6 animate-scale-in">
            <PaymentMethods />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;