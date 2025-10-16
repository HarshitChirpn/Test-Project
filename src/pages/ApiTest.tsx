import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

const ApiTest = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();
      setResult({ type: 'health', data });
    } catch (error: any) {
      setResult({ type: 'health', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    try {
      const data = await api.post('/auth/register', {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User'
      });
      setResult({ type: 'register', data });
    } catch (error: any) {
      setResult({ type: 'register', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      setResult({ type: 'login', data });
    } catch (error: any) {
      setResult({ type: 'login', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={testHealth} disabled={loading}>
              Test Health
            </Button>
            <Button onClick={testRegister} disabled={loading}>
              Test Register
            </Button>
            <Button onClick={testLogin} disabled={loading}>
              Test Login
            </Button>
          </div>
          
          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Result ({result.type}):</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTest;
