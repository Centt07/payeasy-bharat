import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, Wallet, IndianRupee, Receipt, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentSchema } from '@/lib/validation';
import { z } from 'zod';

const PaymentForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: '',
    description: '',
  });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const processPayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to process payments",
        variant: "destructive",
      });
      return;
    }

    const errors: Record<string, string> = {};
    try {
      paymentSchema.parse({
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        description: paymentData.description,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
      }
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setValidationErrors({});
    setProcessing(true);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'create-razorpay-payment',
        {
          body: {
            amount: parseFloat(paymentData.amount),
            currency: 'INR',
            description: paymentData.description || 'Payment',
            paymentMethod: paymentData.paymentMethod,
          }
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Failed to create payment');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create payment order');
      }

      toast({
        title: "Payment Initiated",
        description: `Payment order created successfully. Order ID: ${data.orderId}`,
      });

      setTimeout(() => {
        setSuccess(true);
        toast({
          title: "Payment Successful! 🎉",
          description: `Payment of ₹${paymentData.amount} completed successfully`,
        });

        setTimeout(() => {
          setSuccess(false);
          setPaymentData({
            amount: '',
            paymentMethod: '',
            description: '',
          });
        }, 2000);
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please ensure your Razorpay keys are configured.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-primary/5 hover-lift overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-10 rounded-full -mr-16 -mt-16"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-primary rounded-2xl shadow-lg shadow-primary/30 animate-bounce-in">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Make Payment</h3>
              <p className="text-sm text-muted-foreground font-normal">Process a secure transaction</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative">
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-sm font-semibold flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" />
              Amount *
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                className="pl-10 text-2xl font-bold h-16 rounded-2xl border-2 border-primary/20 focus:border-primary shadow-lg transition-all"
                min="1"
                max="1000000"
              />
              <IndianRupee className="h-6 w-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" />
            </div>
            {validationErrors.amount && (
              <p className="text-sm text-destructive animate-slide-down">{validationErrors.amount}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="payment-method" className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Method *
            </Label>
            <Select value={paymentData.paymentMethod} onValueChange={(value) => setPaymentData({ ...paymentData, paymentMethod: value })}>
              <SelectTrigger className="h-14 rounded-2xl border-2 border-primary/20 shadow-lg">
                <SelectValue placeholder="Choose your preferred method" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="credit_card" className="py-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-primary rounded-lg">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold">Credit Card</span>
                  </div>
                </SelectItem>
                <SelectItem value="debit_card" className="py-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-success rounded-lg">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold">Debit Card</span>
                  </div>
                </SelectItem>
                <SelectItem value="upi" className="py-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-accent rounded-lg">
                      <Wallet className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold">UPI</span>
                  </div>
                </SelectItem>
                <SelectItem value="netbanking" className="py-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-secondary to-secondary/80 rounded-lg">
                      <Wallet className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold">Net Banking</span>
                  </div>
                </SelectItem>
                <SelectItem value="wallet" className="py-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning rounded-lg">
                      <Wallet className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold">Digital Wallet</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.paymentMethod && (
              <p className="text-sm text-destructive animate-slide-down">{validationErrors.paymentMethod}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-semibold">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a note for this payment..."
              value={paymentData.description}
              onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
              className="min-h-[100px] resize-none rounded-2xl border-2 border-primary/20 shadow-lg transition-all"
              maxLength={500}
            />
          </div>

          <Button 
            onClick={processPayment} 
            disabled={processing || success || !paymentData.amount || !paymentData.paymentMethod}
            className="w-full h-14 text-base font-bold rounded-2xl transition-all duration-300"
            variant={success ? "success" : "default"}
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2 animate-pulse-success" />
                Payment Successful!
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Pay ₹{paymentData.amount || '0.00'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Payment Summary Card */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-success/5 hover-lift overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-success opacity-10 rounded-full -mr-16 -mt-16"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-success rounded-2xl shadow-lg shadow-success/30 animate-bounce-in" style={{ animationDelay: '0.1s' }}>
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Payment Summary</h3>
              <p className="text-sm text-muted-foreground font-normal">Review your details</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 relative">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-4 border-b border-primary/10">
              <span className="text-muted-foreground font-medium">Amount</span>
              <span className="text-2xl font-bold gradient-text">₹{paymentData.amount || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-primary/10">
              <span className="text-muted-foreground font-medium">Payment Method</span>
              <span className="font-semibold">{paymentData.paymentMethod ? paymentData.paymentMethod.replace('_', ' ').toUpperCase() : 'Not selected'}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-primary/10">
              <span className="text-muted-foreground font-medium">Processing Fee</span>
              <span className="font-semibold text-success">₹0.00</span>
            </div>
            <div className="flex justify-between items-center py-4 bg-gradient-to-r from-primary/5 to-success/5 rounded-2xl px-4 border-2 border-primary/20">
              <span className="text-lg font-bold">Total Amount</span>
              <span className="text-2xl font-bold gradient-text">₹{paymentData.amount || '0.00'}</span>
            </div>
            
            {paymentData.description && (
              <div className="p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl animate-slide-down">
                <p className="text-sm text-muted-foreground mb-2 font-semibold">Description</p>
                <p className="text-sm">{paymentData.description}</p>
              </div>
            )}
            
            <div className="p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-2xl border-2 border-success/20">
              <div className="flex items-center gap-3 text-success mb-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-bold">Secure Payment</span>
              </div>
              <p className="text-xs text-muted-foreground">Your payment is protected by 256-bit SSL encryption and PCI DSS compliance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentForm;