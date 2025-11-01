import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QrCode, Share2, Copy, IndianRupee, Clock, CheckCircle, Plus, Sparkles, Scan } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCodeGenerator from './QRCodeGenerator';

interface PaymentRequest {
  id: string;
  request_id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  requester_email: string;
  requester_phone: string;
  expires_at: string;
  created_at: string;
}

const PaymentReceive = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    requesterEmail: '',
    requesterPhone: '',
  });

  useEffect(() => {
    if (user) {
      fetchPaymentRequests();
    }
  }, [user]);

  const fetchPaymentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPaymentRequest = async () => {
    if (!formData.amount) {
      toast({
        title: "Error",
        description: "Please enter an amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user?.id,
          request_id: requestId,
          amount: parseFloat(formData.amount),
          description: formData.description || 'Payment Request',
          requester_email: formData.requesterEmail,
          requester_phone: formData.requesterPhone,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Payment Request Created! 🎉",
        description: `Request ${requestId} created successfully`,
      });

      setFormData({
        amount: '',
        description: '',
        requesterEmail: '',
        requesterPhone: '',
      });
      setShowCreateForm(false);
      fetchPaymentRequests();
      setSelectedRequest(data);
    } catch (error) {
      console.error('Error creating payment request:', error);
      toast({
        title: "Error",
        description: "Failed to create payment request",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const copyPaymentLink = (requestId: string) => {
    const paymentLink = `${window.location.origin}/pay/${requestId}`;
    navigator.clipboard.writeText(paymentLink);
    toast({
      title: "Link Copied! 📋",
      description: "Payment link copied to clipboard",
    });
  };

  const sharePaymentRequest = (request: PaymentRequest) => {
    const paymentLink = `${window.location.origin}/pay/${request.request_id}`;
    const message = `Payment Request: ₹${request.amount}\n${request.description}\n\nPay now: ${paymentLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Payment Request',
        text: message,
        url: paymentLink,
      });
    } else {
      navigator.clipboard.writeText(message);
      toast({
        title: "Request Copied! 📋",
        description: "Payment request details copied",
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-2xl">
        <CardHeader>
          <CardTitle>Payment Requests</CardTitle>
          <CardDescription>Loading your payment requests...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 flex flex-col items-center gap-4">
            <div className="animate-spin-slow">
              <QrCode className="h-12 w-12 text-primary" />
            </div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-success/5 overflow-hidden hover-lift">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-success opacity-10 rounded-full -mr-16 -mt-16"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-success rounded-2xl shadow-lg shadow-success/30 animate-bounce-in">
                <Scan className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Request Payment</h3>
                <p className="text-sm text-muted-foreground font-normal">Generate QR codes for collection</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="gap-2"
              variant="success"
            >
              <Plus className="h-5 w-5" />
              Create Request
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 relative">
          {showCreateForm && (
            <div className="space-y-4 p-6 border-2 border-dashed border-success/30 rounded-2xl bg-gradient-to-br from-success/5 to-success/10 mb-6 animate-slide-down">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="request-amount" className="text-sm font-semibold flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-success" />
                    Amount (₹) *
                  </Label>
                  <div className="relative">
                    <Input
                      id="request-amount"
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="pl-10 h-12 rounded-xl border-2 border-success/30 focus:border-success shadow-lg"
                    />
                    <IndianRupee className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-success" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requester-email" className="text-sm font-semibold">Requester Email (Optional)</Label>
                  <Input
                    id="requester-email"
                    type="email"
                    placeholder="payer@example.com"
                    value={formData.requesterEmail}
                    onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                    className="h-12 rounded-xl border-2 border-success/30 shadow-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requester-phone" className="text-sm font-semibold">Requester Phone (Optional)</Label>
                <Input
                  id="requester-phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.requesterPhone}
                  onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                  className="h-12 rounded-xl border-2 border-success/30 shadow-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-description" className="text-sm font-semibold">Description</Label>
                <Textarea
                  id="request-description"
                  placeholder="What is this payment for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[100px] resize-none rounded-xl border-2 border-success/30 shadow-lg"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={createPaymentRequest} className="gap-2 flex-1" variant="success">
                  <Sparkles className="h-4 w-4" />
                  Create Payment Request
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {selectedRequest && (
            <div className="mb-6 animate-scale-in">
              <QRCodeGenerator 
                paymentRequest={selectedRequest}
                onClose={() => setSelectedRequest(null)}
              />
            </div>
          )}

          {requests.length === 0 ? (
            <div className="text-center py-16 animate-scale-in">
              <div className="relative inline-block mb-6">
                <div className="p-6 bg-gradient-success rounded-3xl shadow-2xl shadow-success/30 animate-bounce-in">
                  <QrCode className="h-16 w-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 p-2 bg-gradient-accent rounded-full shadow-lg animate-pulse">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 gradient-text">No payment requests yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Create your first payment request to start receiving payments with QR codes.</p>
              <Button onClick={() => setShowCreateForm(true)} className="gap-2" variant="success" size="lg">
                <Plus className="h-5 w-5" />
                Create First Request
              </Button>
            </div>
          ) : (
            <div className="border-2 border-success/20 rounded-2xl overflow-hidden shadow-xl animate-slide-up">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-success/10 to-success/5">
                      <TableHead className="font-bold whitespace-nowrap">Request ID</TableHead>
                      <TableHead className="font-bold whitespace-nowrap">Amount</TableHead>
                      <TableHead className="font-bold whitespace-nowrap hidden md:table-cell">Description</TableHead>
                      <TableHead className="font-bold whitespace-nowrap">Status</TableHead>
                      <TableHead className="font-bold whitespace-nowrap hidden lg:table-cell">Expires</TableHead>
                      <TableHead className="font-bold whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request, index) => (
                      <TableRow key={request.id} className="hover:bg-success/5 transition-colors" style={{ animationDelay: `${index * 0.05}s` }}>
                        <TableCell className="font-semibold text-xs sm:text-sm">{request.request_id}</TableCell>
                        <TableCell className="font-bold whitespace-nowrap text-success">₹{request.amount.toFixed(2)}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-[200px] truncate">{request.description}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusColor(request.status)}
                            className="flex items-center gap-1.5 w-fit text-xs font-semibold rounded-lg px-3 py-1"
                          >
                            {getStatusIcon(request.status)}
                            <span className="hidden sm:inline">{request.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                          {new Date(request.expires_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => setSelectedRequest(request)}
                              className="h-9 px-3 text-xs gap-1.5"
                            >
                              <QrCode className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">QR</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyPaymentLink(request.request_id)}
                              className="h-9 px-3 text-xs gap-1.5"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Copy</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="accent"
                              onClick={() => sharePaymentRequest(request)}
                              className="h-9 px-3 text-xs gap-1.5"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Share</span>
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
    </div>
  );
};

export default PaymentReceive;