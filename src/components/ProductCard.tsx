import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Check } from 'lucide-react';
import { useProducts, StripeProduct } from '@/contexts/ProductsContext';

interface ProductCardProps {
  product: StripeProduct;
  onPurchase: (priceId: string, productName: string) => void;
  loading?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPurchase, loading }) => {
  const { getProductPrice, formatPrice } = useProducts();
  const price = getProductPrice(product.id);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'tax-services': 'bg-blue-100 text-blue-800',
      'consulting': 'bg-green-100 text-green-800',
      'accounting': 'bg-purple-100 text-purple-800',
      'membership': 'bg-orange-100 text-orange-800',
      'default': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.default;
  };

  const handlePurchase = () => {
    if (price) {
      onPurchase(price.id, product.name);
    }
  };

  return (
    <Card className="relative bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-brand-yellow/20 transition-all duration-500 group overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Category Badge */}
        <div className="mb-4">
          <Badge 
            className={`${getCategoryColor(product.metadata.category || 'default')} border-0`}
          >
            {product.metadata.category?.replace('-', ' ').toUpperCase() || 'SERVICE'}
          </Badge>
        </div>

        {/* Product Name */}
        <h3 className="text-xl font-bold mb-3 text-foreground leading-tight">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Features (you can customize this based on your needs) */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Professional Service</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Expert Support</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Secure & Reliable</span>
          </div>
        </div>

        {/* Price and Purchase Button */}
        <div className="flex items-center justify-between">
          <div>
            {price && (
              <div className="text-3xl font-bold text-foreground">
                {formatPrice(price.unit_amount, price.currency)}
              </div>
            )}
            {price?.type === 'recurring' && (
              <div className="text-sm text-muted-foreground">
                /{price.recurring?.interval || 'month'}
              </div>
            )}
          </div>
          
          <Button
            onClick={handlePurchase}
            disabled={loading || !price}
            className="bg-brand-yellow text-brand-black hover:bg-yellow-400 px-6 py-2 font-semibold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Purchase
              </div>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;