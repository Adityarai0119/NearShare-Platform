import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Package, DollarSign, Wallet, TrendingUp, Eye, ShoppingBag, Plus } from 'lucide-react';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { currentUser, items, transactions } = useApp();

  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  const myItems = items.filter(item => item.providerId === currentUser.id && item.status !== 'removed');
  const myTransactions = transactions.filter(t => t.providerId === currentUser.id);
  const completedTransactions = myTransactions.filter(t => t.status === 'completed');
  
  const totalEarnings = completedTransactions.reduce((sum, t) => sum + t.providerFee, 0);
  const totalViews = myItems.reduce((sum, item) => sum + item.views, 0);
  const totalBorrows = myItems.reduce((sum, item) => sum + item.totalBorrows, 0);
  const activeListings = myItems.filter(item => item.status === 'active').length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Provider Dashboard</h1>
            <p className="text-muted-foreground">Manage your listings and track earnings</p>
          </div>
          <Button onClick={() => navigate('/list-item')}>
            <Plus className="mr-2 h-4 w-4" />
            List New Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Provider Wallet</p>
                  <p className="text-3xl font-bold text-primary">${currentUser.providerWallet.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-3xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Listings</p>
                  <p className="text-3xl font-bold">{activeListings}</p>
                </div>
                <div className="p-3 bg-accent/20 rounded-full">
                  <Package className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-3xl font-bold">{totalViews}</p>
                </div>
                <div className="p-3 bg-secondary rounded-full">
                  <Eye className="h-6 w-6 text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-listings')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                My Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">View and manage all your listed items</p>
              <div className="flex justify-between text-sm">
                <span>Total Items: {myItems.length}</span>
                <span>Borrowed: {myItems.filter(i => i.status === 'borrowed').length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/earnings')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                My Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Track your earnings and revenue breakdown</p>
              <div className="flex justify-between text-sm">
                <span>Completed: {completedTransactions.length}</span>
                <span>Total: ${totalEarnings.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/withdraw')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Withdraw Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Transfer earnings to your bank account</p>
              <div className="flex justify-between text-sm">
                <span>Available: ${currentUser.providerWallet.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {myTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {myTransactions.slice(0, 5).map(transaction => {
                  const item = items.find(i => i.id === transaction.itemId);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <ShoppingBag className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item?.title || 'Unknown Item'}</p>
                          <p className="text-sm text-muted-foreground capitalize">{transaction.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+${transaction.providerFee.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
