import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePurchasedServices } from "@/contexts/PurchasedServicesContext";
import {
  ShoppingCart,
  Package,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  ExternalLink,
  TrendingUp,
  Award,
  AlertCircle,
} from "lucide-react";

interface PurchasedServicesProps {
  showTitle?: boolean;
  maxItems?: number;
  showStats?: boolean;
}

const PurchasedServices: React.FC<PurchasedServicesProps> = ({
  showTitle = true,
  maxItems,
  showStats = true,
}) => {
  const {
    purchases,
    serviceConsumption,
    totalSpent,
    activeServices,
    completedServices,
    loading,
    error,
    formatCurrency,
    getStatusBadgeVariant,
    getPaymentStatusBadgeVariant,
    refreshPurchasedServices,
  } = usePurchasedServices();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          {showTitle && <CardTitle>My Services</CardTitle>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          {showTitle && <CardTitle>My Services</CardTitle>}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={refreshPurchasedServices} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayPurchases = maxItems ? purchases.slice(0, maxItems) : purchases;
  const displayServices = maxItems
    ? serviceConsumption.slice(0, maxItems)
    : serviceConsumption;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Spent
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Services
                  </p>
                  <p className="text-2xl font-bold">{activeServices.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-2xl font-bold">
                    {completedServices.length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Purchases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Recent Purchases
              </CardTitle>
              <CardDescription>
                Your latest service purchases and payments
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPurchasedServices}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {displayPurchases.length > 0 ? (
            <div className="space-y-4">
              {displayPurchases.map((purchase) => (
                <div key={purchase.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{purchase.productName}</h4>
                        <Badge
                          variant={getPaymentStatusBadgeVariant(
                            purchase.paymentStatus
                          )}
                        >
                          {purchase.paymentStatus}
                        </Badge>
                        <Badge variant="outline">{purchase.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {purchase.productDescription}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {purchase.purchasedAt
                            ? new Date(
                                purchase.purchasedAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          Qty: {purchase.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(
                          purchase.totalAmount,
                          purchase.currency
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {purchase.serviceType}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
              <p>No purchases found</p>
              <p className="text-sm">Your service purchases will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Consumption */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Service Status
          </CardTitle>
          <CardDescription>
            Track the status of your purchased services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayServices.length > 0 ? (
            <div className="space-y-4">
              {displayServices.map((service) => (
                <div key={service.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{service.serviceName}</h4>
                        <Badge variant={getStatusBadgeVariant(service.status)}>
                          {service.status}
                        </Badge>
                        <Badge variant="outline">
                          {service.serviceCategory}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Started:{" "}
                          {service.startDate
                            ? new Date(service.startDate).toLocaleDateString()
                            : "N/A"}
                        </div>
                        {service.endDate && (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Ended:{" "}
                            {service.endDate
                              ? new Date(service.endDate).toLocaleDateString()
                              : "N/A"}
                          </div>
                        )}
                      </div>
                      {service.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          {service.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {service.totalAmount && (
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(
                            service.totalAmount,
                            service.currency
                          )}
                        </p>
                      )}
                      <div className="flex items-center mt-2">
                        {service.status === "active" && (
                          <Clock className="h-4 w-4 text-blue-600 mr-1" />
                        )}
                        {service.status === "completed" && (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {service.serviceType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress indicator for active services */}
                  {service.status === "active" && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>In Progress</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>No active services</p>
              <p className="text-sm">
                Service status will appear here after purchase
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchasedServices;
