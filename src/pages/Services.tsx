import { HeroHeader } from "@/components/ui/hero-section-4";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import Footer from "@/components/Footer";
import { useServices } from "@/contexts/ServicesContext";
import { useProducts } from "@/contexts/ProductsContext";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useAuth } from "@/contexts/AuthContext";
import { useTestimonials } from "@/contexts/TestimonialContext";
import AuthGuard from "@/components/AuthGuard";
import { Skeleton } from "@/components/ui/skeleton";
import { createTitleSlug } from "@/utils/serviceUtils";
import {
  ArrowRight,
  Download,
  Palette,
  Code,
  TrendingUp,
  Share2,
  ShoppingCart,
  HelpCircle,
  Mail,
  Key,
  Database,
  BarChart,
  Server,
  HardDrive,
  LifeBuoy,
  Wrench,
  // New icons for better service representation
  Paintbrush,
  Monitor,
  Smartphone,
  Megaphone,
  Users,
  Settings,
  Globe,
  Zap,
  Target,
  Rocket,
  Lightbulb,
  Shield,
  Star,
  Heart,
  Camera,
  FileText,
  Layers,
  Cloud,
  Lock,
  CheckCircle,
} from "lucide-react";

const Services = () => {
  const { services, servicesLoading } = useServices();
  const { featuredTestimonials } = useTestimonials();
  const { products, getProductPrice, formatPrice } = useProducts();
  const { createCheckout, loading: checkoutLoading } = useStripeCheckout();
  const { user } = useAuth();

  // Enhanced icon mapping for different service categories/types
  const getServiceIcon = (iconName: string, serviceTitle?: string) => {
    // Service-specific icon mapping based on title
    const serviceIconMap: { [key: string]: JSX.Element } = {
      "Design": <Paintbrush className="w-12 h-12 text-white" />,
      "Development": <Code className="w-12 h-12 text-white" />,
      "Marketing": <Megaphone className="w-12 h-12 text-white" />,
      "Social Media": <Share2 className="w-12 h-12 text-white" />,
      "Startup House Keeping": <Settings className="w-12 h-12 text-white" />,
      "Consulting": <Users className="w-12 h-12 text-white" />,
      "Analytics": <BarChart className="w-12 h-12 text-white" />,
      "Support": <LifeBuoy className="w-12 h-12 text-white" />,
    };

    // Icon name mapping (legacy support)
    const iconMap: { [key: string]: JSX.Element } = {
      Palette: <Palette className="w-12 h-12 text-white" />,
      Code: <Code className="w-12 h-12 text-white" />,
      TrendingUp: <TrendingUp className="w-12 h-12 text-white" />,
      Share2: <Share2 className="w-12 h-12 text-white" />,
      Mail: <Mail className="w-12 h-12 text-white" />,
      Key: <Key className="w-12 h-12 text-white" />,
      Database: <Database className="w-12 h-12 text-white" />,
      BarChart: <BarChart className="w-12 h-12 text-white" />,
      Server: <Server className="w-12 h-12 text-white" />,
      HardDrive: <HardDrive className="w-12 h-12 text-white" />,
      LifeBuoy: <LifeBuoy className="w-12 h-12 text-white" />,
      Wrench: <Wrench className="w-12 h-12 text-white" />,
      ShoppingCart: <ShoppingCart className="w-12 h-12 text-white" />,
      HelpCircle: <HelpCircle className="w-12 h-12 text-white" />,
      Paintbrush: <Paintbrush className="w-12 h-12 text-white" />,
      Monitor: <Monitor className="w-12 h-12 text-white" />,
      Smartphone: <Smartphone className="w-12 h-12 text-white" />,
      Megaphone: <Megaphone className="w-12 h-12 text-white" />,
      Users: <Users className="w-12 h-12 text-white" />,
      Settings: <Settings className="w-12 h-12 text-white" />,
      Globe: <Globe className="w-12 h-12 text-white" />,
      Zap: <Zap className="w-12 h-12 text-white" />,
      Target: <Target className="w-12 h-12 text-white" />,
      Rocket: <Rocket className="w-12 h-12 text-white" />,
      Lightbulb: <Lightbulb className="w-12 h-12 text-white" />,
      Shield: <Shield className="w-12 h-12 text-white" />,
      Star: <Star className="w-12 h-12 text-white" />,
      Heart: <Heart className="w-12 h-12 text-white" />,
      Camera: <Camera className="w-12 h-12 text-white" />,
      FileText: <FileText className="w-12 h-12 text-white" />,
      Layers: <Layers className="w-12 h-12 text-white" />,
      Cloud: <Cloud className="w-12 h-12 text-white" />,
      Lock: <Lock className="w-12 h-12 text-white" />,
      CheckCircle: <CheckCircle className="w-12 h-12 text-white" />,
      // Fallback mappings for legacy lowercase names
      palette: <Palette className="w-12 h-12 text-white" />,
      code: <Code className="w-12 h-12 text-white" />,
      trending: <TrendingUp className="w-12 h-12 text-white" />,
      share: <Share2 className="w-12 h-12 text-white" />,
      shopping: <ShoppingCart className="w-12 h-12 text-white" />,
      help: <HelpCircle className="w-12 h-12 text-white" />,
    };

    // First try service-specific mapping, then icon name mapping, then fallback
    return (
      serviceIconMap[serviceTitle || ""] || 
      iconMap[iconName] || 
      <Rocket className="w-12 h-12 text-white" />
    );
  };

  // Use Firebase services only, no fallbacks
  const displayServices = services.sort((a, b) => a.order - b.order);

  // Map service categories to Stripe products
  const getStripeProductForService = (service: any) => {
    const categoryMap: { [key: string]: string } = {
      Design: "design",
      Development: "development",
      Marketing: "marketing",
      "Social Media": "social-media",
      Consulting: "consulting",
    };

    const stripeCategory =
      categoryMap[service.title] || categoryMap[service.category];
    return products.find(
      (product) =>
        product.metadata.category === stripeCategory &&
        product.metadata.service_type === "getmvp"
    );
  };

  const handlePurchaseService = (service: any) => {
    // Check if user is authenticated
    if (!user) {
      console.warn("User not authenticated when trying to purchase service");
      return;
    }

    const stripeProduct = getStripeProductForService(service);
    if (stripeProduct) {
      const price = getProductPrice(stripeProduct.id);
      if (price) {
        createCheckout(price.id, stripeProduct.name);
      }
    }
  };

  // Convert database testimonials to the format expected by AnimatedTestimonials
  const testimonials = featuredTestimonials && featuredTestimonials.length > 0 
    ? featuredTestimonials.map(testimonial => ({
        name: testimonial.name,
        designation: testimonial.designation,
        quote: testimonial.quote,
        src: testimonial.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
      }))
    : [
        {
          name: "Mark Patel",
          designation: "Co-Founder",
          quote: "idea2mvp transformed our vision into reality. Their lean approach saved us months of development time.",
          src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
        },
        {
          name: "Tom Davis",
          designation: "Founder",
          quote: "The team's expertise in rapid prototyping helped us validate our concept before major investment.",
          src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
        },
        {
          name: "Sarah Johnson",
          designation: "Founder",
          quote: "Outstanding service and attention to detail. They truly understand the startup ecosystem.",
          src: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
        }
      ];

  return (
    <div className="min-h-screen">
      <HeroHeader />
      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative h-[60vh] mt-16">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              className="h-full w-full object-cover object-center"
              src="https://idea2mvp.net/getmvp/wp-content/uploads/2020/01/about-bg-img-1.jpg"
              alt="Our Services"
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-6xl mx-auto px-6 w-full text-center">
              <h1 className="text-5xl font-bold text-white md:text-6xl lg:text-7xl leading-tight">
                Our Services
              </h1>
              <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Comprehensive solutions to transform your ideas into successful
                products
              </p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-24 bg-background">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">What We Offer</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                From concept to launch, we provide end-to-end services to help
                you build, market, and scale your product successfully.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {servicesLoading
                ? // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="p-8">
                      <Skeleton className="w-12 h-12 mb-6" />
                      <Skeleton className="h-8 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-8" />
                      <Skeleton className="h-10 w-32" />
                    </Card>
                  ))
                : displayServices.map((service, index) => (
                    <Card
                      key={service.id || index}
                      className="relative bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-brand-yellow/20 transition-all duration-500 group overflow-hidden cursor-pointer"
                      onClick={() => {
                        window.location.href = `/getmvp/services/${createTitleSlug(service.title)}`;
                      }}
                    >
                      {/* Background gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Content */}
                      <div className="relative z-10">
                        {/* Icon with animated background */}
                        <div className="mb-6 relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-brand-yellow to-yellow-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                            <div className="text-white drop-shadow-sm">
                              {getServiceIcon(service.icon, service.title)}
                            </div>
                          </div>
                          {/* Subtle glow effect */}
                          <div className="absolute inset-0 w-16 h-16 bg-brand-yellow/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300 -z-10"></div>
                        </div>

                        <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-brand-yellow transition-colors duration-300">
                          {service.title}
                        </h3>

                        <p className="text-muted-foreground mb-8 leading-relaxed">
                          {service.description}
                        </p>

                        {/* Feature badges */}
                        <div className="flex flex-wrap gap-3 mb-6">
                          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Quality Assured
                          </div>
                          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Secure Payment
                          </div>
                          <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            Fast Delivery
                          </div>
                        </div>

                        <Button
                          asChild
                          variant="outline"
                          className="border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-black transition-all duration-300 group-hover:scale-105"
                        >
                          <Link to={`/getmvp/services/${createTitleSlug(service.title)}`}>
                            READ MORE
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Everything you need to know about our services and process.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left text-lg font-medium py-6">
                    What is an MVP and why do I need one?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    An MVP (Minimum Viable Product) is a version of your product
                    with just enough features to satisfy early customers and
                    provide feedback for future development. It allows you to
                    test your idea in the market quickly and cost-effectively,
                    reducing risks and helping you validate demand before
                    investing heavily in full development.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left text-lg font-medium py-6">
                    How long does it take to build an MVP?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    The timeline for MVP development typically ranges from 8-16
                    weeks, depending on the complexity of your idea and the
                    features required. Our standard MVP package is delivered in
                    90 days or less, following our proven lean development
                    process that prioritizes speed without compromising quality.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left text-lg font-medium py-6">
                    What services do you offer?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    We offer a comprehensive suite of services including product
                    design, UX/UI development, full-stack development, market
                    validation, and go-to-market strategy. Our services are
                    customizable to meet your specific needs, from initial
                    concept validation to complete MVP development and launch.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left text-lg font-medium py-6">
                    How much does it cost to build an MVP?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    Our MVP development packages start at $15,000, with pricing
                    varying based on complexity and features. We offer
                    transparent, fixed-price packages so you know exactly what
                    you're investing. During our initial consultation, we'll
                    provide a detailed estimate based on your specific
                    requirements.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left text-lg font-medium py-6">
                    Do you provide ongoing support after the MVP is launched?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    Yes, we offer comprehensive post-launch support including
                    maintenance, updates, and scaling services. We also provide
                    ongoing development support as you iterate on your product
                    based on user feedback and market demands. Our team can help
                    you transition to a full product team or continue as your
                    development partner.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left text-lg font-medium py-6">
                    How do you ensure the quality of the final product?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    We follow industry best practices including agile
                    development methodologies, continuous testing, and code
                    reviews. Our process includes regular check-ins, milestone
                    reviews, and user testing sessions. We also provide
                    comprehensive documentation and training to ensure you can
                    effectively use and maintain your product.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Customer Stories */}
        <section className="bg-background pb-24 pt-12 md:pb-32">
          <div className="mx-auto max-w-6xl px-6 text-center mb-16">
            <h2 className="text-4xl font-medium">What Our Clients Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
              Hear from the founders and leaders who have transformed their
              ideas into successful products with our help.
            </p>
          </div>
          <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-gray-900 to-black text-white text-center">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Idea?
            </h2>
            <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
              Let's discuss how our services can help you build and launch your
              next successful product.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/getmvp/register">
                <Button
                  size="lg"
                  className="bg-brand-yellow text-brand-black hover:bg-yellow-400 px-8 py-3 font-semibold"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/getmvp/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-brand-black text-brand-black hover:bg-brand-black hover:text-white px-8 py-3 font-semibold"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
