import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Copy, X, IndianRupee, Sparkles, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface PaymentRequest {
  id: string;
  request_id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  requester_email?: string;
  requester_phone?: string;
  expires_at: string;
  created_at: string;
}

interface QRCodeGeneratorProps {
  paymentRequest: PaymentRequest;
  onClose: () => void;
}

const QRCodeGenerator = ({ paymentRequest, onClose }: QRCodeGeneratorProps) => {
  const { toast } = useToast();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [paymentLink, setPaymentLink] = useState<string>('');

  useEffect(() => {
    generateQRCode();
  }, [paymentRequest]);

  const generateQRCode = async () => {
    try {
      const link = `${window.location.origin}/pay/${paymentRequest.request_id}`;
      setPaymentLink(link);

      const upiUrl = `upi://pay?pa=merchant@paytm&pn=PaymentHub&am=${paymentRequest.amount}&cu=INR&tn=${encodeURIComponent(paymentRequest.description)}&mc=0000&tr=${paymentRequest.request_id}`;
      const qrData = `${link}?upi=${encodeURIComponent(upiUrl)}`;
      
      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataUrl(qrCodeUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.download = `payment-qr-${paymentRequest.request_id}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "QR Code Downloaded! 📥",
      description: "QR code saved to your device",
    });
  };

  const copyPaymentLink = () => {
    navigator.clipboard.writeText(paymentLink);
    toast({
      title: "Link Copied! 📋",
      description: "Payment link copied to clipboard",
    });
  };

  const sharePaymentRequest = () => {
    const message = `Payment Request: ₹${paymentRequest.amount}\n${paymentRequest.description}\n\nPay now: ${paymentLink}`;
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

  return (
    <Card className="border-2 border-success/30 bg-gradient-to-br from-white to-success/10 shadow-2xl overflow-hidden animate-scale-in">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-success opacity-10 rounded-full -mr-16 -mt-16"></div>
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-2 top-2 h-9 w-9 p-0 hover:bg-destructive/10 rounded-xl"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardTitle className="flex items-center gap-3 pr-10">
          <div className="p-3 bg-gradient-success rounded-2xl shadow-lg shadow-success/30">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Payment QR Code</h3>
            <p className="text-sm text-muted-foreground font-normal">Scan to pay instantly</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative">
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl">
            <span className="text-sm text-muted-foreground font-medium">Request ID:</span>
            <span className="font-bold text-sm">{paymentRequest.request_id}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gradient-success rounded-2xl shadow-lg">
            <span className="text-white font-semibold">Amount:</span>
            <span className="text-2xl font-bold text-white">₹{paymentRequest.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl">
            <span className="text-sm text-muted-foreground font-medium">Status:</span>
            <Badge variant={paymentRequest.status === 'pending' ? 'secondary' : 'default'} className="font-semibold rounded-lg px-3">
              {paymentRequest.status}
            </Badge>
          </div>
          {paymentRequest.description && (
            <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20">
              <p className="text-xs text-muted-foreground mb-1 font-semibold">Description</p>
              <p className="text-sm font-medium">{paymentRequest.description}</p>
            </div>
          )}
        </div>

        <div className="flex justify-center animate-bounce-in">
          <div className="p-5 bg-white rounded-3xl shadow-2xl border-4 border-success/20">
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="Payment QR Code" className="w-56 h-56 sm:w-72 sm:h-72" />
            ) : (
              <div className="w-56 h-56 sm:w-72 sm:h-72 bg-muted/50 rounded-2xl flex items-center justify-center">
                <div className="animate-spin-slow">
                  <Sparkles className="h-8 w-8 text-success" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-2xl border-2 border-success/20">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-success" />
            How to pay:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-success font-bold">•</span>
              <span>Open any UPI app (PhonePe, Google Pay, Paytm)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success font-bold">•</span>
              <span>Scan this QR code with your camera</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success font-bold">•</span>
              <span>Verify the amount and complete payment</span>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button onClick={downloadQRCode} variant="outline" className="gap-2 h-12 rounded-xl">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button onClick={copyPaymentLink} variant="outline" className="gap-2 h-12 rounded-xl">
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button onClick={sharePaymentRequest} variant="success" className="gap-2 h-12 rounded-xl">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;