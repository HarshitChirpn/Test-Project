import { useState } from "react";
import { usePortfolio, PortfolioItem } from "@/contexts/PortfolioContext";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Edit,
  Trash2,
  Plus,
  Briefcase,
  Star,
  Eye,
  EyeOff,
  Building,
  Clock,
  Users,
  Code,
  Loader2,
} from "lucide-react";

const PortfolioManagement = () => {
  const {
    portfolios,
    portfoliosLoading,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
  } = usePortfolio();
  const { toast } = useToast();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] =
    useState<PortfolioItem | null>(null);

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    create: false,
    update: false,
    delete: false,
  });

  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    category: "Web App" as "Web App" | "Mobile App" | "SaaS Platform",
    description: "",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&crop=center&auto=format&q=85",
    client: "",
    timeline: "",
    teamSize: "",
    technologies: [] as string[],
    metrics: {
      userGrowth: "",
      funding: "",
      timeToMarket: "",
      revenue: "",
      userRating: "",
    },
    testimonial: {
      quote: "",
      author: "",
      position: "",
      company: "",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face&auto=format&q=85",
    },
    process: [] as { phase: string; description: string; duration: string }[],
    mockups: [] as {
      device: "laptop" | "mobile" | "tablet";
      image: string;
      alt: string;
    }[],
    results: [] as string[],
    featured: false,
    published: true,
  });

  const [techInput, setTechInput] = useState("");
  const [resultInput, setResultInput] = useState("");
  const [processInput, setProcessInput] = useState({
    phase: "",
    description: "",
    duration: "",
  });
  const [mockupInput, setMockupInput] = useState({
    device: "laptop" as const,
    image: "",
    alt: "",
  });

  const categories = ["Web App", "Mobile App", "SaaS Platform"] as const;

  const resetForm = () => {
    setPortfolioForm({
      title: "",
      category: "Web App" as "Web App" | "Mobile App" | "SaaS Platform",
      description: "",
      image: "",
      client: "",
      timeline: "",
      teamSize: "",
      technologies: [],
      metrics: {
        userGrowth: "",
        funding: "",
        timeToMarket: "",
        revenue: "",
        userRating: "",
      },
      testimonial: {
        quote: "",
        author: "",
        position: "",
        company: "",
        avatar: "",
      },
      process: [],
      mockups: [],
      results: [],
      featured: false,
      published: true,
    });
    setTechInput("");
    setResultInput("");
    setProcessInput({ phase: "", description: "", duration: "" });
    setMockupInput({ device: "laptop", image: "", alt: "" });
  };

  const handleCreate = async () => {
    setLoadingStates((prev) => ({ ...prev, create: true }));
    try {
      await createPortfolio(portfolioForm);
      setCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Portfolio item created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create portfolio item",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, create: false }));
    }
  };

  const handleEdit = async () => {
    if (!selectedPortfolio) return;

    setLoadingStates((prev) => ({ ...prev, update: true }));
    try {
      await updatePortfolio(selectedPortfolio.id, portfolioForm);
      setEditDialogOpen(false);
      setSelectedPortfolio(null);
      resetForm();
      toast({
        title: "Success",
        description: "Portfolio item updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update portfolio item",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, update: false }));
    }
  };

  const handleDelete = async () => {
    if (!selectedPortfolio) return;

    setLoadingStates((prev) => ({ ...prev, delete: true }));
    try {
      await deletePortfolio(selectedPortfolio.id);
      setDeleteDialogOpen(false);
      setSelectedPortfolio(null);
      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete portfolio item",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, delete: false }));
    }
  };

  const openEditDialog = (portfolio: PortfolioItem) => {
    setSelectedPortfolio(portfolio);
    setPortfolioForm({
      title: portfolio.title,
      category: portfolio.category,
      description: portfolio.description,
      image: portfolio.image,
      client: portfolio.client,
      timeline: portfolio.timeline,
      teamSize: portfolio.teamSize,
      technologies: portfolio.technologies,
      metrics: {
        userGrowth: portfolio.metrics.userGrowth || "",
        funding: portfolio.metrics.funding || "",
        timeToMarket: portfolio.metrics.timeToMarket || "",
        revenue: portfolio.metrics.revenue || "",
        userRating: portfolio.metrics.userRating || "",
      },
      testimonial: portfolio.testimonial,
      process: portfolio.process,
      mockups: portfolio.mockups,
      results: portfolio.results,
      featured: portfolio.featured,
      published: portfolio.published,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (portfolio: PortfolioItem) => {
    setSelectedPortfolio(portfolio);
    setDeleteDialogOpen(true);
  };

  // Helper functions for managing arrays
  const addTechnology = () => {
    if (techInput.trim()) {
      setPortfolioForm((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput("");
    }
  };

  const removeTechnology = (index: number) => {
    setPortfolioForm((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }));
  };

  const addResult = () => {
    if (resultInput.trim()) {
      setPortfolioForm((prev) => ({
        ...prev,
        results: [...prev.results, resultInput.trim()],
      }));
      setResultInput("");
    }
  };

  const removeResult = (index: number) => {
    setPortfolioForm((prev) => ({
      ...prev,
      results: prev.results.filter((_, i) => i !== index),
    }));
  };

  const addProcess = () => {
    if (processInput.phase.trim() && processInput.description.trim()) {
      setPortfolioForm((prev) => ({
        ...prev,
        process: [...prev.process, processInput],
      }));
      setProcessInput({ phase: "", description: "", duration: "" });
    }
  };

  const removeProcess = (index: number) => {
    setPortfolioForm((prev) => ({
      ...prev,
      process: prev.process.filter((_, i) => i !== index),
    }));
  };

  const addMockup = () => {
    if (mockupInput.image.trim() && mockupInput.alt.trim()) {
      setPortfolioForm((prev) => ({
        ...prev,
        mockups: [...prev.mockups, mockupInput],
      }));
      setMockupInput({ device: "laptop", image: "", alt: "" });
    }
  };

  const removeMockup = (index: number) => {
    setPortfolioForm((prev) => ({
      ...prev,
      mockups: prev.mockups.filter((_, i) => i !== index),
    }));
  };

  if (portfoliosLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Portfolio Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading portfolio items...</div>
        </CardContent>
      </Card>
    );
  }

  const portfolioFormDialog = (isEdit: boolean) => (
    <DialogContent className="sm:max-w-[600px] lg:max-w-4xl w-[85vw] max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit" : "Create"} Portfolio Item</DialogTitle>
        <DialogDescription>
          {isEdit ? "Update the" : "Fill in the"} portfolio item details.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={portfolioForm.title}
                onChange={(e) =>
                  setPortfolioForm({ ...portfolioForm, title: e.target.value })
                }
                placeholder="Enter project title"
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={portfolioForm.category}
                onValueChange={(value) =>
                  setPortfolioForm({ ...portfolioForm, category: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={portfolioForm.description}
              onChange={(e) =>
                setPortfolioForm({
                  ...portfolioForm,
                  description: e.target.value,
                })
              }
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div>
            <ImageUpload
              value={portfolioForm.image}
              onChange={(url) =>
                setPortfolioForm({ ...portfolioForm, image: url })
              }
              onRemove={() => setPortfolioForm({ ...portfolioForm, image: "" })}
              folder="portfolio-images"
              label="Main Image"
              placeholder="Select a portfolio image to upload"
            />
          </div>

          <div>
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              value={portfolioForm.client}
              onChange={(e) =>
                setPortfolioForm({ ...portfolioForm, client: e.target.value })
              }
              placeholder="Enter client name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeline">Timeline</Label>
              <Input
                id="timeline"
                value={portfolioForm.timeline}
                onChange={(e) =>
                  setPortfolioForm({
                    ...portfolioForm,
                    timeline: e.target.value,
                  })
                }
                placeholder="e.g., 4 months"
              />
            </div>
            <div>
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                id="teamSize"
                value={portfolioForm.teamSize}
                onChange={(e) =>
                  setPortfolioForm({
                    ...portfolioForm,
                    teamSize: e.target.value,
                  })
                }
                placeholder="e.g., 5 experts"
              />
            </div>
          </div>

          {/* Technologies */}
          <div>
            <Label>Technologies</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add technology"
                onKeyPress={(e) => e.key === "Enter" && addTechnology()}
              />
              <Button type="button" onClick={addTechnology}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {portfolioForm.technologies.map((tech, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTechnology(index)}
                >
                  {tech} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Results */}
          <div>
            <Label>Results</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={resultInput}
                onChange={(e) => setResultInput(e.target.value)}
                placeholder="Add result"
                onKeyPress={(e) => e.key === "Enter" && addResult()}
              />
              <Button type="button" onClick={addResult}>
                Add
              </Button>
            </div>
            <div className="space-y-1">
              {portfolioForm.results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <span className="flex-1">{result}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResult(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup Images */}
          <div>
            <Label>Mockup Images</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <Label>Device Type</Label>
                <Select
                  value={mockupInput.device}
                  onValueChange={(value) =>
                    setMockupInput({ ...mockupInput, device: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Alt Text</Label>
                <Input
                  value={mockupInput.alt}
                  onChange={(e) =>
                    setMockupInput({ ...mockupInput, alt: e.target.value })
                  }
                  placeholder="Image description"
                />
              </div>
            </div>

            <div className="mb-2">
              <ImageUpload
                value={mockupInput.image}
                onChange={(url) =>
                  setMockupInput({ ...mockupInput, image: url })
                }
                onRemove={() => setMockupInput({ ...mockupInput, image: "" })}
                folder="mockup-images"
                label="Mockup Image"
                placeholder="Upload mockup image"
              />
            </div>

            <Button
              type="button"
              onClick={addMockup}
              disabled={!mockupInput.image || !mockupInput.alt}
              className="mb-2"
            >
              Add Mockup
            </Button>

            <div className="space-y-2">
              {portfolioForm.mockups.map((mockup, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <Badge variant="outline">{mockup.device}</Badge>
                  <span className="flex-1 text-sm">{mockup.alt}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMockup(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={portfolioForm.featured}
                onCheckedChange={(checked) =>
                  setPortfolioForm({ ...portfolioForm, featured: checked })
                }
              />
              <Label htmlFor="featured">Featured Item</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={portfolioForm.published}
                onCheckedChange={(checked) =>
                  setPortfolioForm({ ...portfolioForm, published: checked })
                }
              />
              <Label htmlFor="published">Published</Label>
            </div>
          </div>
        </div>

        {/* Live Preview Section */}
        <div className="space-y-4">
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
            </h3>

            {portfolioForm.image ? (
              <div className="space-y-6">
                {/* Image Guidelines */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">📐 Optimal Image Guidelines</h4>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p><strong>Recommended:</strong> 1200x800px (3:2 aspect ratio)</p>
                    <p><strong>Minimum:</strong> 800x600px for good quality</p>
                    <p><strong>Format:</strong> JPG or PNG, max 5MB</p>
                    <p><strong>Note:</strong> Images will display without cropping to show full content</p>
                  </div>
                </div>

                {/* Hero Section Preview (Exact match to PortfolioDetail.tsx) */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    🖥️ Hero Section (Desktop)
                  </h4>
                  <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={portfolioForm.image}
                      alt={portfolioForm.title || "Portfolio Preview"}
                      className="h-full w-full object-contain"
                      style={{ objectFit: 'contain' }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="flex items-center justify-center space-x-2 mb-2 text-xs">
                          <Badge className="bg-yellow-400 text-black text-xs">
                            {portfolioForm.category || "Category"}
                          </Badge>
                          <span>📅 {portfolioForm.timeline || "Timeline"}</span>
                          <span>👥 {portfolioForm.teamSize || "Team"}</span>
                          {portfolioForm.client && <span>🏢 {portfolioForm.client}</span>}
                        </div>
                        <h1 className="text-xl font-bold mb-1">
                          {portfolioForm.title || "Portfolio Title"}
                        </h1>
                        <p className="text-xs opacity-90 max-w-sm mx-auto line-clamp-2">
                          {portfolioForm.description || "Portfolio description..."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ↑ This matches exactly how your image appears on the portfolio detail page
                  </p>
                </div>

                {/* Portfolio Card Preview (Exact match to Portfolio.tsx) */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    📱 Portfolio Card (Grid View)
                  </h4>
                  <div className="max-w-sm bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="relative overflow-hidden bg-gray-100">
                      <img
                        src={portfolioForm.image}
                        alt={portfolioForm.title}
                        className="w-full h-64 object-contain group-hover:scale-102 transition-transform duration-300"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">
                        {portfolioForm.title || "Portfolio Title"}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {portfolioForm.description || "Portfolio description..."}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{portfolioForm.category}</Badge>
                        <span className="text-sm text-gray-500">{portfolioForm.client}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ↑ This matches exactly how your image appears in the portfolio grid
                  </p>
                </div>

                {/* Image Analysis */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold mb-2">🔍 Image Analysis</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Current URL:</strong> <span className="font-mono break-all">{portfolioForm.image}</span></p>
                    <p><strong>Display Mode:</strong> Images use object-contain to show full image without cropping</p>
                    <p><strong>Quality:</strong> Ensure high resolution for crisp display on all devices</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Eye className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">Upload an Image to See Live Preview</h4>
                <p className="text-sm text-gray-500 mb-4">
                  See exactly how your image will appear on the published site
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md mx-auto">
                  <h5 className="text-sm font-semibold text-blue-800 mb-2">📐 Optimal Image Guidelines</h5>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p><strong>Recommended:</strong> 1200x800px (3:2 aspect ratio)</p>
                    <p><strong>Minimum:</strong> 800x600px for good quality</p>
                    <p><strong>Format:</strong> JPG or PNG, max 5MB</p>
                    <p><strong>Subject:</strong> Keep important elements centered</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() =>
            isEdit ? setEditDialogOpen(false) : setCreateDialogOpen(false)
          }
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
              "Update Portfolio Item"
            )
          ) : loadingStates.create ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            "Create Portfolio Item"
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
              <Briefcase className="w-5 h-5" />
              <span>Portfolio Management</span>
            </CardTitle>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Portfolio Item</span>
                </Button>
              </DialogTrigger>
              {portfolioFormDialog(false)}
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Portfolio Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Portfolio Items ({portfolios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolios.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No portfolio items
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new portfolio item.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolios.map((portfolio) => (
                  <TableRow key={portfolio.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {portfolio.featured && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="font-medium">{portfolio.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{portfolio.category}</Badge>
                    </TableCell>
                    <TableCell>{portfolio.client || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {portfolio.published ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Eye className="w-3 h-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(portfolio.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(portfolio)}
                          disabled={loadingStates.update}
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
                          onClick={() => openDeleteDialog(portfolio)}
                          disabled={loadingStates.delete}
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        {portfolioFormDialog(true)}
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Portfolio Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPortfolio?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
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
    </div>
  );
};

export default PortfolioManagement;
