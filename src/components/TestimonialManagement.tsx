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
  Star,
  Eye,
  EyeOff,
  Building,
  User,
  Loader2,
} from "lucide-react";

const TestimonialManagement = () => {
  const {
    portfolios,
    portfoliosLoading,
    updatePortfolio,
  } = usePortfolio();
  const { toast } = useToast();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    create: false,
    update: false,
    delete: false,
  });

  const [testimonialForm, setTestimonialForm] = useState({
    quote: "",
    author: "",
    position: "",
    company: "",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face&auto=format&q=85",
  });

  const resetForm = () => {
    setTestimonialForm({
      quote: "",
      author: "",
      position: "",
      company: "",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face&auto=format&q=85",
    });
  };

  const handleCreate = async () => {
    if (!selectedPortfolio || !testimonialForm.quote || !testimonialForm.author) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Quote, Author)",
        variant: "destructive",
      });
      return;
    }

    setLoadingStates((prev) => ({ ...prev, create: true }));
    try {
      await updatePortfolio(selectedPortfolio.id, {
        testimonial: testimonialForm
      });
      toast({
        title: "Success",
        description: "Testimonial created successfully",
      });
      setCreateDialogOpen(false);
      setSelectedPortfolio(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create testimonial",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, create: false }));
    }
  };

  const handleEdit = (portfolio: PortfolioItem) => {
    setSelectedPortfolio(portfolio);
    setTestimonialForm({
      quote: portfolio.testimonial.quote,
      author: portfolio.testimonial.author,
      position: portfolio.testimonial.position,
      company: portfolio.testimonial.company,
      avatar: portfolio.testimonial.avatar,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedPortfolio) return;

    if (!testimonialForm.quote || !testimonialForm.author) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Quote, Author)",
        variant: "destructive",
      });
      return;
    }

    setLoadingStates((prev) => ({ ...prev, update: true }));
    try {
      await updatePortfolio(selectedPortfolio.id, {
        testimonial: testimonialForm
      });
      toast({
        title: "Success",
        description: "Testimonial updated successfully",
      });
      setEditDialogOpen(false);
      setSelectedPortfolio(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update testimonial",
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
      await updatePortfolio(selectedPortfolio.id, {
        testimonial: {
          quote: "",
          author: "",
          position: "",
          company: "",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face&auto=format&q=85",
        }
      });
      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedPortfolio(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, delete: false }));
    }
  };

  if (portfoliosLoading) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">Loading testimonials...</div>
        </CardContent>
      </Card>
    );
  }

  const testimonialFormDialog = (isEdit: boolean) => (
    <DialogContent className="sm:max-w-[500px] lg:max-w-2xl w-[85vw] max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit" : "Create"} Testimonial</DialogTitle>
        <DialogDescription>
          {isEdit ? "Update the" : "Fill in the"} testimonial details.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Portfolio Info */}
        {selectedPortfolio && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Portfolio: {selectedPortfolio.title}</p>
            <p className="text-xs text-muted-foreground">{selectedPortfolio.category}</p>
          </div>
        )}

        {/* Testimonial Quote */}
        <div>
          <Label htmlFor="quote">Testimonial Quote *</Label>
          <Textarea
            id="quote"
            value={testimonialForm.quote}
            onChange={(e) =>
              setTestimonialForm({ ...testimonialForm, quote: e.target.value })
            }
            placeholder="Enter customer testimonial or feedback quote"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Author */}
          <div>
            <Label htmlFor="author">Customer Name *</Label>
            <Input
              id="author"
              value={testimonialForm.author}
              onChange={(e) =>
                setTestimonialForm({ ...testimonialForm, author: e.target.value })
              }
              placeholder="Customer name"
            />
          </div>

          {/* Position */}
          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={testimonialForm.position}
              onChange={(e) =>
                setTestimonialForm({ ...testimonialForm, position: e.target.value })
              }
              placeholder="Job title or position"
            />
          </div>
        </div>

        {/* Company */}
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={testimonialForm.company}
            onChange={(e) =>
              setTestimonialForm({ ...testimonialForm, company: e.target.value })
            }
            placeholder="Company name"
          />
        </div>

        {/* Avatar Upload */}
        <div>
          <ImageUpload
            value={testimonialForm.avatar}
            onChange={(url) =>
              setTestimonialForm({ ...testimonialForm, avatar: url })
            }
            onRemove={() =>
              setTestimonialForm({
                ...testimonialForm,
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face&auto=format&q=85",
              })
            }
            folder="testimonial-avatars"
            label="Customer Avatar"
            placeholder="Upload customer photo"
            maxSize={2}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            isEdit ? setEditDialogOpen(false) : setCreateDialogOpen(false);
            resetForm();
            setSelectedPortfolio(null);
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={isEdit ? handleUpdate : handleCreate}
          disabled={
            isEdit ? loadingStates.update : loadingStates.create
          }
        >
          {isEdit ? (
            loadingStates.update ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null
          ) : loadingStates.create ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          {isEdit ? "Update" : "Create"} Testimonial
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
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Customer Testimonials</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Manage customer testimonials organized by portfolio projects
              </p>
            </div>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Testimonial</span>
                </Button>
              </DialogTrigger>
              {testimonialFormDialog(false)}
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Portfolio Sections with Testimonials */}
      <div className="space-y-6">
        {portfolios.map((portfolio) => {
          const hasTestimonial = portfolio.testimonial.quote && portfolio.testimonial.author;
          
          return (
            <Card key={portfolio.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{portfolio.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{portfolio.category}</Badge>
                      {portfolio.client && (
                        <span className="text-sm text-muted-foreground">
                          <Building className="w-3 h-3 inline mr-1" />
                          {portfolio.client}
                        </span>
                      )}
                      <Badge variant="secondary">
                        {hasTestimonial ? "1 testimonial" : "0 testimonials"}
                      </Badge>
                    </div>
                  </div>
                  
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPortfolio(portfolio);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {hasTestimonial ? "Edit Testimonial" : "Add Testimonial"}
                      </Button>
                    </DialogTrigger>
                    {testimonialFormDialog(false)}
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                {hasTestimonial ? (
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={portfolio.testimonial.avatar}
                          alt={portfolio.testimonial.author}
                          className="w-10 h-10 rounded-full object-cover"
                          style={{ 
                            imageRendering: 'auto',
                            objectFit: 'cover',
                            objectPosition: 'center'
                          }}
                          loading="lazy"
                        />
                        <div>
                          <p className="font-medium">{portfolio.testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">
                            {portfolio.testimonial.position}
                            {portfolio.testimonial.company && ` at ${portfolio.testimonial.company}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(portfolio)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          {testimonialFormDialog(true)}
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPortfolio(portfolio);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <blockquote className="text-sm italic border-l-4 border-gray-200 pl-4">
                      "{portfolio.testimonial.quote}"
                    </blockquote>
                    
                    <div className="text-xs text-muted-foreground">
                      Portfolio: {portfolio.title}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No testimonials for this portfolio yet.</p>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => {
                            setSelectedPortfolio(portfolio);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add First Testimonial
                        </Button>
                      </DialogTrigger>
                      {testimonialFormDialog(false)}
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {portfolios.length === 0 && (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No portfolios found</h3>
                <p className="text-muted-foreground">
                  Create portfolio projects first to add testimonials.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Testimonial</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedPortfolio(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loadingStates.delete}
            >
              {loadingStates.delete && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialManagement;