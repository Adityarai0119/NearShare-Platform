import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useApp } from '@/contexts/AppContext';
import { WishlistButton } from '@/components/WishlistButton';
import { Star, ArrowLeft, Heart, Bell } from 'lucide-react';

export default function Wishlist() {
  const { items, currentUser } = useApp();
  const navigate = useNavigate();

  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  const wishlistItems = items.filter(item => currentUser.wishlist.includes(item.id));
  const availableAgainItems = wishlistItems.filter(item => item.availability && item.status === 'active');
  const unavailableItems = wishlistItems.filter(item => !item.availability || item.status !== 'active');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <h1 className="text-4xl font-bold">My Wishlist</h1>
          </div>
          <p className="text-muted-foreground">Items you've saved for later</p>
        </div>

        {availableAgainItems.length > 0 && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <Bell className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>{availableAgainItems.length} item(s)</strong> in your wishlist are now available!
            </AlertDescription>
          </Alert>
        )}

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save items you're interested in by clicking the heart icon</p>
            <Button onClick={() => navigate('/browse')}>Browse Items</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map(item => {
              const isUnavailable = !item.availability || item.status !== 'active';
              
              return (
                <Card 
                  key={item.id} 
                  className={`overflow-hidden transition-shadow cursor-pointer group ${isUnavailable ? 'opacity-70' : 'hover:shadow-lg'}`}
                  onClick={() => !isUnavailable && navigate(`/item/${item.id}`)}
                >
                  <CardHeader className="p-0 relative">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className={`w-full h-full object-cover ${!isUnavailable && 'group-hover:scale-105'} transition-transform`}
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <WishlistButton itemId={item.id} className="bg-background/80 backdrop-blur-sm" />
                    </div>
                    {isUnavailable && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <Badge variant="secondary" className="text-sm">Not Available</Badge>
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {item.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-1 text-sm mb-3">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-medium">{item.rating}</span>
                      <span className="text-muted-foreground">({item.totalBorrows} borrows)</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Daily Rate</p>
                        <p className="text-lg font-bold text-primary">${item.dailyPrice}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Deposit</p>
                        <p className="text-sm font-semibold">${item.depositAmount}</p>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full" 
                      disabled={isUnavailable}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/item/${item.id}`);
                      }}
                    >
                      {isUnavailable ? 'Currently Unavailable' : 'View Details'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
