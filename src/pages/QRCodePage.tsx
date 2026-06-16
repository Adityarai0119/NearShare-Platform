import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Download, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function QRCodePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, items, currentUser } = useApp();

  const transaction = transactions.find(t => t.id === id);
  const item = transaction ? items.find(i => i.id === transaction.itemId) : null;

  if (!transaction || !item || !currentUser) {
    navigate('/browse');
    return null;
  }

  const isBorrower = transaction.borrowerId === currentUser.id;
  const isProvider = transaction.providerId === currentUser.id;
  const qrCode = isBorrower ? transaction.qrBorrower : transaction.qrProvider;
  const role = isBorrower ? 'Borrower' : 'Provider';

  const handleDownload = () => {
    toast.success('QR Code downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <div className="text-center">
            <Badge className="mb-4" variant={transaction.status === 'pending' ? 'default' : 'secondary'}>
              {transaction.status}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">Your QR Code</h1>
            <p className="text-muted-foreground">Role: <span className="font-semibold text-foreground">{role}</span></p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">Transaction ID: {transaction.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <QRCodeSVG 
                    value={qrCode} 
                    size={256}
                    level="H"
                    includeMargin
                  />
                </div>

                <div className="text-center space-y-2">
                  <p className="font-medium">Transaction Code</p>
                  <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded">
                    {qrCode}
                  </p>
                </div>

                <Button variant="outline" className="w-full" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Next Steps
                </h3>
                
                {isBorrower ? (
                  <div className="space-y-2 text-sm">
                    <p>1. <strong>Meet the provider</strong> at the agreed location</p>
                    <p>2. <strong>Show your QR code</strong> to the provider for scanning</p>
                    <p>3. <strong>Provider will scan</strong> their QR code for you to verify</p>
                    <p>4. <strong>Both codes must be scanned</strong> to activate the transaction</p>
                    <p>5. Once scanned, you can take the item!</p>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p>1. <strong>Meet the borrower</strong> at the agreed location</p>
                    <p>2. <strong>Scan borrower's QR code</strong> to verify their identity</p>
                    <p>3. <strong>Show your QR code</strong> to the borrower for scanning</p>
                    <p>4. <strong>Both codes must be scanned</strong> to activate the transaction</p>
                    <p>5. Hand over the item once verification is complete</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/scan')}>
              Scan QR Code
            </Button>
            <Button className="flex-1" onClick={() => navigate(`/transaction/${transaction.id}`)}>
              View Transaction
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
