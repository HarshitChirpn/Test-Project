import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  CreditCard,
  Package,
  AlertCircle,
  MessageCircle
} from "lucide-react";
import { cartService } from "@/services/cartService";
import Footer from "@/components/Footer";

const Cart = () => {
  const { cart, loading, error, removeFromCart, updateItemQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();

  // Handle quantity change
  const handleQuantityChange = async (serviceId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(serviceId);
    } else {
      await updateItemQuantity(serviceId, newQuantity);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    // For now, redirect to contact page for custom quote
    // In the future, this could integrate with Stripe checkout
    window.location.href = "/getmvp/contact";
  };

  // Handle contact for quote
  const handleContactForQuote = (serviceTitle: string) => {
    // Redirect to contact form with service pre-selected
    window.location.href = `/getmvp/contact?service=${encodeURIComponent(serviceTitle)}`;
  };

  // Show loading state
  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Cart</h2>
              <p className="text-gray-600">Please wait while we fetch your cart...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Cart</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/getmvp/services">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>

          {/* Empty Cart */}
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Looks like you haven't added any services to your cart yet.
              </p>
              <Link to="/getmvp/services">
                <Button className="bg-brand-yellow text-brand-black hover:bg-yellow-400">
                  Browse Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/getmvp/services">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <Badge variant="secondary" className="text-sm">
              {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={clearCart}
            disabled={loading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.serviceId} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Service Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center">
                        <div className="text-white text-2xl">
                          {item.icon}
                        </div>
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.serviceType}
                            </Badge>
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            {item.amount && item.price > 0 ? (
                              <>
                                <div className="text-2xl font-bold text-brand-yellow">
                                  {item.amount}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {cartService.formatPrice(item.price)} each
                                </div>
                              </>
                            ) : (
                              <Button
                                onClick={() => handleContactForQuote(item.title)}
                                className="bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold"
                                size="sm"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contact
                              </Button>
                            )}
                          </div>

                          {/* Quantity Controls - Only show for services with prices */}
                          {item.amount && item.price > 0 && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.serviceId, item.quantity - 1)}
                                disabled={loading}
                                className="w-8 h-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.serviceId, item.quantity + 1)}
                                disabled={loading}
                                className="w-8 h-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.serviceId)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items Count */}
                <div className="flex justify-between text-sm">
                  <span>Items ({cart.itemCount})</span>
                  <span>
                    {cart.items.some(item => item.amount && item.price > 0) 
                      ? cartService.formatPrice(cart.totalAmount)
                      : "Contact for Quote"
                    }
                  </span>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-brand-yellow">
                    {cart.items.some(item => item.amount && item.price > 0) 
                      ? cartService.formatPrice(cart.totalAmount)
                      : "Contact for Quote"
                    }
                  </span>
                </div>

                <Separator />

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold py-3"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {cart.items.some(item => item.amount && item.price > 0) 
                    ? "Proceed to Checkout" 
                    : "Contact for Quote"
                  }
                </Button>

                {/* Info */}
                <div className="text-xs text-gray-500 text-center">
                  {cart.items.some(item => item.amount && item.price > 0) ? (
                    <>
                      <p>All services are customized to your needs.</p>
                      <p>You'll receive a detailed quote after checkout.</p>
                    </>
                  ) : (
                    <>
                      <p>Services require custom pricing.</p>
                      <p>We'll contact you with a detailed quote.</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
