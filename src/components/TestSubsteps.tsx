import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { projectWorkflowService } from '@/services/projectWorkflowService';
import { mongodbUserService } from '@/services/mongodbUserService';

const TestSubsteps = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('=== TESTING SUBSTEPS API ===');
      console.log('User:', user);
      console.log('Auth token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
      
      // Test 1: Get all users
      console.log('\n1. Testing getAllUsers...');
      const usersResult = await mongodbUserService.getAllUsers();
      console.log('Users result:', usersResult);
      setUsers(usersResult);
      
      // Test 2: Get all projects
      console.log('\n2. Testing getAllProjects...');
      const projectsResult = await projectWorkflowService.getAllProjects();
      console.log('Projects result:', projectsResult);
      setProjects(projectsResult.projects || []);
      
      console.log('\n✅ All tests completed successfully!');
      
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      setError(error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Substeps API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>User:</strong> {user?.email || 'Not logged in'}</p>
            <p><strong>Role:</strong> {user?.role || 'Unknown'}</p>
            <p><strong>Auth Token:</strong> {localStorage.getItem('authToken') ? 'Present' : 'Missing'}</p>
          </div>
          
          <Button onClick={testAPI} disabled={loading}>
            {loading ? 'Testing...' : 'Test API Calls'}
          </Button>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800"><strong>Error:</strong> {error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Users ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length > 0 ? (
                  <div className="space-y-2">
                    {users.slice(0, 3).map((user: any) => (
                      <div key={user._id} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">{user.name || user.email}</p>
                        <p className="text-sm text-gray-600">Role: {user.role}</p>
                      </div>
                    ))}
                    {users.length > 3 && (
                      <p className="text-sm text-gray-500">+{users.length - 3} more users</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No users loaded</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Projects ({projects.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length > 0 ? (
                  <div className="space-y-2">
                    {projects.slice(0, 3).map((project: any) => (
                      <div key={project._id} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">{project.projectName}</p>
                        <p className="text-sm text-gray-600">Phase: {project.currentPhase}</p>
                        <p className="text-sm text-gray-600">Progress: {project.progress?.overall || 0}%</p>
                      </div>
                    ))}
                    {projects.length > 3 && (
                      <p className="text-sm text-gray-500">+{projects.length - 3} more projects</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No projects loaded</p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestSubsteps;
