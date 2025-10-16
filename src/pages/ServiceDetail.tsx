import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { HeroHeader } from "@/components/ui/hero-section-4";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, ShoppingCart, Check, Mail, Settings } from "lucide-react";
import { useServices } from "@/contexts/ServicesContext";
import { useProducts } from "@/contexts/ProductsContext";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
import { STRIPE_PAYMENT_LINKS } from "@/utils/stripe";
import { findServiceBySlug } from "@/utils/serviceUtils";

const ServiceDetail = () => {
  const { serviceSlug: rawServiceSlug } = useParams();
  // Decode the URL parameter to handle spaces and special characters
  const serviceSlug = rawServiceSlug ? decodeURIComponent(rawServiceSlug) : undefined;
  const { services, servicesLoading } = useServices();
  const { products, getProductPrice, formatPrice } = useProducts();
  const { createCheckout, loading: checkoutLoading } = useStripeCheckout();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const { addToCart, isInCart } = useCart();

  // Removed debug logging - page is working correctly

  // No hardcoded fallback data - use Firebase only

  // Find service from database by title slug only (consistent URL structure)
  // Only search if services are loaded and not empty
  const dbService = services.length > 0 ? findServiceBySlug(services, serviceSlug || "") : null;
  
  console.log('Service lookup:', {
    serviceSlug,
    servicesLoaded: services.length > 0,
    totalServices: services.length,
    dbService: dbService ? {
      id: dbService.id,
      title: dbService.title,
      category: dbService.category
    } : null
  });


  // Show loading while services are being fetched or if services array is empty
  if (servicesLoading || services.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Service Details</h2>
          <p className="text-gray-600">Please wait while we fetch the latest information...</p>
        </div>
      </div>
    );
  }

  // Use database service details only
  const currentService = dbService?.serviceDetails;

  console.log('ServiceDetail Debug:', {
    serviceSlug,
    allServices: services.map(s => ({
      id: s.id,
      title: s.title,
      category: s.category,
      titleSlug: s.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
    })),
    dbService: dbService ? {
      id: dbService.id,
      title: dbService.title,
      category: dbService.category,
      hasServiceDetails: !!dbService.serviceDetails
    } : null,
    currentService: currentService ? 'exists' : 'missing'
  });

  if (!dbService) {
    // Redirect to 404 page for services that don't exist
    return <Navigate to="/404" replace />;
  }

  if (!currentService || !currentService.leftSection || !currentService.rightSection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Details Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            The service details for "{dbService?.title}" are being configured. 
            Please check back later or contact us for more information.
          </p>
          <div className="space-y-3">
            <Link to="/getmvp/services">
              <Button className="w-full">
                View All Services
              </Button>
            </Link>
            <Link to="/getmvp/contact">
              <Button variant="outline" className="w-full">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get Stripe product for this service
  const getStripeProductForService = () => {
    const categoryMap: { [key: string]: string } = {
      design: "design",
      development: "development",
      marketing: "marketing",
      social: "social-media",
      consulting: "house-keeping", // Fixed: Consulting services are categorized as house-keeping in products
    };

    // Use the service category instead of the slug
    const serviceCategory = dbService?.category?.toLowerCase() || "development";
    const stripeCategory = categoryMap[serviceCategory];
    
    return products.find(
      (product) =>
        product.metadata.category === stripeCategory &&
        product.metadata.service_type === "getmvp"
    );
  };

  const stripeProduct = getStripeProductForService();
  const price = stripeProduct ? getProductPrice(stripeProduct.id) : null;

  const handlePurchase = () => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start your project.",
        variant: "destructive",
      });
      openAuthModal("login");
      return;
    }

    if (stripeProduct && price) {
      createCheckout(price.id, stripeProduct.name);
    }
  };

  // Parse amount string to extract numeric price
  const parseAmountToPrice = (amount: string | undefined): number => {
    if (!amount) return 0;

    // Extract numeric value from strings like "$50/year", "$10/month", "$125/month"
    const match = amount.match(/\$?(\d+(?:\.\d+)?)/);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }

    return 0;
  };

  // Handle adding service to cart
  const handleAddToCart = async (service: any) => {
    // Determine numeric price
    // Priority: 1) existing numeric price, 2) parse from amount string, 3) default to 0
    let numericPrice = 0;

    if (typeof service.price === 'number') {
      numericPrice = service.price;
    } else if (service.amount) {
      numericPrice = parseAmountToPrice(service.amount);
    }

    // Create cart item from service
    const cartItem = {
      serviceId: `${serviceSlug}-${service.title.toLowerCase().replace(/\s+/g, '-')}`,
      title: service.title,
      description: service.description,
      price: numericPrice,
      amount: service.amount || 'Contact for Quote',
      icon: service.icon,
      category: serviceSlug || 'general',
      serviceType: 'individual' as const,
      paymentLink: service.paymentLink,
      quantity: 1,
    };

    await addToCart(cartItem);
  };

  // Handle individual service purchases using payment links (for direct purchase)
  const handleServicePurchase = (service: any) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase this service.",
        variant: "destructive",
      });
      openAuthModal("login");
      return;
    }

    // First priority: Use direct payment link stored in service data
    if (service.paymentLink) {
      window.location.href = service.paymentLink;
      return;
    }

    // Second priority: Use payment link from STRIPE_PAYMENT_LINKS mapping
    if (service.price) {
      const paymentUrl = STRIPE_PAYMENT_LINKS[service.price];
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      // Fallback to createCheckout if no payment link found
      createCheckout(service.price, service.title);
    }
  };

  // Check if any individual services have pricing
  const hasIndividualPricing =
    currentService?.leftSection?.services?.some(
      (service: any) => service.price || service.amount
    ) ||
    currentService?.rightSection?.services?.some(
      (service: any) => service.price || service.amount
    );

  // Check if ALL services require quotes (no pricing at all)
  const allServicesRequireQuote =
    !hasIndividualPricing &&
    currentService?.leftSection?.services?.length > 0 &&
    currentService?.rightSection?.services?.length > 0;

  return (
    <div className="min-h-screen">
      <HeroHeader />
      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative h-[40vh] mt-16">
          <div className="absolute inset-0">
            <img
              className="h-full w-full object-cover object-center"
              src="https://idea2mvp.net/getmvp/wp-content/uploads/2020/01/about-bg-img-1.jpg"
              alt={currentService.leftSection.title}
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>

          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-6xl mx-auto px-6 w-full">
              <Link
                to="/getmvp/services"
                className="inline-flex items-center text-brand-yellow hover:text-yellow-400 transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
              </Link>
              <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl leading-tight">
                {currentService.leftSection.title}
              </h1>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Title */}
            <div className="text-center mb-16">
              <div className="inline-block bg-brand-yellow text-brand-black px-8 py-4 rounded-full text-2xl md:text-3xl font-bold mb-8 animate-fade-in-up">
                {currentService.title}
              </div>
            </div>

            {/* Service Cards Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Section Services */}
              {currentService.leftSection.services.map((service: any, index: number) => (
                <Card
                  key={`left-${index}`}
                  className="relative bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-brand-yellow/20 transition-all duration-500 group overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex gap-6">
                      {/* Icon with animated background */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                          <div className="text-white text-2xl">
                            {service.icon}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 group-hover:text-brand-yellow transition-colors duration-300">
                          {service.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-lg mb-6">
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

                        {service.price && service.amount ? (
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-brand-yellow">
                              {service.amount}
                            </span>
                            <div className="flex gap-2">
                              {!isInCart(`${serviceSlug}-${service.title.toLowerCase().replace(/\s+/g, '-')}`) ? (
                                <Button
                                  onClick={() => handleAddToCart(service)}
                                  className="bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold group-hover:scale-105 transition-transform duration-300"
                                >
                                  <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    Add to Cart
                                  </div>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="border-green-500 text-green-600 hover:bg-green-50 font-semibold"
                                  disabled
                                >
                                  <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    In Cart
                                  </div>
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                onClick={() => handleServicePurchase(service)}
                                disabled={checkoutLoading}
                                className="border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-black transition-all duration-300"
                              >
                                {checkoutLoading ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                  </div>
                                ) : (
                                  "Buy Now"
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAddToCart(service)}
                              className="bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold group-hover:scale-105 transition-transform duration-300"
                            >
                              <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </div>
                            </Button>
                            <Button
                              variant="outline"
                              className="border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-black transition-all duration-300 group-hover:scale-105"
                            >
                              Learn More
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Right Section Services */}
              {currentService.rightSection.services.map((service: any, index: number) => (
                <Card
                  key={`right-${index}`}
                  className="relative bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-brand-yellow/20 transition-all duration-500 group overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${(index + currentService.leftSection.services.length) * 0.1}s` }}
                >
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex gap-6">
                      {/* Icon with animated background */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                          <div className="text-white text-2xl">
                            {service.icon}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 group-hover:text-brand-yellow transition-colors duration-300">
                          {service.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-lg mb-6">
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

                        {service.price && service.amount ? (
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-brand-yellow">
                              {service.amount}
                            </span>
                            <div className="flex gap-2">
                              {!isInCart(`${serviceSlug}-${service.title.toLowerCase().replace(/\s+/g, '-')}`) ? (
                                <Button
                                  onClick={() => handleAddToCart(service)}
                                  className="bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold group-hover:scale-105 transition-transform duration-300"
                                >
                                  <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    Add to Cart
                                  </div>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="border-green-500 text-green-600 hover:bg-green-50 font-semibold"
                                  disabled
                                >
                                  <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    In Cart
                                  </div>
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                onClick={() => handleServicePurchase(service)}
                                disabled={checkoutLoading}
                                className="border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-black transition-all duration-300"
                              >
                                {checkoutLoading ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                  </div>
                                ) : (
                                  "Buy Now"
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAddToCart(service)}
                              className="bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold group-hover:scale-105 transition-transform duration-300"
                            >
                              <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </div>
                            </Button>
                            <Button
                              variant="outline"
                              className="border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-black transition-all duration-300 group-hover:scale-105"
                            >
                              Learn More
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section - Only show if no individual service pricing exists */}
        {stripeProduct && price && !hasIndividualPricing && (
          <section className="py-24 bg-gray-50">
            <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Choose your package and start your {serviceSlug} project today
                </p>
              </div>

              <Card className="bg-white border-2 border-brand-yellow shadow-2xl rounded-3xl overflow-hidden max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-yellow to-yellow-400 text-brand-black text-center py-8">
                  <h3 className="text-3xl font-bold mb-2">
                    {stripeProduct.name}
                  </h3>
                  <div className="text-5xl font-bold mb-2">
                    {formatPrice(price.unit_amount, price.currency)}
                  </div>
                  <div className="text-lg opacity-90">One-time payment</div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="mb-8">
                    <p className="text-gray-600 text-lg text-center mb-8">
                      {stripeProduct.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-3">
                        <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">
                          Complete project delivery within agreed timeline
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">
                          Professional consultation and planning
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">
                          Unlimited revisions until satisfaction
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">
                          Post-delivery support and guidance
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">
                          All source files and documentation included
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={handlePurchase}
                      disabled={checkoutLoading}
                      size="lg"
                      className="w-full bg-brand-yellow text-brand-black hover:bg-yellow-400 font-bold text-lg py-4"
                    >
                      {checkoutLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="w-5 h-5" />
                          Start Project Now
                        </div>
                      )}
                    </Button>

                    {/* Trust Elements */}
                    <div className="text-center mt-6 text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-4 flex-wrap">
                        <span>✓ Secure Payment</span>
                        <span>✓ Money-back Guarantee</span>
                        <span>✓ 24/7 Support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Alternative Option */}
              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">
                  Need a custom solution or have questions?
                </p>
                <Link to="/getmvp/contact">
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Contact Us for Custom Quote
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Contact for Quote section for services without pricing */}
        {allServicesRequireQuote && (
          <section className="py-24 bg-gradient-to-r from-gray-900 to-black text-white text-center">
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
                All our {serviceSlug} services are customized to your specific
                needs. Contact us for a personalized quote and let's discuss how
                we can help you achieve your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/getmvp/contact">
                  <Button
                    size="lg"
                    className="bg-brand-yellow text-brand-black hover:bg-yellow-400 px-8 py-3 font-semibold"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Contact for Quote
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/getmvp/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-black px-8 py-3 font-semibold"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Alternative CTA for services without Stripe integration */}
        {!(stripeProduct && price) && !allServicesRequireQuote && (
          <section className="py-24 bg-gradient-to-r from-gray-900 to-black text-white text-center">
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
                Let's discuss how our {serviceSlug} services can help you
                achieve your goals and build your next successful product.
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
                    className="border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-black px-8 py-3 font-semibold"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
