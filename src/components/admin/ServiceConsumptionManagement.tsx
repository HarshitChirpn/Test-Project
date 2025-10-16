import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { serviceConsumptionService, ServiceConsumption, ServiceConsumptionFilters, ServiceConsumptionStats } from '@/services/serviceConsumptionService';
import {
  RefreshCw,
  Search,
  Download,
  Eye,
  Trash2,
  Clock,
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  Calendar,
  User,
  Play,
  Pause,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ServiceConsumptionManagement = () => {
  const { toast } = useToast();
  const [consumptions, setConsumptions] = useState<ServiceConsumption[]>([]);
  const [stats, setStats] = useState<ServiceConsumptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState<ServiceConsumptionFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [selectedConsumption, setSelectedConsumption] = useState<ServiceConsumption | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchConsumptions();
    fetchStats();
  }, [filters]);

  const fetchConsumptions = async () => {
    try {
      setLoading(true);
      const response = await serviceConsumptionService.getAllServiceConsumptions(filters);
      setConsumptions(response.data.consumptions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching service consumptions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch service consumptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await serviceConsumptionService.getServiceConsumptionStats();
      setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching service consumption stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch service consumption statistics",
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ServiceConsumptionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleUpdateStatus = async (consumptionId: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to change the status of this consumption to "${newStatus}"?`)) {
      return;
    }
    try {
      await serviceConsumptionService.updateServiceConsumption(consumptionId, { status: newStatus as any });
      toast({
        title: "Success",
        description: "Service consumption status updated successfully",
      });
      fetchConsumptions();
      fetchStats();
    } catch (error) {
      console.error('Error updating service consumption status:', error);
      toast({
        title: "Error",
        description: "Failed to update service consumption status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConsumption = async (consumptionId: string) => {
    if (!window.confirm("Are you sure you want to delete this service consumption record? This action cannot be undone.")) {
      return;
    }
    try {
      await serviceConsumptionService.deleteServiceConsumption(consumptionId);
      toast({
        title: "Success",
        description: "Service consumption record deleted successfully",
      });
      fetchConsumptions();
      fetchStats();
    } catch (error) {
      console.error('Error deleting service consumption:', error);
      toast({
        title: "Error",
        description: "Failed to delete service consumption record",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (consumption: ServiceConsumption) => {
    setSelectedConsumption(consumption);
    setShowDetailsModal(true);
  };

  const exportConsumptions = async () => {
    try {
      // For now, just show a message. In a real implementation, you'd generate a CSV
      toast({
        title: "Export",
        description: "Export functionality will be implemented soon",
      });
    } catch (error) {
      console.error('Error exporting consumptions:', error);
      toast({
        title: "Error",
        description: "Failed to export service consumptions",
        variant: "destructive",
      });
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Consumptions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConsumptions}</div>
              <p className="text-xs text-muted-foreground">
                All time records
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Consumptions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeConsumptions}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedConsumptions}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paused</CardTitle>
              <Pause className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pausedConsumptions}</div>
              <p className="text-xs text-muted-foreground">
                Temporarily paused
              </p>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user, service..."
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.sortBy || 'createdAt'}
          onValueChange={(value) => handleFilterChange('sortBy', value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="startDate">Start Date</SelectItem>
            <SelectItem value="serviceName">Service Name</SelectItem>
            <SelectItem value="userName">User Name</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={exportConsumptions} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button onClick={fetchConsumptions} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Consumptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Consumptions</CardTitle>
          <CardDescription>Track and manage service usage across all users.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading consumptions...</span>
            </div>
          ) : consumptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No service consumptions found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consumptions.map((consumption) => (
                      <TableRow key={consumption._id}>
                        <TableCell>
                          <div className="font-medium">{consumption.userName || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{consumption.userEmail}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{consumption.serviceName}</div>
                          <div className="text-sm text-muted-foreground">{consumption.serviceCategory}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={serviceConsumptionService.getConsumptionTypeColor(consumption.consumptionType)}>
                            {consumption.consumptionType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {serviceConsumptionService.formatDuration(consumption.duration)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={consumption.status}
                            onValueChange={(value) => handleUpdateStatus(consumption._id, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {new Date(consumption.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(consumption)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteConsumption(consumption._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-end items-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Consumption Details Modal */}
      {selectedConsumption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Service Consumption Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">User</label>
                  <p className="text-sm">{selectedConsumption.userName} ({selectedConsumption.userEmail})</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Service</label>
                  <p className="text-sm">{selectedConsumption.serviceName} - {selectedConsumption.serviceCategory}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <Badge className={serviceConsumptionService.getConsumptionTypeColor(selectedConsumption.consumptionType)}>
                    {selectedConsumption.consumptionType}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge className={serviceConsumptionService.getStatusColor(selectedConsumption.status)}>
                    {selectedConsumption.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="text-sm">{serviceConsumptionService.formatDuration(selectedConsumption.duration)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p className="text-sm">{selectedConsumption.quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <p className="text-sm">{new Date(selectedConsumption.startDate).toLocaleString()}</p>
                </div>
                {selectedConsumption.endDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Date</label>
                    <p className="text-sm">{new Date(selectedConsumption.endDate).toLocaleString()}</p>
                  </div>
                )}
              </div>
              {selectedConsumption.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedConsumption.notes}</p>
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceConsumptionManagement;
