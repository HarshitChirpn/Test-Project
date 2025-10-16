import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export interface ServiceDetail {
  icon: string;
  title: string;
  description: string;
  price?: string;
  amount?: string;
  paymentLink?: string;
}

export interface ServiceContent {
  title: string;
  leftSection: {
    title: string;
    services: ServiceDetail[];
  };
  rightSection: {
    title: string;
    services: ServiceDetail[];
  };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  order: number;
  serviceDetails?: ServiceContent;
  createdAt: Date;
  updatedAt: Date;
}

interface ServicesContextType {
  services: Service[];
  servicesLoading: boolean;
  createService: (service: Omit<Service, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateService: (id: string, service: Partial<Omit<Service, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  refreshServices: () => Promise<void>;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error("useServices must be used within a ServicesProvider");
  }
  return context;
};

export const ServicesProvider = ({ children }: { children: React.ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const { toast } = useToast();

  // Fetch services
  const fetchServices = async () => {
    try {
      const result = await api.get('/services?limit=1000');

      if (result.success && result.data?.services) {
        console.log(`📊 Fetched ${result.data.services.length} services from API`);
        console.log(`📊 Total services in database: ${result.data.total || 'unknown'}`);
        
        const formattedServices: Service[] = result.data.services.map((service: any) => ({
          id: service._id,
          title: service.title,
          description: service.description,
          icon: service.icon || '',
          category: service.category,
          order: service.order,
          serviceDetails: service.serviceDetails,
          createdAt: new Date(service.createdAt),
          updatedAt: new Date(service.updatedAt)
        }));

        console.log(`📊 Formatted ${formattedServices.length} services for frontend`);
        setServices(formattedServices);
      }
      setServicesLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const createService = async (service: Omit<Service, "id" | "createdAt" | "updatedAt">) => {
    try {
      console.log("Creating service via API:", service);
      
      const response = await api.post('/services', {
        title: service.title,
        description: service.description,
        icon: service.icon,
        category: service.category,
        order: service.order,
        serviceDetails: service.serviceDetails
      });

      console.log("Create service API response:", response);
      console.log("Response data structure:", {
        responseData: response.data,
        responseDataData: response.data?.data,
        responseDataService: response.data?.data?.service,
        responseDataDirectService: response.data?.service,
        responseDataKeys: response.data ? Object.keys(response.data) : 'no data',
        responseDataDataKeys: response.data?.data ? Object.keys(response.data.data) : 'no data.data'
      });

      // Return the created service from the response
      // The API returns: { success: true, message: '...', data: { service } }
      // But the actual structure might be different, let's try multiple paths
      const createdService = response.data?.data?.service || response.data?.service || response.data;
      if (createdService) {
        // Format the service to match our interface
        const formattedService: Service = {
          id: createdService._id,
          title: createdService.title,
          description: createdService.description,
          icon: createdService.icon || '',
          category: createdService.category,
          order: createdService.order,
          serviceDetails: createdService.serviceDetails,
          createdAt: new Date(createdService.createdAt),
          updatedAt: new Date(createdService.updatedAt)
        };

        await fetchServices(); // Refresh the list
        toast({
          title: "Success",
          description: "Service created successfully",
        });
        
        return formattedService;
      } else {
        throw new Error("No service data returned from API");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      console.error("Error details:", error.response?.data);
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive",
      });
      throw error; // Re-throw to let the component handle it
    }
  };

  const updateService = async (id: string, service: Partial<Omit<Service, "id" | "createdAt" | "updatedAt">>) => {
    try {
      console.log("Updating service with ID:", id);
      console.log("Update data:", service);
      
      const response = await api.put(`/services/${id}`, service);
      console.log("API response:", response);

      await fetchServices(); // Refresh the list
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    } catch (error) {
      console.error("Error updating service:", error);
      console.error("Error details:", error.response?.data);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
      throw error; // Re-throw to let the component handle it
    }
  };

  const deleteService = async (id: string) => {
    try {
      await api.delete(`/services/${id}`);

      await fetchServices(); // Refresh the list
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  const refreshServices = async () => {
    await fetchServices();
  };

  const value: ServicesContextType = {
    services,
    servicesLoading,
    createService,
    updateService,
    deleteService,
    refreshServices,
  };

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
};