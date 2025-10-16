import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { X, Upload, Image as ImageIcon, Trash2 } from "lucide-react";

interface PortfolioFormProps {
  onClose: () => void;
  onSuccess: () => void;
  portfolio?: any;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({ onClose, onSuccess, portfolio }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(portfolio?.image || "");
  const [formInitialized, setFormInitialized] = useState(false);
  const [formData, setFormData] = useState({
    title: portfolio?.title || "",
    category: portfolio?.category || "",
    description: portfolio?.description || "",
    image: portfolio?.image || "",
    client: portfolio?.client || "",
    timeline: portfolio?.timeline || "",
    teamSize: portfolio?.teamSize || "",
    technologies: portfolio?.technologies || [],
    published: portfolio?.published || false,
    featured: portfolio?.featured || false
  });

  // Update form data when portfolio prop changes
  useEffect(() => {
    console.log('PortfolioForm - Portfolio prop changed:', portfolio);
    if (portfolio) {
      console.log('Portfolio ID details:', {
        _id: portfolio._id,
        id: portfolio.id,
        _idType: typeof portfolio._id,
        _idLength: portfolio._id?.length,
        _idValid: portfolio._id ? /^[0-9a-fA-F]{24}$/.test(portfolio._id) : false
      });
      const newFormData = {
        title: portfolio.title || "",
        category: portfolio.category || "",
        description: portfolio.description || "",
        image: portfolio.image || "",
        client: portfolio.client || "",
        timeline: portfolio.timeline || "",
        teamSize: portfolio.teamSize || "",
        technologies: Array.isArray(portfolio.technologies) ? portfolio.technologies : (portfolio.technologies ? [portfolio.technologies] : []),
        published: portfolio.published || false,
        featured: portfolio.featured || false
      };
      console.log('PortfolioForm - Setting form data:', newFormData);
      setFormData(newFormData);
      setImagePreview(portfolio.image || "");
    } else {
      // Reset form for new portfolio
      const resetFormData = {
        title: "",
        category: "",
        description: "",
        image: "",
        client: "",
        timeline: "",
        teamSize: "",
        technologies: [],
        published: false,
        featured: false
      };
      console.log('PortfolioForm - Resetting form data:', resetFormData);
      setFormData(resetFormData);
      setImagePreview("");
    }
    setFormInitialized(true);
  }, [portfolio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    if (!formData.title || formData.title.length < 5) {
      toast({
        title: "Validation Error",
        description: "Title must be at least 5 characters long",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!formData.description || formData.description.length < 50) {
      toast({
        title: "Validation Error",
        description: "Description must be at least 50 characters long",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Only include image if it's a valid URL or empty string
        image: formData.image || ""
      };

      // Debug logging
      console.log('Submitting portfolio data:', submitData);

      if (portfolio) {
        // Update existing portfolio
        const portfolioId = portfolio._id || portfolio.id;
        
        // Validate portfolio ID format
        if (!portfolioId) {
          throw new Error('Portfolio ID is missing');
        }
        
        // Check if it's a valid ID format (at least 12 characters, alphanumeric)
        if (!/^[0-9a-zA-Z]{12,}$/.test(portfolioId)) {
          console.error('Invalid portfolio ID format:', portfolioId);
          throw new Error('Invalid portfolio ID format. Please refresh and try again.');
        }
        
        console.log('Updating portfolio with ID:', portfolioId);
        console.log('Update URL:', `/portfolio/${portfolioId}`);
        console.log('Update data:', submitData);
        await api.put(`/portfolio/${portfolioId}`, submitData);
        toast({
          title: "Success",
          description: "Portfolio item updated successfully",
        });
      } else {
        // Create new portfolio
        await api.post("/portfolio", submitData);
        toast({
          title: "Success",
          description: "Portfolio item created successfully",
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Portfolio save error:', error);
      
      // Extract specific error message
      let errorMessage = "Failed to save portfolio item";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific validation errors
      if (error.response?.status === 400) {
        errorMessage = "Please check your input and try again";
      } else if (error.response?.status === 401) {
        errorMessage = "You are not authorized to perform this action";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTechnologyChange = (value: string) => {
    const technologies = value.split(',').map(tech => tech.trim()).filter(tech => tech);
    setFormData(prev => ({ ...prev, technologies }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, GIF, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Upload the file
      uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload to your backend endpoint
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data?.success && response.data?.data?.imageUrl) {
        setFormData(prev => ({ ...prev, image: response.data.data.imageUrl }));
        toast({
          title: "Image uploaded successfully",
          description: "Your image has been uploaded and is ready to use",
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. You can still use the image URL field instead.",
        variant: "destructive",
      });
      // Keep the preview but don't update the form data
      // User can still use the URL field
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview("");
    setFormData(prev => ({ ...prev, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    setImagePreview(url);
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{portfolio ? "Edit Portfolio Item" : "Create Portfolio Item"}</CardTitle>
              <CardDescription>
                {portfolio ? "Update portfolio item details" : "Add a new portfolio item"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!formInitialized ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading form...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="Enter portfolio title (min 5 characters)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/200 characters (minimum 5 required)
                </p>
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web App">Web App</SelectItem>
                    <SelectItem value="Mobile App">Mobile App</SelectItem>
                    <SelectItem value="SaaS Platform">SaaS Platform</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
                placeholder="Describe your portfolio project (minimum 50 characters)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} characters (minimum 50 required)
              </p>
            </div>

            <div>
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <Label>Portfolio Image</Label>
              <div className="space-y-4">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Portfolio preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Upload Options */}
                <div className="space-y-3">
                  {/* File Upload */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full"
                    >
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image from Device
                        </>
                      )}
                    </Button>
                  </div>

                  {/* URL Input */}
                  <div>
                    <Label htmlFor="imageUrl">Or enter image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.image}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                {/* Upload Status */}
                {selectedFile && (
                  <div className="text-sm text-gray-600">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                  placeholder="e.g., 3 months"
                />
              </div>
              <div>
                <Label htmlFor="teamSize">Team Size</Label>
                <Input
                  id="teamSize"
                  value={formData.teamSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
                  placeholder="e.g., 5 developers"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="technologies">Technologies</Label>
              <Input
                id="technologies"
                value={formData.technologies.join(', ')}
                onChange={(e) => handleTechnologyChange(e.target.value)}
                placeholder="React, Node.js, MongoDB (comma separated)"
              />
            </div>

            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                />
                <Label htmlFor="published">Published</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : portfolio ? "Update" : "Create"}
              </Button>
            </div>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioForm;
