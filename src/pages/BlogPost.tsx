import { useParams, useNavigate } from "react-router-dom";
import { HeroHeader } from "@/components/ui/hero-section-4";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowLeft, Share2, Eye } from "lucide-react";
import { useBlog } from "@/contexts/BlogContext";
import { useEffect, useState } from "react";
import { BlogPost as BlogPostType } from "@/contexts/BlogContext";
import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Process content with marked and fix escaped backslashes
const convertMarkdownToHtml = (content: string): string => {
  // First, fix escaped backslashes in numbered lists
  const cleanedContent = content
    .replace(/\\(\d+)\./g, '$1.')
    // Fix other common escaped characters
    .replace(/\\#/g, '#')
    .replace(/\\-/g, '-')
    .replace(/\\\*/g, '*');
  
  // Convert markdown to HTML
  const htmlContent = marked(cleanedContent);
  
  // Add custom styling to numbered list items
  return htmlContent
    .replace(/^(\d+)\.\s+(.*?)$/gm, '<div class="numbered-list-item mb-4"><span class="font-bold text-lg text-gray-800">$1. $2</span></div>')
    .replace(/<h5>/g, '<h5 class="text-lg font-bold mt-6 mb-3">')
    .replace(/<h4>/g, '<h4 class="text-xl font-bold mt-6 mb-4">')
    .replace(/<h3>/g, '<h3 class="text-2xl font-bold mt-8 mb-4">')
    .replace(/<h2>/g, '<h2 class="text-3xl font-bold mt-8 mb-6">')
    .replace(/<h1>/g, '<h1 class="text-4xl font-bold mt-8 mb-6">')
    .replace(/<p>/g, '<p class="mb-4 leading-relaxed">')
    .replace(/<ul>/g, '<ul class="mb-4 ml-4 list-disc">')
    .replace(/<ol>/g, '<ol class="mb-4 ml-4 list-decimal">')
    .replace(/<li>/g, '<li class="mb-2">');
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { blogs, blogsLoading } = useBlog();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('BlogPost useEffect - slug:', slug);
    console.log('BlogPost useEffect - blogsLoading:', blogsLoading);
    console.log('BlogPost useEffect - blogs:', blogs);
    
    if (!blogsLoading && slug) {
      const foundPost = blogs.find(blog => blog.slug === slug && blog.published);
      console.log('Found post:', foundPost);
      setPost(foundPost || null);
      setLoading(false);
    }
  }, [blogs, blogsLoading, slug]);

  if (loading || blogsLoading) {
    return (
      <div className="min-h-screen">
        <HeroHeader />
        <main className="overflow-x-hidden">
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <div className="animate-pulse">Loading blog post...</div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <HeroHeader />
        <main className="overflow-x-hidden">
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl font-bold mb-4">Blog Post Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The blog post you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/getmvp/blog")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  return (
    <div className="min-h-screen">
      <HeroHeader />
      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative h-[60vh] mt-16">
          <div className="absolute inset-0">
            <img
              className="h-full w-full object-cover object-center"
              src={post.image}
              alt={post.title}
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-4xl mx-auto px-6 w-full">
              <div className="mb-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/getmvp/blog")}
                  className="text-white hover:text-brand-yellow mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-white/80 mb-4">
                <Badge className="bg-brand-yellow/20 text-brand-yellow border-brand-yellow/30">
                  {post.category}
                </Badge>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {post.createdAt.toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {post.author}
                </div>
                {post.featured && (
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {post.title}
              </h1>
              <p className="mt-4 text-xl text-white/90 max-w-3xl leading-relaxed">
                {post.excerpt}
              </p>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Article Actions */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>Reading time: ~{Math.ceil(post.content.length / 1000)} min</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sharePost}
                  className="flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              </div>

              {/* Article Body */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-lg leading-relaxed text-slate-700 space-y-6"
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(post.content) }}
                />
              </div>

              {/* Article Footer */}
              <div className="mt-12 pt-8 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-muted-foreground">
                      <strong>Published:</strong> {post.createdAt.toLocaleDateString()}
                    </div>
                    {post.updatedAt && post.updatedAt.getTime() !== post.createdAt.getTime() && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Updated:</strong> {post.updatedAt.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                </div>
              </div>

              {/* Navigation to other posts */}
              <div className="mt-12 pt-8 border-t">
                <div className="text-center">
                  <Button
                    onClick={() => navigate("/getmvp/blog")}
                    className="bg-brand-yellow text-brand-black hover:bg-yellow-400"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    View All Blog Posts
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Stay Updated</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Subscribe to our newsletter to get the latest insights on
                startup development and MVP creation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
                <Button className="bg-brand-yellow text-brand-black hover:bg-yellow-400 whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;