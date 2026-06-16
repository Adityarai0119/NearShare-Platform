import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, History, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function WithdrawalHistory() {
  const navigate = useNavigate();
  const { currentUser, withdrawals } = useApp();

  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  const myWithdrawals = withdrawals
    .filter(w => w.userId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalWithdrawn = myWithdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + w.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <History className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Withdrawal History</h1>
            <p className="text-muted-foreground">Track all your withdrawal requests</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                <p className="text-3xl font-bold text-primary">${totalWithdrawn.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-semibold">{myWithdrawals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            {myWithdrawals.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">No withdrawals yet</p>
                <Button onClick={() => navigate('/withdraw')}>Make a Withdrawal</Button>
              </div>
            ) : (
              <div className="space-y-1">
                {myWithdrawals.map((withdrawal, index) => (
                  <div key={withdrawal.id}>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-secondary rounded-full">
                          {getStatusIcon(withdrawal.status)}
                        </div>
                        <div>
                          <p className="font-medium">${withdrawal.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(withdrawal.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(withdrawal.status)}
                        <p className="text-xs text-muted-foreground mt-1">{withdrawal.upiId}</p>
                      </div>
                    </div>
                    {index < myWithdrawals.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
