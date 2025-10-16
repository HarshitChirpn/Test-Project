import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { X, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  slug: string;
  image: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogFormProps {
  onClose: () => void;
  onSuccess: () => void;
  blog?: Blog | null;
}

const BlogForm: React.FC<BlogFormProps> = ({ onClose, onSuccess, blog }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(blog?.image || "");
  const [formInitialized, setFormInitialized] = useState(false);
  const [formData, setFormData] = useState({
    title: blog?.title || "",
    content: blog?.content || "",
    excerpt: blog?.excerpt || "",
    author: blog?.author || "",
    category: blog?.category || "",
    slug: blog?.slug || "",
    image: blog?.image || "",
    featured: blog?.featured || false,
    published: blog?.published || false
  });

  // Update form data when blog prop changes
  useEffect(() => {
    console.log('BlogForm - Blog prop changed:', blog);
    if (blog) {
      const newFormData = {
        title: blog.title || "",
        content: blog.content || "",
        excerpt: blog.excerpt || "",
        author: blog.author || "",
        category: blog.category || "",
        slug: blog.slug || "",
        image: blog.image || "",
        featured: blog.featured || false,
        published: blog.published || false
      };
      console.log('BlogForm - Setting form data:', newFormData);
      setFormData(newFormData);
      setImagePreview(blog.image || "");
    } else {
      // Reset form for new blog
      const resetFormData = {
        title: "",
        content: "",
        excerpt: "",
        author: "",
        category: "",
        slug: "",
        image: "",
        featured: false,
        published: false
      };
      console.log('BlogForm - Resetting form data:', resetFormData);
      setFormData(resetFormData);
      setImagePreview("");
    }
    setFormInitialized(true);
  }, [blog]);

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

    if (!formData.content || formData.content.length < 100) {
      toast({
        title: "Validation Error",
        description: "Content must be at least 100 characters long",
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
        image: formData.image || "",
        // Generate slug from title if not provided
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        // Generate excerpt from content if not provided
        excerpt: formData.excerpt || formData.content.substring(0, 200) + '...'
      };

      // Debug logging
      console.log('Submitting blog data:', submitData);

      if (blog) {
        // Update existing blog
        console.log('Updating blog with ID:', blog._id);
        console.log('Update URL:', `/blogs/${blog._id}`);
        console.log('Update data:', submitData);
        await api.put(`/blogs/${blog._id}`, submitData);
        toast({
          title: "Success",
          description: "Blog post updated successfully",
        });
      } else {
        // Create new blog
        await api.post("/blogs", submitData);
        toast({
          title: "Success",
          description: "Blog post created successfully",
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Blog submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save blog post';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

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
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview("");
    setFormData(prev => ({ ...prev, image: "" }));
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    setImagePreview(url);
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{blog ? "Edit Blog Post" : "Create Blog Post"}</CardTitle>
              <CardDescription>
                {blog ? "Update blog post details" : "Add a new blog post"}
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
                    placeholder="Enter blog title (min 5 characters)"
                    required
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
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Web App">Web App</SelectItem>
                      <SelectItem value="Mobile App">Mobile App</SelectItem>
                      <SelectItem value="SaaS Platform">SaaS Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the blog post (optional - will be auto-generated from content)"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.excerpt.length}/500 characters
                </p>
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your blog content here (minimum 100 characters)"
                  rows={8}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.content.length} characters (minimum 100 required)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="URL-friendly slug (auto-generated from title)"
                  />
                </div>
              </div>

              <div>
                <Label>Blog Image</Label>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Blog preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={handleRemoveImage}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingImage ? "Uploading..." : "Upload Image from Device"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {selectedFile && (
                      <Button
                        type="button"
                        onClick={uploadImage}
                        disabled={uploadingImage}
                        className="ml-2"
                      >
                        {uploadingImage ? "Uploading..." : "Upload Image"}
                      </Button>
                    )}
                    
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
                </div>
              </div>

              <div className="flex space-x-4">
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
                  {loading ? "Saving..." : blog ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogForm;
