import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Camera, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ScanQR() {
  const navigate = useNavigate();
  const { transactions, currentUser, updateTransaction } = useApp();
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleManualVerify = () => {
    if (!manualCode.trim()) {
      toast.error('Please enter a code');
      return;
    }

    // Find transaction by QR code
    const transaction = transactions.find(
      t => t.qrBorrower === manualCode || t.qrProvider === manualCode
    );

    if (!transaction) {
      toast.error('Invalid QR code');
      return;
    }

    const isBorrowerCode = transaction.qrBorrower === manualCode;
    const isProviderCode = transaction.qrProvider === manualCode;

    if (transaction.status === 'pending') {
      // Activate transaction
      updateTransaction(transaction.id, { status: 'active' });
      toast.success('Transaction activated! Item handover confirmed.');
      navigate(`/transaction/${transaction.id}`);
    } else if (transaction.status === 'active' && currentUser?.id === transaction.providerId) {
      // Mark as returned
      updateTransaction(transaction.id, { 
        status: 'completed',
        returnDate: new Date(),
      });
      toast.success('Item return confirmed! Processing refund...');
      navigate(`/transaction/${transaction.id}/return`);
    } else {
      toast.info('Transaction already processed');
    }
  };

  const handleScanClick = () => {
    setScanning(true);
    toast.info('Camera scanning would open here in a real app');
    
    // Simulate scan after 2 seconds
    setTimeout(() => {
      setScanning(false);
      toast.info('Use manual code entry for demo');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">Scan QR Code</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Camera Scan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                {scanning ? (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                      <p>Scanning...</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <p>Camera preview</p>
                  </div>
                )}
              </div>

              <Button className="w-full" size="lg" onClick={handleScanClick} disabled={scanning}>
                <Camera className="mr-2 h-4 w-4" />
                {scanning ? 'Scanning...' : 'Start Camera Scan'}
              </Button>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Manual Code Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the QR code manually if scanning doesn't work
              </p>
              
              <Input 
                placeholder="nearshare://borrower/txn-xxx or nearshare://provider/txn-xxx"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />

              <Button className="w-full" onClick={handleManualVerify}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verify Code
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">How to use:</p>
                <p>• <strong>Handover</strong>: Both parties scan each other's QR codes to activate the transaction</p>
                <p>• <strong>Return</strong>: Provider scans borrower's code again to mark item as returned</p>
                <p>• Both QR codes must be verified for security</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
