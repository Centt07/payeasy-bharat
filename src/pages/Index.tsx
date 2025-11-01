import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Receipt, Shield, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">BillPay India</h1>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Get Started
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Simplify Your Bill Payments
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage all your bills, track payments, and download receipts in one secure platform designed for India.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Start Managing Bills
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CreditCard className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Easy Payments</CardTitle>
              <CardDescription>
                Pay all your bills in one place with secure payment processing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Receipt className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Digital Receipts</CardTitle>
              <CardDescription>
                Download and manage all your payment receipts digitally
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure & Safe</CardTitle>
              <CardDescription>
                Bank-grade security to protect your financial information
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <Smartphone className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of users managing their bills efficiently
            </p>
            <Button size="lg" onClick={() => navigate('/auth')}>
              Create Account
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 BillPay India. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
