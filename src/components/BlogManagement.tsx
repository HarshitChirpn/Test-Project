import { useState } from "react";
import { useBlog, BlogPost } from "@/contexts/BlogContext";
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
  FileText,
  Star,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

const BlogManagement = () => {
  const { blogs, blogsLoading, createBlog, updateBlog, deleteBlog } = useBlog();
  const { toast } = useToast();

  const blogCategories = [
    "All",
    "Web App",
    "Mobile App",
    "SaaS Platform"
  ] as const;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    create: false,
    update: false,
    delete: false,
  });

  const [blogForm, setBlogForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    image: "",
    featured: false,
    published: true,
  });

  const resetForm = () => {
    setBlogForm({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      image: "",
      featured: false,
      published: true,
    });
  };

  const handleCreate = async () => {
    setLoadingStates((prev) => ({ ...prev, create: true }));
    try {
      await createBlog(blogForm);
      setCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, create: false }));
    }
  };

  const handleEdit = async () => {
    if (!selectedBlog) return;

    setLoadingStates((prev) => ({ ...prev, update: true }));
    try {
      await updateBlog(selectedBlog.id, blogForm);
      setEditDialogOpen(false);
      setSelectedBlog(null);
      resetForm();
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, update: false }));
    }
  };

  const handleDelete = async () => {
    if (!selectedBlog) return;

    setLoadingStates((prev) => ({ ...prev, delete: true }));
    try {
      await deleteBlog(selectedBlog.id);
      setDeleteDialogOpen(false);
      setSelectedBlog(null);
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, delete: false }));
    }
  };

  const openEditDialog = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setBlogForm({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      image: blog.image,
      featured: blog.featured,
      published: blog.published,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setDeleteDialogOpen(true);
  };

  if (blogsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Blog Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading blogs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Blog Management</span>
            </CardTitle>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Blog Post</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] lg:max-w-2xl w-[85vw] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Blog Post</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new blog post.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={blogForm.title}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, title: e.target.value })
                      }
                      placeholder="Enter blog title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={blogForm.category}
                      onValueChange={(value) =>
                        setBlogForm({ ...blogForm, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {blogCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <ImageUpload
                      value={blogForm.image}
                      onChange={(url) => setBlogForm({ ...blogForm, image: url })}
                      onRemove={() => setBlogForm({ ...blogForm, image: "" })}
                      folder="blog-images"
                      label="Blog Image"
                      placeholder="Select a blog image to upload"
                    />
                  </div>
                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={blogForm.excerpt}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, excerpt: e.target.value })
                      }
                      placeholder="Enter blog excerpt"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={blogForm.content}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, content: e.target.value })
                      }
                      placeholder="Enter blog content"
                      rows={6}
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={blogForm.featured}
                        onCheckedChange={(checked) =>
                          setBlogForm({ ...blogForm, featured: checked })
                        }
                      />
                      <Label htmlFor="featured">Featured Post</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={blogForm.published}
                        onCheckedChange={(checked) =>
                          setBlogForm({ ...blogForm, published: checked })
                        }
                      />
                      <Label htmlFor="published">Published</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={loadingStates.create}
                  >
                    {loadingStates.create ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Blog Post"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Blog Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Blog Posts ({blogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {blogs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No blog posts
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new blog post.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {blog.featured && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="font-medium">{blog.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{blog.category}</Badge>
                    </TableCell>
                    <TableCell>{blog.author}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {blog.published ? (
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
                    <TableCell>{blog.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(blog)}
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
                          onClick={() => openDeleteDialog(blog)}
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
        <DialogContent className="sm:max-w-[400px] lg:max-w-2xl w-[85vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>Update the blog post details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={blogForm.title}
                onChange={(e) =>
                  setBlogForm({ ...blogForm, title: e.target.value })
                }
                placeholder="Enter blog title"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={blogForm.category}
                onValueChange={(value) =>
                  setBlogForm({ ...blogForm, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {blogCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <ImageUpload
                value={blogForm.image}
                onChange={(url) => setBlogForm({ ...blogForm, image: url })}
                onRemove={() => setBlogForm({ ...blogForm, image: "" })}
                folder="blog-images"
                label="Blog Image"
                placeholder="Select a blog image to upload"
              />
            </div>
            <div>
              <Label htmlFor="edit-excerpt">Excerpt</Label>
              <Textarea
                id="edit-excerpt"
                value={blogForm.excerpt}
                onChange={(e) =>
                  setBlogForm({ ...blogForm, excerpt: e.target.value })
                }
                placeholder="Enter blog excerpt"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={blogForm.content}
                onChange={(e) =>
                  setBlogForm({ ...blogForm, content: e.target.value })
                }
                placeholder="Enter blog content"
                rows={6}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-featured"
                  checked={blogForm.featured}
                  onCheckedChange={(checked) =>
                    setBlogForm({ ...blogForm, featured: checked })
                  }
                />
                <Label htmlFor="edit-featured">Featured Post</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-published"
                  checked={blogForm.published}
                  onCheckedChange={(checked) =>
                    setBlogForm({ ...blogForm, published: checked })
                  }
                />
                <Label htmlFor="edit-published">Published</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={loadingStates.update}>
              {loadingStates.update ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Blog Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedBlog?.title}"? This
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

export default BlogManagement;
