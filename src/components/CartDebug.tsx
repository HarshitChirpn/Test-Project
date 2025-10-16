import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CartDebug: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, error: cartError, refreshCart } = useCart();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testCartAPI = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Auth Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('Cart API Response:', data);
      setDebugInfo({
        status: response.status,
        data: data,
        token: token ? 'Present' : 'Missing'
      });
    } catch (error) {
      console.error('Cart API Error:', error);
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        token: localStorage.getItem('authToken') ? 'Present' : 'Missing'
      });
    }
  };

  const testAddToCart = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const testItem = {
        serviceId: 'test-service-1',
        title: 'Test Service',
        description: 'This is a test service',
        price: 100,
        amount: '$100',
        icon: '🧪',
        category: 'test',
        serviceType: 'individual',
        quantity: 1
      };

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testItem),
      });
      
      const data = await response.json();
      console.log('Add to Cart API Response:', data);
      setDebugInfo({
        action: 'Add to Cart',
        status: response.status,
        data: data,
        token: token ? 'Present' : 'Missing'
      });
    } catch (error) {
      console.error('Add to Cart API Error:', error);
      setDebugInfo({
        action: 'Add to Cart',
        error: error instanceof Error ? error.message : 'Unknown error',
        token: localStorage.getItem('authToken') ? 'Present' : 'Missing'
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Cart Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Authentication Status:</h3>
            <p>Loading: {authLoading ? 'Yes' : 'No'}</p>
            <p>User: {user ? `${user.email || user.name || 'Logged in'}` : 'Not logged in'}</p>
            <p>Token: {localStorage.getItem('authToken') ? 'Present' : 'Missing'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Cart Status:</h3>
            <p>Loading: {cartLoading ? 'Yes' : 'No'}</p>
            <p>Error: {cartError || 'None'}</p>
            <p>Items: {cart?.items?.length || 0}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={testCartAPI} variant="outline">
            Test Cart API
          </Button>
          <Button onClick={testAddToCart} variant="outline">
            Test Add to Cart
          </Button>
          <Button onClick={refreshCart} variant="outline">
            Refresh Cart
          </Button>
        </div>

        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Response:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CartDebug;
