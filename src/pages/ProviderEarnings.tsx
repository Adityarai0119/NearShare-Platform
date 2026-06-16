import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, TrendingUp, DollarSign, Percent, Package } from 'lucide-react';

export default function ProviderEarnings() {
  const navigate = useNavigate();
  const { currentUser, items, transactions } = useApp();
  const [timeFilter, setTimeFilter] = useState('all');

  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  const myTransactions = transactions.filter(t => t.providerId === currentUser.id);
  const completedTransactions = myTransactions.filter(t => t.status === 'completed');

  // Filter by time
  const filterByTime = (txns: typeof completedTransactions) => {
    const now = new Date();
    switch (timeFilter) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return txns.filter(t => new Date(t.startDate) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return txns.filter(t => new Date(t.startDate) >= monthAgo);
      default:
        return txns;
    }
  };

  const filteredTransactions = filterByTime(completedTransactions);
  
  const totalDeposits = filteredTransactions.reduce((sum, t) => sum + t.depositPaid, 0);
  const totalProviderEarnings = filteredTransactions.reduce((sum, t) => sum + t.providerFee, 0);
  const totalPlatformFees = filteredTransactions.reduce((sum, t) => sum + t.platformFee, 0);

  // Earnings per item
  const earningsPerItem = items
    .filter(item => item.providerId === currentUser.id)
    .map(item => {
      const itemTransactions = filteredTransactions.filter(t => t.itemId === item.id);
      const earnings = itemTransactions.reduce((sum, t) => sum + t.providerFee, 0);
      const borrows = itemTransactions.length;
      return { ...item, earnings, borrows };
    })
    .filter(item => item.earnings > 0)
    .sort((a, b) => b.earnings - a.earnings);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Earnings</h1>
            <p className="text-muted-foreground">Track your revenue and earnings breakdown</p>
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Your Earnings</p>
                  <p className="text-3xl font-bold">${totalProviderEarnings.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-10 w-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Deposits</p>
                  <p className="text-3xl font-bold">${totalDeposits.toFixed(2)}</p>
                </div>
                <DollarSign className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Fees</p>
                  <p className="text-3xl font-bold">${totalPlatformFees.toFixed(2)}</p>
                </div>
                <Percent className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Earnings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Total Deposits Collected</span>
                <span className="font-semibold">${totalDeposits.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Platform Fee (10%)</span>
                <span className="font-semibold text-red-500">-${totalPlatformFees.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Refunds to Borrowers</span>
                <span className="font-semibold text-red-500">-${(totalDeposits - totalProviderEarnings - totalPlatformFees).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2 text-lg">
                <span className="font-medium">Net Earnings</span>
                <span className="font-bold text-green-600">${totalProviderEarnings.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings per Item */}
        <Card>
          <CardHeader>
            <CardTitle>Earnings by Item</CardTitle>
          </CardHeader>
          <CardContent>
            {earningsPerItem.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No earnings yet</p>
            ) : (
              <div className="space-y-4">
                {earningsPerItem.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.borrows} borrow(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${item.earnings.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">earned</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center">
          <Button onClick={() => navigate('/withdraw')}>
            Withdraw Funds
          </Button>
        </div>
      </div>
    </div>
  );
}
