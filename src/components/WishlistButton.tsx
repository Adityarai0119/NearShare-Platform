import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  itemId: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
}

export function WishlistButton({ itemId, size = 'icon', variant = 'ghost', className }: WishlistButtonProps) {
  const { currentUser, addToWishlist, removeFromWishlist } = useApp();
  
  const isInWishlist = currentUser?.wishlist.includes(itemId) ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUser) {
      toast.error('Please login to save items');
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(itemId);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(itemId);
      toast.success('Added to wishlist');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        'transition-all',
        isInWishlist && 'text-red-500 hover:text-red-600',
        className
      )}
    >
      <Heart className={cn('h-5 w-5', isInWishlist && 'fill-current')} />
    </Button>
  );
}
