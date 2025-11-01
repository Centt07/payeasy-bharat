import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Receipt, History as HistoryIcon, Sparkles, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  description: string;
  created_at: string;
}

const PaymentHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const generateReceipt = async (paymentId: string) => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('payment_id', paymentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        const payment = payments.find(p => p.id === paymentId);
        if (!payment) return;

        const receiptNumber = `RCP-${Date.now()}`;
        const taxAmount = payment.amount * 0.18;
        const totalAmount = payment.amount + taxAmount;

        const { error: insertError } = await supabase
          .from('receipts')
          .insert({
            user_id: user?.id,
            payment_id: paymentId,
            receipt_number: receiptNumber,
            amount: payment.amount,
            tax_amount: taxAmount,
            total_amount: totalAmount,
          });

        if (insertError) throw insertError;

        toast({
          title: "Receipt Generated! 🎉",
          description: `Receipt ${receiptNumber} created`,
        });
      } else {
        toast({
          title: "Receipt Already Exists",
          description: `Receipt ${data.receipt_number} already generated`,
        });
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast({
        title: "Error",
        description: "Failed to generate receipt",
        variant: "destructive",
      });
    }
  };

  const downloadReceipt = async (paymentId: string) => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('payment_id', paymentId)
        .single();

      if (error) throw error;

      const receiptContent = `
PAYMENT RECEIPT
===============

Receipt Number: ${data.receipt_number}
Date: ${new Date(data.issued_date).toLocaleDateString()}

Amount: ₹${data.amount.toFixed(2)}
Tax (18%): ₹${data.tax_amount.toFixed(2)}
Total: ₹${data.total_amount.toFixed(2)}

Thank you for your payment!
      `;

      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${data.receipt_number}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Receipt Downloaded! 📄",
        description: `Receipt ${data.receipt_number} downloaded`,
      });
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast({
        title: "Error",
        description: "Failed to download receipt. Please generate it first.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-2xl">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Loading your payment history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 flex flex-col items-center gap-4">
            <div className="animate-spin-slow">
              <HistoryIcon className="h-12 w-12 text-accent" />
            </div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-accent/5 overflow-hidden hover-lift">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-accent opacity-10 rounded-full -mr-16 -mt-16"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-3">
          <div className="p-3 bg-gradient-accent rounded-2xl shadow-lg shadow-accent/30 animate-bounce-in">
            <HistoryIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Payment History</h3>
            <p className="text-sm text-muted-foreground font-normal">Track all your transactions</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 relative">
        {payments.length === 0 ? (
          <div className="text-center py-16 animate-scale-in">
            <div className="relative inline-block mb-6">
              <div className="p-6 bg-gradient-accent rounded-3xl shadow-2xl shadow-accent/30 animate-bounce-in">
                <Receipt className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 p-2 bg-gradient-primary rounded-full shadow-lg animate-pulse">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 gradient-text">No payments yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">Your payment history will appear here once you make your first payment.</p>
          </div>
        ) : (
          <div className="border-2 border-accent/20 rounded-2xl overflow-hidden shadow-xl animate-slide-up">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-accent/10 to-accent/5">
                    <TableHead className="font-bold whitespace-nowrap">Payment ID</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">Amount</TableHead>
                    <TableHead className="font-bold whitespace-nowrap hidden md:table-cell">Method</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">Status</TableHead>
                    <TableHead className="font-bold whitespace-nowrap hidden lg:table-cell">Date</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment, index) => (
                    <TableRow key={payment.id} className="hover:bg-accent/5 transition-colors" style={{ animationDelay: `${index * 0.05}s` }}>
                      <TableCell className="font-semibold text-xs sm:text-sm">{payment.payment_id}</TableCell>
                      <TableCell className="font-bold whitespace-nowrap text-accent">₹{payment.amount.toFixed(2)}</TableCell>
                      <TableCell className="hidden md:table-cell capitalize">{payment.payment_method}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusColor(payment.status)}
                          className="capitalize font-semibold rounded-lg px-3 py-1"
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm hidden lg:table-cell whitespace-nowrap">{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="accent"
                            onClick={() => generateReceipt(payment.id)}
                            className="h-9 px-3 text-xs gap-1.5"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Receipt</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadReceipt(payment.id)}
                            className="h-9 px-3 text-xs gap-1.5"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Download</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;