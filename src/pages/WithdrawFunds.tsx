import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Wallet, CheckCircle, History } from 'lucide-react';
import { toast } from 'sonner';

export default function WithdrawFunds() {
  const navigate = useNavigate();
  const { currentUser, withdrawFunds } = useApp();
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > currentUser.providerWallet) {
      toast.error('Insufficient balance');
      return;
    }

    if (!upiId.trim()) {
      toast.error('Please enter UPI ID or bank details');
      return;
    }

    const success = withdrawFunds(withdrawAmount, upiId);
    
    if (success) {
      setShowSuccess(true);
      setAmount('');
      setUpiId('');
    } else {
      toast.error('Withdrawal failed. Please try again.');
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Withdrawal Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your funds will be credited to your account within 2-3 business days.
              </p>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => setShowSuccess(false)}>
                  Make Another Withdrawal
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/withdrawal-history')}>
                  <History className="mr-2 h-4 w-4" />
                  View History
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/provider-dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">Withdraw Funds</h1>

        <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Available Balance</p>
                <p className="text-4xl font-bold">${currentUser.providerWallet.toFixed(2)}</p>
              </div>
              <Wallet className="h-12 w-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Withdraw</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  max={currentUser.providerWallet}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[25, 50, 100].map(val => (
                  <Button
                    key={val}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(Math.min(val, currentUser.providerWallet).toString())}
                    disabled={currentUser.providerWallet < val}
                  >
                    ${val}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(currentUser.providerWallet.toString())}
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upi">UPI ID / Bank Details</Label>
              <Input
                id="upi"
                placeholder="yourname@upi or Bank Account"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your UPI ID or bank account details for transfer
              </p>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleWithdraw}
              disabled={!amount || !upiId || parseFloat(amount) <= 0}
            >
              Withdraw ${amount || '0.00'}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => navigate('/withdrawal-history')}>
            <History className="mr-2 h-4 w-4" />
            View Withdrawal History
          </Button>
        </div>
      </div>
    </div>
  );
}
