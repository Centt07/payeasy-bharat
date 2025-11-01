import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Trash2, Plus, Wallet, Star, Sparkles, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  method_type: string;
  details: any;
  is_default: boolean;
  created_at: string;
}

const PaymentMethods = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: '',
    cardNumber: '',
    expiryDate: '',
    holderName: '',
    upiId: '',
  });

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async () => {
    if (!newMethod.type) {
      toast({
        title: "Error",
        description: "Please select a payment method type",
        variant: "destructive",
      });
      return;
    }

    let details = {};
    
    if (newMethod.type === 'card') {
      if (!newMethod.cardNumber || !newMethod.expiryDate || !newMethod.holderName) {
        toast({
          title: "Error",
          description: "Please fill all card details",
          variant: "destructive",
        });
        return;
      }
      details = {
        card_number: `****-****-****-${newMethod.cardNumber.slice(-4)}`,
        expiry_date: newMethod.expiryDate,
        holder_name: newMethod.holderName,
      };
    } else if (newMethod.type === 'upi') {
      if (!newMethod.upiId) {
        toast({
          title: "Error",
          description: "Please enter UPI ID",
          variant: "destructive",
        });
        return;
      }
      details = {
        upi_id: newMethod.upiId,
      };
    }

    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user?.id,
          method_type: newMethod.type,
          details,
          is_default: paymentMethods.length === 0,
        });

      if (error) throw error;

      toast({
        title: "Payment Method Added! 🎉",
        description: "Your payment method has been saved",
      });

      setNewMethod({
        type: '',
        cardNumber: '',
        expiryDate: '',
        holderName: '',
        upiId: '',
      });
      setShowAddForm(false);
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Method Deleted",
        description: "Payment method removed successfully",
      });

      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      });
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Default Updated! ⭐",
        description: "Default payment method changed",
      });

      fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-2xl">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Loading your payment methods...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 flex flex-col items-center gap-4">
            <div className="animate-spin-slow">
              <CreditCard className="h-12 w-12 text-secondary" />
            </div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-secondary/5 overflow-hidden hover-lift">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-secondary to-secondary/80 opacity-10 rounded-full -mr-16 -mt-16"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-secondary to-secondary/80 rounded-2xl shadow-lg shadow-secondary/30 animate-bounce-in">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Payment Methods</h3>
              <p className="text-sm text-muted-foreground font-normal">Manage your saved methods</p>
            </div>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2" variant="secondary">
            <Plus className="h-5 w-5" />
            Add Method
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 relative">
        {showAddForm && (
          <Card className="border-2 border-dashed border-secondary/30 bg-gradient-to-br from-secondary/5 to-secondary/10 shadow-lg animate-slide-down">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="method-type" className="font-semibold">Payment Method Type</Label>
                <Select value={newMethod.type} onValueChange={(value) => setNewMethod({ ...newMethod, type: value })}>
                  <SelectTrigger className="h-12 rounded-xl border-2 border-secondary/30 shadow-lg">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="card" className="py-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-primary rounded-lg">
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold">Credit/Debit Card</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="upi" className="py-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-accent rounded-lg">
                          <Smartphone className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold">UPI</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="netbanking" className="py-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-success rounded-lg">
                          <Wallet className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold">Net Banking</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMethod.type === 'card' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="card-number" className="font-semibold">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={newMethod.cardNumber}
                      onChange={(e) => setNewMethod({ ...newMethod, cardNumber: e.target.value })}
                      className="h-12 rounded-xl border-2 border-secondary/30 shadow-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry-date" className="font-semibold">Expiry Date</Label>
                      <Input
                        id="expiry-date"
                        placeholder="MM/YY"
                        value={newMethod.expiryDate}
                        onChange={(e) => setNewMethod({ ...newMethod, expiryDate: e.target.value })}
                        className="h-12 rounded-xl border-2 border-secondary/30 shadow-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="holder-name" className="font-semibold">Card Holder</Label>
                      <Input
                        id="holder-name"
                        placeholder="John Doe"
                        value={newMethod.holderName}
                        onChange={(e) => setNewMethod({ ...newMethod, holderName: e.target.value })}
                        className="h-12 rounded-xl border-2 border-secondary/30 shadow-lg"
                      />
                    </div>
                  </div>
                </>
              )}

              {newMethod.type === 'upi' && (
                <div className="space-y-2">
                  <Label htmlFor="upi-id" className="font-semibold">UPI ID</Label>
                  <Input
                    id="upi-id"
                    placeholder="user@paytm"
                    value={newMethod.upiId}
                    onChange={(e) => setNewMethod({ ...newMethod, upiId: e.target.value })}
                    className="h-12 rounded-xl border-2 border-secondary/30 shadow-lg"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button onClick={addPaymentMethod} className="flex-1" variant="secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentMethods.length === 0 ? (
          <div className="text-center py-16 animate-scale-in">
            <div className="relative inline-block mb-6">
              <div className="p-6 bg-gradient-to-r from-secondary to-secondary/80 rounded-3xl shadow-2xl shadow-secondary/30 animate-bounce-in">
                <CreditCard className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 p-2 bg-gradient-primary rounded-full shadow-lg animate-pulse">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 gradient-text">No payment methods</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Add your first payment method to get started with quick payments.</p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2" variant="secondary" size="lg">
              <Plus className="h-5 w-5" />
              Add Payment Method
            </Button>
          </div>
        ) : (
          <div className="space-y-3 animate-slide-up">
            {paymentMethods.map((method, index) => (
              <div 
                key={method.id} 
                className="flex items-center justify-between p-5 border-2 border-secondary/20 rounded-2xl bg-gradient-to-br from-card to-secondary/5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-secondary to-secondary/80 rounded-xl shadow-lg">
                    {method.method_type === 'upi' ? (
                      <Smartphone className="h-6 w-6 text-white" />
                    ) : method.method_type === 'netbanking' ? (
                      <Wallet className="h-6 w-6 text-white" />
                    ) : (
                      <CreditCard className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold capitalize text-lg">{method.method_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {method.method_type === 'card' && method.details.card_number}
                      {method.method_type === 'upi' && method.details.upi_id}
                      {method.method_type === 'netbanking' && 'Net Banking Account'}
                    </div>
                  </div>
                  {method.is_default && (
                    <Badge className="bg-gradient-to-r from-warning to-warning/80 text-white border-0 shadow-lg px-3 py-1 gap-1.5">
                      <Star className="h-3 w-3 fill-white" />
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {!method.is_default && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAsDefault(method.id)}
                      className="h-9 px-4 gap-2"
                    >
                      <Star className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Set Default</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deletePaymentMethod(method.id)}
                    className="h-9 px-3"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;