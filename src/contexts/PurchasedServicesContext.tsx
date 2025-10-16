import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  purchasedServicesService,
  PurchasedService,
  ServiceConsumption,
  UserPurchasedServicesData,
} from "@/services/purchasedServicesService";

interface PurchasedServicesContextType {
  // Data
  purchases: PurchasedService[];
  serviceConsumption: ServiceConsumption[];
  totalSpent: number;
  activeServices: ServiceConsumption[];
  completedServices: ServiceConsumption[];
  servicesByCategory: Record<string, ServiceConsumption[]>;

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  refreshPurchasedServices: () => Promise<void>;
  getTotalSpent: () => number;
  getActiveServices: () => ServiceConsumption[];
  getCompletedServices: () => ServiceConsumption[];
  getServicesByCategory: () => Record<string, ServiceConsumption[]>;
  formatCurrency: (amount: number, currency?: string) => string;
  getStatusBadgeVariant: (
    status: string
  ) => "default" | "secondary" | "destructive" | "outline";
  getPaymentStatusBadgeVariant: (
    paymentStatus: string
  ) => "default" | "secondary" | "destructive" | "outline";
}

const PurchasedServicesContext = createContext<
  PurchasedServicesContextType | undefined
>(undefined);

interface PurchasedServicesProviderProps {
  children: ReactNode;
}

export const PurchasedServicesProvider: React.FC<
  PurchasedServicesProviderProps
> = ({ children }) => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchasedService[]>([]);
  const [serviceConsumption, setServiceConsumption] = useState<
    ServiceConsumption[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPurchasedServices = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await purchasedServicesService.getUserPurchasedServices(
        user._id
      );

      setPurchases(data.purchases);
      setServiceConsumption(data.serviceConsumption);
    } catch (err) {
      console.error("Error loading purchased services:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load purchased services"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPurchasedServices();
    } else {
      setPurchases([]);
      setServiceConsumption([]);
      setLoading(false);
    }
  }, [user]);

  const refreshPurchasedServices = async () => {
    await loadPurchasedServices();
  };

  // Computed values
  const totalSpent = purchases.reduce((sum, purchase) => {
    return sum + (purchase.paymentStatus === 'paid' ? purchase.totalAmount : 0);
  }, 0);
  
  const activeServices = serviceConsumption.filter(service => service.status === 'active');
  const completedServices = serviceConsumption.filter(service => service.status === 'completed');
  
  const servicesByCategory = serviceConsumption.reduce((acc, service) => {
    const category = service.serviceCategory || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, ServiceConsumption[]>);

  const contextValue: PurchasedServicesContextType = {
    // Data
    purchases,
    serviceConsumption,
    totalSpent,
    activeServices,
    completedServices,
    servicesByCategory,

    // Loading states
    loading,
    error,

    // Actions
    refreshPurchasedServices,
    getTotalSpent: () => totalSpent,
    getActiveServices: () => activeServices,
    getCompletedServices: () => completedServices,
    getServicesByCategory: () => servicesByCategory,
    formatCurrency: purchasedServicesService.formatCurrency,
    getStatusBadgeVariant: purchasedServicesService.getStatusBadgeVariant,
    getPaymentStatusBadgeVariant:
      purchasedServicesService.getPaymentStatusBadgeVariant,
  };

  return (
    <PurchasedServicesContext.Provider value={contextValue}>
      {children}
    </PurchasedServicesContext.Provider>
  );
};

export const usePurchasedServices = (): PurchasedServicesContextType => {
  const context = useContext(PurchasedServicesContext);
  if (context === undefined) {
    throw new Error(
      "usePurchasedServices must be used within a PurchasedServicesProvider"
    );
  }
  return context;
};
