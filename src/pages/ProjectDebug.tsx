import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/contexts/ProjectContext';
import { projectService } from '@/services/projectService';
import { api } from '@/lib/api';

const ProjectDebug: React.FC = () => {
  const { user } = useAuth();
  const { projects, stats, loading, error } = useProjects();
  const [directApiTest, setDirectApiTest] = useState<any>(null);
  const [serviceTest, setServiceTest] = useState<any>(null);
  const [loginTest, setLoginTest] = useState<any>(null);

  useEffect(() => {
    const testDirectApi = async () => {
      if (!user?._id) return;
      
      try {
        console.log('🧪 Testing direct API call...');
        const result = await api.get(`/projects/user/${user._id}`);
        console.log('✅ Direct API result:', result);
        setDirectApiTest(result);
      } catch (error) {
        console.error('❌ Direct API error:', error);
        setDirectApiTest({ error: error.message });
      }
    };

    const testService = async () => {
      if (!user?._id) return;
      
      try {
        console.log('🧪 Testing project service...');
        const result = await projectService.getUserProjects(user._id);
        console.log('✅ Service result:', result);
        setServiceTest(result);
      } catch (error) {
        console.error('❌ Service error:', error);
        setServiceTest({ error: error.message });
      }
    };

    testDirectApi();
    testService();
  }, [user?._id]);

  const testLogin = async () => {
    try {
      console.log('🧪 Testing login...');
      const result = await api.post('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Login result:', result);
      setLoginTest(result);
      
      // Store token and reload page to test auth
      if (result.success && result.data.token) {
        localStorage.setItem('authToken', result.data.token);
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setLoginTest({ error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Project Debug Page</h1>
        
        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <div className="space-y-4">
            <div>
              <strong>User:</strong> {user ? 'Authenticated' : 'Not authenticated'}
            </div>
            <div>
              <strong>Auth Token:</strong> {localStorage.getItem('authToken') ? 'Present' : 'Missing'}
            </div>
            <div>
              <strong>Token Value:</strong> {localStorage.getItem('authToken')?.substring(0, 50)}...
            </div>
          </div>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mt-4">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Project Context */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Project Context</h2>
          <div className="space-y-4">
            <div>
              <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Error:</strong> {error || 'None'}
            </div>
            <div>
              <strong>Projects Count:</strong> {projects.length}
            </div>
            <div>
              <strong>Stats:</strong>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mt-2">
                {JSON.stringify(stats, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Projects:</strong>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mt-2">
                {JSON.stringify(projects, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Direct API Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Direct API Test</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(directApiTest, null, 2)}
          </pre>
        </div>

        {/* Service Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Service Test</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(serviceTest, null, 2)}
          </pre>
        </div>

        {/* Login Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Login Test</h2>
          <button 
            onClick={testLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
          >
            Test Login
          </button>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(loginTest, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ProjectDebug;
