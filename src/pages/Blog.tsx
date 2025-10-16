import { HeroHeader } from "@/components/ui/hero-section-4";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, User, ArrowRight } from "lucide-react";
import { useBlog } from "@/contexts/BlogContext";
import { contactService } from "@/services/contactService";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const Blog = () => {
  const { featuredBlog, recentBlogs, blogsLoading } = useBlog();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    
    setSubscribing(true);
    try {
      const result = await contactService.subscribeToNewsletter(newsletterEmail, '', 'blog');
      
      if (result.success) {
        toast({
          title: "Successfully Subscribed!",
          description: "You'll receive our latest insights on startup development.",
        });
        setNewsletterEmail('');
      } else {
        if (result.error?.message?.includes('already subscribed')) {
          toast({
            title: "Already Subscribed",
            description: "This email is already on our newsletter list.",
            variant: "destructive",
          });
        } else {
          throw new Error('Subscription failed');
        }
      }
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubscribing(false);
    }
  };

  if (blogsLoading) {
    return (
      <div className="min-h-screen">
        <HeroHeader />
        <main className="overflow-x-hidden">
          <section className="relative h-[60vh] mt-16">
            <div className="absolute inset-0">
              <img
                className="h-full w-full object-cover object-center"
                src="https://idea2mvp.net/getmvp/wp-content/uploads/2020/01/about-bg-img-1.jpg"
                alt="We provide a wide range of Services for start-ups"
              />
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-6xl mx-auto px-6 w-full text-center">
                <h1 className="text-5xl font-bold text-white md:text-6xl lg:text-7xl leading-tight">
                  Blogs
                </h1>
                <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  We provide a wide range of Services for start-up.
                </p>
              </div>
            </div>
          </section>
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <div className="animate-pulse">Loading blogs...</div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroHeader />
      <main className="overflow-x-hidden">
        {/* Hero Section */}
        {/* Hero Section */}
        <section className="relative h-[60vh] mt-16">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              className="h-full w-full object-cover object-center"
              src="https://idea2mvp.net/getmvp/wp-content/uploads/2020/01/about-bg-img-1.jpg"
              alt="We provide a wide range of Services for start-ups"
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-6xl mx-auto px-6 w-full text-center">
              <h1 className="text-5xl font-bold text-white md:text-6xl lg:text-7xl leading-tight">
                Blogs{" "}
              </h1>
              <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                We provide a wide range of Services for start-up.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            {featuredBlog && (
                <div className="max-w-4xl mx-auto">
                  <Badge className="bg-brand-yellow/10 text-brand-yellow mb-4">
                    Featured Post
                  </Badge>
                  <Card className="relative bg-white border-2 border-gray-100 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-brand-yellow/20 transition-all duration-500 group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <img
                          src={featuredBlog.image}
                          alt={featuredBlog.title}
                          className="h-64 object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-8">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {featuredBlog.createdAt.toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {featuredBlog.author}
                          </div>
                          <Badge variant="secondary">{featuredBlog.category}</Badge>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 hover:text-brand-yellow transition-smooth text-left">
                          {featuredBlog.title}
                        </h2>
                        <p className="text-muted-foreground mb-6 leading-relaxed text-justify">
                          {featuredBlog.excerpt}
                        </p>
                        <Button 
                          className="bg-brand-yellow text-brand-black hover:bg-yellow-400"
                          onClick={() => {
                            console.log('Navigating to featured blog:', `/getmvp/blog/${featuredBlog.slug}`);
                            console.log('Featured blog data:', featuredBlog);
                            navigate(`/getmvp/blog/${featuredBlog.slug}`);
                          }}
                        >
                          Read More <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
          </div>
        </section>

        {/* Recent Posts */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">
              Recent Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentBlogs.map((post, index) => (
                  <Card
                    key={post.id}
                    className="relative bg-white border-2 border-gray-100 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-brand-yellow/20 transition-all duration-500 group overflow-hidden cursor-pointer"
                    onClick={() => {
                      console.log('Card clicked, navigating to:', `/getmvp/blog/${post.slug}`);
                      navigate(`/getmvp/blog/${post.slug}`);
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-48 object-cover w-full rounded-t-3xl mb-6"
                    />
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {post.createdAt.toLocaleDateString()}
                        </div>
                        <Badge variant="secondary">{post.category}</Badge>
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-brand-yellow transition-smooth text-left">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-justify">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="w-4 h-4 mr-1" />
                          {post.author}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="group-hover:text-brand-yellow transition-smooth"
                          onClick={() => {
                            console.log('Navigating to:', `/getmvp/blog/${post.slug}`);
                            console.log('Post data:', post);
                            navigate(`/getmvp/blog/${post.slug}`);
                          }}
                        >
                          Read More <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Stay Updated</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Subscribe to our newsletter to get the latest insights on
                startup development and MVP creation.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  disabled={subscribing}
                  className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow disabled:opacity-50"
                />
                <Button 
                  type="submit" 
                  disabled={subscribing || !newsletterEmail.trim()}
                  className="bg-brand-yellow text-brand-black hover:bg-yellow-400 whitespace-nowrap disabled:opacity-50"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
