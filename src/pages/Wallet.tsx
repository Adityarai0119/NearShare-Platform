import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Wallet as WalletIcon, Plus, ArrowUpRight, History, Loader2, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Wallet() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [processing, setProcessing] = useState(false);

  // 1. Fetch Current Balance
  const fetchBalance = () => {
    if (!currentUser) return;
    fetch(`http://localhost:8080/api/wallet/${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        setBalance(data.balance || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth'); 
      return;
    }
    fetchBalance();
  }, [currentUser, navigate]);

  // 2. Handle Add Money
  const handleAddMoney = async () => {
    const amount = parseFloat(amountToAdd);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setProcessing(true);

    try {
      // SIMULATE PAYMENT GATEWAY DELAY (e.g., Razorpay)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call Backend to Add Money
      const res = await fetch('http://localhost:8080/api/wallet/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          amount: amount
        })
      });

      if (res.ok) {
        toast.success(`Successfully added ₹${amount} to wallet!`);
        setAmountToAdd('');
        fetchBalance(); // Refresh balance
      } else {
        toast.error("Failed to add money");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection failed");
    } finally {
      setProcessing(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <WalletIcon className="w-8 h-8 text-blue-600" /> My Wallet
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* LEFT: Balance & Add Money */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Balance Card */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none shadow-lg">
              <CardContent className="p-8">
                <p className="text-blue-100 font-medium mb-1 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Available Balance
                </p>
                {loading ? (
                  <Loader2 className="animate-spin h-10 w-10 mt-2" />
                ) : (
                  <h2 className="text-5xl font-bold tracking-tight">₹ {balance.toLocaleString()}</h2>
                )}
                <p className="text-sm text-blue-200 mt-4 opacity-80">
                   Use this balance to rent items securely.
                </p>
              </CardContent>
            </Card>

            {/* Add Money Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-green-600" /> Add Money
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-sm font-medium text-gray-700">Enter Amount (₹)</label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 500" 
                      className="text-lg h-12"
                      value={amountToAdd}
                      onChange={(e) => setAmountToAdd(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="h-12 px-8 bg-green-600 hover:bg-green-700 text-lg w-full md:w-auto"
                    onClick={handleAddMoney}
                    disabled={processing}
                  >
                    {processing ? <Loader2 className="animate-spin mr-2" /> : <ArrowUpRight className="mr-2 h-5 w-5" />}
                    {processing ? "Processing..." : "Add Funds"}
                  </Button>
                </div>
                
                {/* Quick Add Buttons */}
                <div className="flex gap-2 mt-4">
                    {[100, 500, 1000, 2000].map(amt => (
                        <Button 
                            key={amt} 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full text-xs"
                            onClick={() => setAmountToAdd(amt.toString())}
                        >
                            + ₹{amt}
                        </Button>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Transaction History (Static/Mock for now) */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock History Items */}
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                        <p className="font-medium text-sm">Wallet Top-up</p>
                        <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                    <span className="text-green-600 font-bold text-sm">+ ₹{amountToAdd || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-b pb-2 opacity-50">
                    <div>
                        <p className="font-medium text-sm">Rent: DSLR Camera</p>
                        <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                    <span className="text-red-500 font-bold text-sm">- ₹500</span>
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-xs text-muted-foreground">Only recent transactions shown.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}