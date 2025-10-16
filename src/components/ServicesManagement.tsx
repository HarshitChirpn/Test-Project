import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServices, Service, ServiceContent, ServiceDetail } from "@/contexts/ServicesContext";
import { useToast } from "@/components/ui/use-toast";
import { createTitleSlug } from "@/utils/serviceUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Plus,
  Wrench,
  Palette,
  Code,
  TrendingUp,
  Share2,
  Mail,
  Key,
  Database,
  BarChart,
  Server,
  HardDrive,
  LifeBuoy,
  Loader2,
  Settings,
  Eye,
  X,
} from "lucide-react";

const ServicesManagement = () => {
  const {
    services,
    servicesLoading,
    createService,
    updateService,
    deleteService,
  } = useServices();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceDetailsDialogOpen, setServiceDetailsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    create: false,
    update: false,
    delete: false,
  });

  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    icon: "Wrench",
    category: "Development",
    order: 0,
  });

  const [serviceDetailsForm, setServiceDetailsForm] = useState<ServiceContent>({
    title: "WHAT WE OFFER?",
    leftSection: {
      title: "",
      services: [{ icon: "", title: "", description: "" }],
    },
    rightSection: {
      services: [{ icon: "", title: "", description: "" }],
    },
  });

  const iconOptions = [
    { value: "Palette", label: "Design", icon: Palette },
    { value: "Code", label: "Development", icon: Code },
    { value: "TrendingUp", label: "Marketing", icon: TrendingUp },
    { value: "Share2", label: "Social Media", icon: Share2 },
    { value: "Mail", label: "Email", icon: Mail },
    { value: "Key", label: "Authentication", icon: Key },
    { value: "Database", label: "Database", icon: Database },
    { value: "BarChart", label: "Analytics", icon: BarChart },
    { value: "Server", label: "Hosting", icon: Server },
    { value: "HardDrive", label: "Storage", icon: HardDrive },
    { value: "LifeBuoy", label: "Support", icon: LifeBuoy },
    { value: "Wrench", label: "Custom", icon: Wrench },
  ];

  const categoryOptions = [
    "Development",
    "Design",
    "Marketing",
    "Social Media",
    "Consulting",
    "Other",
  ];

  const resetForm = () => {
    setServiceForm({
      title: "",
      description: "",
      icon: "Wrench",
      category: "Development",
      order: services.length,
    });
  };

  const handleCreate = async () => {
    console.log("Creating service with data:", serviceForm);
    setLoadingStates((prev) => ({ ...prev, create: true }));
    try {
      const result = await createService(serviceForm);
      console.log("Create service result:", result);
      setCreateDialogOpen(false);
      
      // Use the returned service from the API
      if (result) {
        setSelectedService(result);
        // Set default service details based on category
        const categoryDefaults = {
          Development: {
            title: "WHAT WE OFFER?",
            leftSection: {
              title: "DEVELOPMENT SERVICES",
              services: [
                { icon: "🖥️", title: "WEB DEVELOPMENT", description: "Web development creates and maintains websites, including front-end (client-side) for user interfaces and experiences, and back-end (server-side) for database management and logic." },
                { icon: "📱", title: "MOBILE APP", description: "Mobile app development creates apps for smartphones and tablets, including Android, iOS, and cross-platform frameworks for multiple platforms." },
                { icon: "⚙️", title: "SOFTWARE", description: "Software development involves the design, programming, and testing of software applications. This can range from standalone desktop applications to complex enterprise software systems." }
              ],
            },
            rightSection: {
              services: [
                { icon: "🛒", title: "E-COMMERCE", description: "E-commerce development builds online stores and platforms for business, including product catalogs, shopping carts, payment gateways, and order management." },
                { icon: "🔧", title: "WORDPRESS", description: "We offer custom website development, theme customization, plugin installation, maintenance, content management, and security enhancements." },
                { icon: "🛍️", title: "SHOPIFY", description: "Our Shopify services include store setup, theme customization, product management, payment gateway integration, shipping setup, and app customization." }
              ],
            },
          },
          Design: {
            title: "WHAT WE OFFER?",
            leftSection: {
              title: "DESIGN SERVICES",
              services: [
                { icon: "🖨️", title: "PRINT DESIGN", description: "This includes designing brochures, business cards, flyers, posters, banners, packaging, magazines, and other printed materials." },
                { icon: "🎨", title: "WEB DESIGN", description: "Web design focuses on creating visually appealing and functional designs for websites. It includes user experience, responsive design, navigation, typography, color schemes etc." },
                { icon: "📱", title: "SOCIAL MEDIA GRAPHICS", description: "These include post images, banners, profile pictures, cover photos, infographics, and other visuals that capture attention and engage social media users." }
              ],
            },
            rightSection: {
              services: [
                { icon: "📊", title: "PITCH DECK", description: "Our approach involves utilizing a blend of graphics, typography, charts, and visuals to bolster the pitch, resulting in visually captivating slides that effectively convey essential information." },
                { icon: "📋", title: "EBC (ENHANCED BRAND CONTENT)", description: "EBC on Amazon lets sellers enhance product descriptions with visually rich content. We create appealing layouts with images, graphics, and text to showcase features, benefits, and value, attracting more customers." },
                { icon: "📷", title: "PHOTO SHOOT", description: "We take professional photos for ads, marketing, catalogs, websites, and portfolios. Our photographers plan concepts, lighting, styling, and props. We also retouch and edit photos for desired quality and aesthetics." }
              ],
            },
          },
          Marketing: {
            title: "WHAT WE OFFER?",
            leftSection: {
              title: "MARKETING SERVICES",
              services: [
                { icon: "🔍", title: "KEYWORD RESEARCH", description: "Conducting in-depth research to identify relevant and high-performing keywords that can drive organic traffic to a website." },
                { icon: "⚙️", title: "ON-PAGE OPTIMIZATION", description: "Optimizing various on-page elements, such as meta tags, headings, content, and URLs, to improve website visibility and search engine rankings." },
                { icon: "🔧", title: "TECHNICAL SEO AUDIT", description: "Performing a comprehensive analysis of a website's technical aspects to identify and resolve any issues that may hinder search engine crawling and indexing." }
              ],
            },
            rightSection: {
              services: [
                { icon: "🔗", title: "LINK BUILDING", description: "Acquiring high-quality backlinks from reputable websites to increase the authority and credibility of a website, ultimately improving its search engine rankings." },
                { icon: "💡", title: "CONTENT CREATION AND OPTIMIZATION", description: "Developing high-quality and optimized content, including blog posts, articles, and landing pages, to engage users and improve search engine visibility." },
                { icon: "📊", title: "PERFORMANCE TRACKING AND REPORTING", description: "Monitoring website performance, analyzing data, and providing detailed reports on key SEO metrics, such as organic traffic, keyword rankings, and conversions." }
              ],
            },
          },
        };

        const defaultContent = categoryDefaults[serviceForm.category as keyof typeof categoryDefaults] || {
          title: "WHAT WE OFFER?",
          leftSection: {
            title: `${serviceForm.category.toUpperCase()} SERVICES`,
            services: [{ icon: "", title: "", description: "" }],
          },
          rightSection: {
            services: [{ icon: "", title: "", description: "" }],
          },
        };

        setServiceDetailsForm(defaultContent);
        setServiceDetailsDialogOpen(true);
        
        // Show a toast to inform user about the next step
        toast({
          title: "Service Created!",
          description: "Now configure the service details below.",
        });
      } else {
        console.error("No service returned from createService");
        toast({
          title: "Warning",
          description: "Service created but details form could not be opened.",
          variant: "destructive",
        });
      }
      
      resetForm();
    } catch (error) {
      console.error("Error creating service:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoadingStates((prev) => ({ ...prev, create: false }));
    }
  };

  const handleEdit = async () => {
    if (!selectedService) return;

    setLoadingStates((prev) => ({ ...prev, update: true }));
    try {
      await updateService(selectedService.id, serviceForm);
      setEditDialogOpen(false);
      setSelectedService(null);
      resetForm();
    } catch (error) {
      console.error("Error updating service:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, update: false }));
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;

    setLoadingStates((prev) => ({ ...prev, delete: true }));
    try {
      await deleteService(selectedService.id);
      setDeleteDialogOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error("Error deleting service:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, delete: false }));
    }
  };

  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setServiceForm({
      title: service.title,
      description: service.description,
      icon: service.icon,
      category: service.category,
      order: service.order,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleViewServiceDetails = (service: Service) => {
    // Create a URL-friendly slug from the service title using shared utility
    const serviceSlug = createTitleSlug(service.title);
    
    console.log('Navigating to service details:', {
      serviceTitle: service.title,
      serviceSlug,
      serviceId: service.id,
      url: `/getmvp/services/${serviceSlug}`
    });
    
    // Navigate to the service detail page
    navigate(`/getmvp/services/${serviceSlug}`);
  };

  const openServiceDetailsDialog = (service: Service) => {
    setSelectedService(service);
    if (service.serviceDetails) {
      setServiceDetailsForm(service.serviceDetails);
    } else {
      // Set default service details based on category
      const categoryDefaults = {
        Development: {
          title: "WHAT WE OFFER?",
          leftSection: {
            title: "DEVELOPMENT SERVICES",
            services: [
              { icon: "🖥️", title: "WEB DEVELOPMENT", description: "Web development creates and maintains websites, including front-end (client-side) for user interfaces and experiences, and back-end (server-side) for database management and logic." },
              { icon: "📱", title: "MOBILE APP", description: "Mobile app development creates apps for smartphones and tablets, including Android, iOS, and cross-platform frameworks for multiple platforms." },
              { icon: "⚙️", title: "SOFTWARE", description: "Software development involves the design, programming, and testing of software applications. This can range from standalone desktop applications to complex enterprise software systems." }
            ],
          },
          rightSection: {
            services: [
              { icon: "🛒", title: "E-COMMERCE", description: "E-commerce development builds online stores and platforms for business, including product catalogs, shopping carts, payment gateways, and order management." },
              { icon: "🔧", title: "WORDPRESS", description: "We offer custom website development, theme customization, plugin installation, maintenance, content management, and security enhancements." },
              { icon: "🛍️", title: "SHOPIFY", description: "Our Shopify services include store setup, theme customization, product management, payment gateway integration, shipping setup, and app customization." }
            ],
          },
        },
        Design: {
          title: "WHAT WE OFFER?",
          leftSection: {
            title: "DESIGN SERVICES",
            services: [
              { icon: "🖨️", title: "PRINT DESIGN", description: "This includes designing brochures, business cards, flyers, posters, banners, packaging, magazines, and other printed materials." },
              { icon: "🎨", title: "WEB DESIGN", description: "Web design focuses on creating visually appealing and functional designs for websites. It includes user experience, responsive design, navigation, typography, color schemes etc." },
              { icon: "📱", title: "SOCIAL MEDIA GRAPHICS", description: "These include post images, banners, profile pictures, cover photos, infographics, and other visuals that capture attention and engage social media users." }
            ],
          },
          rightSection: {
            services: [
              { icon: "📊", title: "PITCH DECK", description: "Our approach involves utilizing a blend of graphics, typography, charts, and visuals to bolster the pitch, resulting in visually captivating slides that effectively convey essential information." },
              { icon: "📋", title: "EBC (ENHANCED BRAND CONTENT)", description: "EBC on Amazon lets sellers enhance product descriptions with visually rich content. We create appealing layouts with images, graphics, and text to showcase features, benefits, and value, attracting more customers." },
              { icon: "📷", title: "PHOTO SHOOT", description: "We take professional photos for ads, marketing, catalogs, websites, and portfolios. Our photographers plan concepts, lighting, styling, and props. We also retouch and edit photos for desired quality and aesthetics." }
            ],
          },
        },
        Marketing: {
          title: "WHAT WE OFFER?",
          leftSection: {
            title: "MARKETING SERVICES",
            services: [
              { icon: "🔍", title: "KEYWORD RESEARCH", description: "Conducting in-depth research to identify relevant and high-performing keywords that can drive organic traffic to a website." },
              { icon: "⚙️", title: "ON-PAGE OPTIMIZATION", description: "Optimizing various on-page elements, such as meta tags, headings, content, and URLs, to improve website visibility and search engine rankings." },
              { icon: "🔧", title: "TECHNICAL SEO AUDIT", description: "Performing a comprehensive analysis of a website's technical aspects to identify and resolve any issues that may hinder search engine crawling and indexing." }
            ],
          },
          rightSection: {
            services: [
              { icon: "🔗", title: "LINK BUILDING", description: "Acquiring high-quality backlinks from reputable websites to increase the authority and credibility of a website, ultimately improving its search engine rankings." },
              { icon: "💡", title: "CONTENT CREATION AND OPTIMIZATION", description: "Developing high-quality and optimized content, including blog posts, articles, and landing pages, to engage users and improve search engine visibility." },
              { icon: "📊", title: "PERFORMANCE TRACKING AND REPORTING", description: "Monitoring website performance, analyzing data, and providing detailed reports on key SEO metrics, such as organic traffic, keyword rankings, and conversions." }
            ],
          },
        },
      };

      const defaultContent = categoryDefaults[service.category as keyof typeof categoryDefaults] || {
        title: "WHAT WE OFFER?",
        leftSection: {
          title: `${service.category.toUpperCase()} SERVICES`,
          services: [{ icon: "", title: "", description: "" }],
        },
        rightSection: {
          services: [{ icon: "", title: "", description: "" }],
        },
      };

      setServiceDetailsForm(defaultContent);
    }
    setServiceDetailsDialogOpen(true);
  };

  const handleSaveServiceDetails = async () => {
    if (!selectedService) return;

    console.log("Saving service details for service:", selectedService.id);
    console.log("Service details data:", serviceDetailsForm);

    setLoadingStates((prev) => ({ ...prev, update: true }));
    try {
      const result = await updateService(selectedService.id, { serviceDetails: serviceDetailsForm });
      console.log("Update result:", result);
      setServiceDetailsDialogOpen(false);
      setSelectedService(null);
      toast({
        title: "Success",
        description: "Service details saved successfully",
      });
    } catch (error) {
      console.error("Error saving service details:", error);
      toast({
        title: "Error",
        description: "Failed to save service details",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, update: false }));
    }
  };

  const addServiceDetail = (section: 'left' | 'right') => {
    const newDetail: ServiceDetail = { 
      icon: "", 
      title: "", 
      description: "",
      price: "",
      amount: "",
      paymentLink: ""
    };
    setServiceDetailsForm(prev => ({
      ...prev,
      [section === 'left' ? 'leftSection' : 'rightSection']: {
        ...prev[section === 'left' ? 'leftSection' : 'rightSection'],
        services: [
          ...prev[section === 'left' ? 'leftSection' : 'rightSection'].services,
          newDetail
        ]
      }
    }));
  };

  const removeServiceDetail = (section: 'left' | 'right', index: number) => {
    setServiceDetailsForm(prev => ({
      ...prev,
      [section === 'left' ? 'leftSection' : 'rightSection']: {
        ...prev[section === 'left' ? 'leftSection' : 'rightSection'],
        services: prev[section === 'left' ? 'leftSection' : 'rightSection'].services.filter((_, i) => i !== index)
      }
    }));
  };

  const updateServiceDetail = (section: 'left' | 'right', index: number, field: keyof ServiceDetail, value: string) => {
    setServiceDetailsForm(prev => ({
      ...prev,
      [section === 'left' ? 'leftSection' : 'rightSection']: {
        ...prev[section === 'left' ? 'leftSection' : 'rightSection'],
        services: prev[section === 'left' ? 'leftSection' : 'rightSection'].services.map((service, i) =>
          i === index ? { ...service, [field]: value } : service
        )
      }
    }));
  };

  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find((option) => option.value === iconName);
    return icon ? icon.icon : Wrench;
  };

  if (servicesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="w-5 h-5" />
            <span>Services Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading services...</div>
        </CardContent>
      </Card>
    );
  }

  const serviceFormDialog = (isEdit: boolean) => (
    <DialogContent className="max-w-3xl w-[80vw] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit" : "Create"} Service</DialogTitle>
        <DialogDescription>
          {isEdit ? "Update the" : "Fill in the"} service details.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={serviceForm.title}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, title: e.target.value })
            }
            placeholder="Enter service title"
          />
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={serviceForm.description}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, description: e.target.value })
            }
            placeholder="Enter service description"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="icon">Icon</Label>
          <Select
            value={serviceForm.icon}
            onValueChange={(value) =>
              setServiceForm({ ...serviceForm, icon: value })
            }
          >
            <SelectTrigger>
              <div className="flex items-center space-x-2">
                {(() => {
                  const selectedOption = iconOptions.find(
                    (option) => option.value === serviceForm.icon
                  );
                  if (!selectedOption) return null;
                  const IconComponent = selectedOption.icon;
                  return (
                    <>
                      <IconComponent className="w-4 h-4" />
                      <span>{selectedOption.label}</span>
                    </>
                  );
                })()}
              </div>
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={serviceForm.category}
            onValueChange={(value) =>
              setServiceForm({ ...serviceForm, category: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            isEdit ? setEditDialogOpen(false) : setCreateDialogOpen(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={isEdit ? handleEdit : handleCreate}
          disabled={isEdit ? loadingStates.update : loadingStates.create}
        >
          {isEdit ? (
            loadingStates.update ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Service"
            )
          ) : loadingStates.create ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            "Create Service"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="w-5 h-5" />
              <span>Services Management</span>
            </CardTitle>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Service</span>
                </Button>
              </DialogTrigger>
              {serviceFormDialog(false)}
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Services ({services.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No services
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new service.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => {
                  const IconComponent = getIconComponent(service.icon);
                  return (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-5 h-5 text-brand-yellow" />
                          <span className="font-medium">{service.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{service.category}</Badge>
                      </TableCell>
                      <TableCell>{service.order}</TableCell>
                      <TableCell>
                        {new Date(service.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewServiceDetails(service)}
                            title="View Service Details Page"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openServiceDetailsDialog(service)}
                            title="Manage Service Details"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(service)}
                            disabled={loadingStates.update}
                            title="Edit Service"
                          >
                            {loadingStates.update ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Edit className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(service)}
                            disabled={loadingStates.delete}
                            title="Delete Service"
                          >
                            {loadingStates.delete ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        {serviceFormDialog(true)}
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedService?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedService(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loadingStates.delete}
            >
              {loadingStates.delete ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Details Dialog */}
      <Dialog open={serviceDetailsDialogOpen} onOpenChange={setServiceDetailsDialogOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Service Details - {selectedService?.title}
            </DialogTitle>
            <DialogDescription>
              Configure the detailed content for this service that will be displayed on the service detail page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Main Title */}
            <div>
              <Label htmlFor="serviceTitle">Main Title</Label>
              <Input
                id="serviceTitle"
                value={serviceDetailsForm.title}
                onChange={(e) => setServiceDetailsForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., WHAT WE OFFER?"
              />
            </div>

            {/* Left Section Title */}
            <div>
              <Label htmlFor="leftSectionTitle">Left Section Title</Label>
              <Input
                id="leftSectionTitle"
                value={serviceDetailsForm.leftSection.title}
                onChange={(e) => setServiceDetailsForm(prev => ({
                  ...prev,
                  leftSection: { ...prev.leftSection, title: e.target.value }
                }))}
                placeholder="e.g., DEVELOPMENT SERVICES"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Section Services */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Left Section Services</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addServiceDetail('left')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
                
                {serviceDetailsForm.leftSection.services.map((service, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Service {index + 1}</Label>
                        {serviceDetailsForm.leftSection.services.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeServiceDetail('left', index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div>
                        <Label>Icon (Emoji)</Label>
                        <Input
                          value={service.icon}
                          onChange={(e) => updateServiceDetail('left', index, 'icon', e.target.value)}
                          placeholder="e.g., 🖥️"
                        />
                      </div>
                      
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={service.title}
                          onChange={(e) => updateServiceDetail('left', index, 'title', e.target.value)}
                          placeholder="e.g., WEB DEVELOPMENT"
                        />
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={service.description}
                          onChange={(e) => updateServiceDetail('left', index, 'description', e.target.value)}
                          placeholder="Detailed description of the service..."
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label>Stripe Price ID (Optional)</Label>
                        <Input
                          value={service.price || ""}
                          onChange={(e) => updateServiceDetail('left', index, 'price', e.target.value)}
                          placeholder="e.g., price_1S5ue3P2s2dC5AUyRbUlXbZA"
                        />
                      </div>
                      
                      <div>
                        <Label>Display Price (Optional)</Label>
                        <Input
                          value={service.amount || ""}
                          onChange={(e) => updateServiceDetail('left', index, 'amount', e.target.value)}
                          placeholder="e.g., $50/year"
                        />
                      </div>
                      
                      <div>
                        <Label>Payment Link URL (Optional)</Label>
                        <Input
                          value={service.paymentLink || ""}
                          onChange={(e) => updateServiceDetail('left', index, 'paymentLink', e.target.value)}
                          placeholder="e.g., https://buy.stripe.com/..."
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Right Section Services */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Right Section Services</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addServiceDetail('right')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
                
                {serviceDetailsForm.rightSection.services.map((service, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Service {index + 1}</Label>
                        {serviceDetailsForm.rightSection.services.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeServiceDetail('right', index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div>
                        <Label>Icon (Emoji)</Label>
                        <Input
                          value={service.icon}
                          onChange={(e) => updateServiceDetail('right', index, 'icon', e.target.value)}
                          placeholder="e.g., 🛒"
                        />
                      </div>
                      
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={service.title}
                          onChange={(e) => updateServiceDetail('right', index, 'title', e.target.value)}
                          placeholder="e.g., E-COMMERCE"
                        />
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={service.description}
                          onChange={(e) => updateServiceDetail('right', index, 'description', e.target.value)}
                          placeholder="Detailed description of the service..."
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label>Stripe Price ID (Optional)</Label>
                        <Input
                          value={service.price || ""}
                          onChange={(e) => updateServiceDetail('right', index, 'price', e.target.value)}
                          placeholder="e.g., price_1S5ue3P2s2dC5AUyRbUlXbZA"
                        />
                      </div>
                      
                      <div>
                        <Label>Display Price (Optional)</Label>
                        <Input
                          value={service.amount || ""}
                          onChange={(e) => updateServiceDetail('right', index, 'amount', e.target.value)}
                          placeholder="e.g., $50/year"
                        />
                      </div>
                      
                      <div>
                        <Label>Payment Link URL (Optional)</Label>
                        <Input
                          value={service.paymentLink || ""}
                          onChange={(e) => updateServiceDetail('right', index, 'paymentLink', e.target.value)}
                          placeholder="e.g., https://buy.stripe.com/..."
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setServiceDetailsDialogOpen(false);
                setSelectedService(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveServiceDetails}
              disabled={loadingStates.update}
            >
              {loadingStates.update ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Service Details"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesManagement;