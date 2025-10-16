import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "@/components/ui/hero-section-4";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useProducts } from "@/contexts/ProductsContext";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { X, Loader2, ShoppingCart, Plus } from "lucide-react";
const Perks = () => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [errorSimilar, setErrorSimilar] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [errorOffers, setErrorOffers] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showCartOverlay, setShowCartOverlay] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { products, getProductPrice, formatPrice } = useProducts();
  const { createCheckout, loading: checkoutLoading } = useStripeCheckout();

  // Function to fetch all perks/offers from the API
  const fetchOffers = async () => {
    setLoadingOffers(true);
    setErrorOffers(null);

    try {
      // Since the general /items endpoint requires authentication,
      // let's use the similar_items endpoint from known items to get data
      const knownSlugs = [
        "google-cloud-cloud-credits-google-workspace",
        "aws-aws-activate",
        "hubspot-hubspot-for-startups",
        "notion-notion-for-startups",
        "stripe-stripe-startup-stack",
      ];

      const allOffers = [];

      // Fetch similar items from multiple known slugs to get a variety of perks
      for (const slug of knownSlugs) {
        try {
          const params = new URLSearchParams();
          params.append("include", "seller,categories,deal");
          params.append("page[number]", "1");
          params.append("page[size]", "10");
          params.append(
            "fields[item]",
            "name,slug,deal,partner_description,description,review_rating_stars_average,endorsed,seller,categories"
          );
          params.append(
            "fields[deal]",
            "average_total_savings_currency,average_total_savings_amount,average_total_savings_prefix,id,title"
          );
          params.append("fields[category]", "name");
          params.append("fields[seller]", "name,logo_url,symbol_logo_url");
          params.append("similar_by", "category");

          const response = await fetch(
            `https://api.builtfirst.com/api/v3/items/${slug}/similar_items?${params}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                Origin: "https://openvc-founders.builtfirst.com",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              allOffers.push(...data.data);
            }
          }
        } catch (error) {
          console.log(`Failed to fetch from ${slug}:`, error);
          // Continue with other slugs
        }

        // Add a small delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Remove duplicates based on slug
      const uniqueOffers = allOffers.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.slug === item.slug)
      );

      // Transform API data to match our component structure
      const transformedOffers = uniqueOffers.map((item) => ({
        name: item.seller?.name || item.name,
        title: item.deal?.title || item.name,
        savings:
          item.deal?.average_total_savings_amount &&
          item.deal?.average_total_savings_currency
            ? `${item.deal.average_total_savings_prefix || "Save"} ${
                item.deal.average_total_savings_currency
              }${item.deal.average_total_savings_amount.toLocaleString()}`
            : "Special Offer",
        category: item.categories?.[0]?.name || "Other",
        logo: item.seller?.symbol_logo_url || item.seller?.logo_url,
        description:
          item.description ||
          item.partner_description ||
          "Exclusive deal for startups",
        slug: item.slug,
        rawData: item, // Keep original data for similar items API
      }));

      if (transformedOffers.length > 0) {
        setOffers(transformedOffers);
        console.log(
          `Successfully loaded ${transformedOffers.length} offers from API`
        );
      } else {
        console.log("No offers found from API, using fallback data");
        throw new Error("No offers found");
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setErrorOffers("Failed to load perks. Using sample data.");

      // Fallback to curated sample offers that represent real deals
      setOffers([
        {
          name: "Google Cloud",
          title: "Google Cloud for Startups Program - Bootstrapped",
          savings: "Save up to $200,000",
          category: "Cloud Infrastructure",
          logo: "https://upload.wikimedia.org/wikipedia/commons/0/01/Google-cloud-platform.svg",
          description:
            "Bringing together the best of Google's products and people, the Google for Startups Cloud Program provides your business with financial support, technical guidance, and access to Google's network.",
          slug: "google-cloud-cloud-credits-google-workspace",
        },
        {
          name: "AWS",
          title: "$1,000 Activate Credits",
          savings: "Save $1,000",
          category: "Cloud Infrastructure",
          logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
          description:
            "Amazon Web Services provides startups with low cost, easy to use infrastructure needed to scale and grow any size business.",
          slug: "aws-aws-activate",
        },
        {
          name: "HubSpot",
          title: "Unlock 90% OFF HubSpot for Startups",
          savings: "Save up to $20,000",
          category: "CRM & Marketing",
          logo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg",
          description:
            "HubSpot is the CRM for scaling companies. We build marketing, sales, and service software that helps your business grow without compromise.",
          slug: "hubspot-hubspot-for-startups",
        },
        {
          name: "Notion",
          title: "Notion for Startups",
          savings: "Save up to $1,000",
          category: "Productivity",
          logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
          description:
            "Notion is the all-in-one workspace for your notes, tasks, wikis, and databases.",
          slug: "notion-notion-for-startups",
        },
        {
          name: "Stripe",
          title: "Stripe Startup Stack",
          savings: "Processing fee waiver",
          category: "Payments",
          logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
          description:
            "Online payment processing for internet businesses. Stripe is a suite of payment APIs that powers commerce for businesses of all sizes.",
          slug: "stripe-stripe-startup-stack",
        },
      ]);
    } finally {
      setLoadingOffers(false);
    }
  };

  // Function to fetch similar items
  const fetchSimilarItems = async (
    slug = "google-cloud-cloud-credits-google-workspace"
  ) => {
    setLoadingSimilar(true);
    setErrorSimilar(null);

    try {
      const params = new URLSearchParams();
      params.append("include", "seller,categories,deal");
      params.append("page[number]", "1");
      params.append("page[size]", "6");
      params.append(
        "fields[item]",
        "name,slug,deal,partner_description,description,review_rating_stars_average,endorsed,seller,categories"
      );
      params.append(
        "fields[deal]",
        "average_total_savings_currency,average_total_savings_amount,average_total_savings_prefix,id,title"
      );
      params.append("fields[category]", "name");
      params.append("fields[seller]", "name,logo_url,symbol_logo_url");
      params.append("similar_by", "category");

      const response = await fetch(
        `https://api.builtfirst.com/api/v3/items/${slug}/similar_items?${params}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Origin: "https://openvc-founders.builtfirst.com",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSimilarItems(data.data || []);
    } catch (error) {
      console.error("Error fetching similar items:", error);
      setErrorSimilar("Failed to load similar items");
      setSimilarItems([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Disabled API fetch for now since we're using iframe
  // useEffect(() => {
  //   fetchOffers();
  // }, []);

  // Fetch similar items when a modal opens
  useEffect(() => {
    if (selectedOffer) {
      fetchSimilarItems(selectedOffer.slug);
    } else {
      // Clear similar items when modal closes
      setSimilarItems([]);
      setErrorSimilar(null);
    }
  }, [selectedOffer]);

  const categories = [...new Set(offers.map((offer) => offer.category))];

  const getCategoryColor = (category: string) => {
    const colors = [
      "bg-primary/10 text-primary",
      "bg-accent/10 text-accent",
      "bg-neon-green/10 text-neon-green",
      "bg-neon-pink/10 text-neon-pink",
      "bg-neon-cyan/10 text-neon-cyan",
    ];
    return colors[categories.indexOf(category) % colors.length];
  };

  // Cart functionality with authentication check
  const addToCart = (serviceName, serviceUrl) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add services to your cart.",
        variant: "destructive",
      });
      openAuthModal("login");
      return;
    }

    const newItem = {
      id: Date.now(),
      name: serviceName,
      url: serviceUrl,
      timestamp: new Date().toISOString(),
      userId: user.uid,
    };

    setCartItems((prev) => [...prev, newItem]);

    toast({
      title: "Added to Cart!",
      description: `${serviceName} has been added to your cart. We'll process this manually for you.`,
    });
  };

  // Function to handle cart button click
  const handleCartClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your cart.",
        variant: "destructive",
      });
      openAuthModal("login");
      return;
    }
    setShowCartOverlay(true);
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const requestPurchase = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some services to your cart first.",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would send the cart data to your backend
    console.log("Cart items to process:", cartItems);

    toast({
      title: "Purchase Request Submitted!",
      description: `We've received your request for ${cartItems.length} service(s). Our team will contact you within 24 hours to complete the purchase.`,
    });

    // Clear cart after submission
    setCartItems([]);
    setShowCartOverlay(false);
  };

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
              alt="Perks for your startup"
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-6xl mx-auto px-6 w-full text-center">
              <h1 className="text-5xl font-bold text-white md:text-6xl lg:text-7xl leading-tight">
                Perks for your startup
              </h1>
              <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Exclusive deals and discounts from our trusted partners to help
                your startup save money and grow faster
              </p>
            </div>
          </div>
        </section>

        {/* Perks Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Partner Offers</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Take advantage of these exclusive deals from our trusted
                partners. Save thousands on the tools and services your startup
                needs to succeed.
              </p>
            </div>

            {/* Embedded OpenVC Founders Marketplace */}
            <div className="w-full">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-brand-yellow/10 to-brand-yellow/5 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
                        <span className="text-brand-black font-bold text-sm">
                          $
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Startup Perks Marketplace
                        </h3>
                        <p className="text-sm text-gray-600">
                          Exclusive deals and discounts for startups
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Cart Count Badge */}
                      {cartItems.length > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                          {cartItems.length}
                        </div>
                      )}
                      <Button
                        onClick={handleCartClick}
                        variant="outline"
                        size="sm"
                        className="border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-black"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Cart
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  {/* Custom CSS to hide external buttons */}
                  <style>{`
                    /* Hide all "Go Premium to redeem" buttons and related elements */
                    .css-qhzqhr,
                    .css-1txjm15,
                    .css-1m4n54b,
                    .css-qdn97o,
                    .css-7fftah,
                    a[href*="openvc.app/signup"],
                    a[href="http://openvc.app/signup"],
                    .MuiCard-root .css-qhzqhr,
                    .MuiCard-root .css-1txjm15,
                    .MuiCard-root .css-1m4n54b,
                    .MuiPaper-root.MuiCard-root.css-qdn97o .css-qhzqhr,
                    .MuiPaper-root.MuiCard-root.css-qdn97o .css-1txjm15,
                    .MuiPaper-root.MuiCard-root.css-qdn97o .css-1m4n54b {
                      display: none !important;
                      visibility: hidden !important;
                      opacity: 0 !important;
                      height: 0 !important;
                      overflow: hidden !important;
                    }
                    
                    /* Hide Material-UI buttons containing premium signup */
                    .MuiButton-root.MuiButton-contained.MuiButton-containedPrimary[href*="signup"],
                    .MuiButtonBase-root[href*="openvc.app/signup"],
                    .MuiButton-root[tabindex="0"][href*="signup"],
                    .MuiButton-root[href="http://openvc.app/signup"] {
                      display: none !important;
                      visibility: hidden !important;
                      opacity: 0 !important;
                    }
                    
                    /* Hide lock icons and premium elements */
                    .material-icons-outlined[aria-hidden="true"]:contains("lock"),
                    .css-6xugel,
                    .css-1jgtvd5[aria-hidden="true"] {
                      display: none !important;
                    }
                    
                    /* Hide any card that contains premium buttons */
                    .MuiPaper-root.MuiCard-root:has(.css-qhzqhr),
                    .MuiPaper-root.MuiCard-root:has(.css-7fftah[href*="signup"]) {
                      position: relative;
                    }
                    
                    .MuiPaper-root.MuiCard-root:has(.css-qhzqhr)::after,
                    .MuiPaper-root.MuiCard-root:has(.css-7fftah[href*="signup"])::after {
                      content: '';
                      position: absolute;
                      bottom: 0;
                      left: 0;
                      right: 0;
                      height: 60px;
                      background: rgba(255, 255, 255, 0.98);
                      z-index: 1000;
                      pointer-events: none;
                    }
                    
                    /* Global iframe content hiding */
                    iframe {
                      filter: none;
                    }
                    
                    /* More specific targeting for the premium buttons */
                    [class*="css-qhzqhr"],
                    [class*="css-1txjm15"], 
                    [class*="css-1m4n54b"],
                    [href*="openvc.app/signup"] {
                      display: none !important;
                      opacity: 0 !important;
                      visibility: hidden !important;
                      position: absolute !important;
                      left: -9999px !important;
                    }
                  `}</style>

                  <iframe
                    src="https://openvc-founders.builtfirst.com/"
                    className="w-full h-[800px] border-0"
                    title="OpenVC Founders Marketplace"
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    style={{
                      minHeight: "800px",
                      background: "white",
                    }}
                  />

                  {/* Floating Quick Purchase Option */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-white/98 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-200 max-w-sm">
                      <div className="text-center">
                        {/* Premium Access Option */}
                        {(() => {
                          const openVCProduct = products.find(
                            (p) => p.name === "OpenVC Annual Membership Access"
                          );
                          const price = openVCProduct
                            ? getProductPrice(openVCProduct.id)
                            : null;

                          return openVCProduct && price ? (
                            <div>
                              <div className="flex items-center justify-center mb-3">
                                <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold uppercase">
                                  Premium Access
                                </div>
                              </div>
                              <h3 className="font-bold text-gray-900 mb-2">
                                OpenVC Annual Membership Access
                              </h3>
                              <div className="text-2xl font-bold text-orange-600 mb-1">
                                {formatPrice(price.unit_amount, price.currency)}
                              </div>
                              <div className="text-xs text-gray-600 mb-3">
                                {price.type === "recurring"
                                  ? "Annual subscription"
                                  : "One-time payment"}{" "}
                                • Instant access
                              </div>
                              <Button
                                onClick={() => {
                                  if (!user) {
                                    toast({
                                      title: "Authentication Required",
                                      description:
                                        "Please log in to purchase this service.",
                                      variant: "destructive",
                                    });
                                    openAuthModal("login");
                                    return;
                                  }
                                  createCheckout(price.id, openVCProduct.name);
                                }}
                                disabled={checkoutLoading}
                                className="bg-orange-500 text-white hover:bg-orange-600 shadow-lg font-bold w-full mb-2"
                              >
                                {checkoutLoading ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    Get Instant Access
                                  </div>
                                )}
                              </Button>
                              <div className="text-xs text-gray-500">
                                ✓ Access to $50,000+ in savings
                                <br />✓ No waiting, no approval needed
                                <br />✓ Annual membership to OpenVC founders
                                network
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-3">
                                Found something you like?
                              </p>
                              <Button
                                onClick={() => {
                                  if (!user) {
                                    toast({
                                      title: "Authentication Required",
                                      description:
                                        "Please log in to add services to your request list.",
                                      variant: "destructive",
                                    });
                                    openAuthModal("login");
                                    return;
                                  }
                                  const currentUrl = window.location.href;
                                  const serviceName =
                                    "Selected Service from Marketplace";
                                  addToCart(serviceName, currentUrl);
                                }}
                                className="bg-brand-yellow text-brand-black hover:bg-yellow-400 shadow-lg font-bold w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add to Request List
                              </Button>
                              <div className="text-xs text-gray-500 mt-2">
                                We'll help you get access!
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note about the embedded marketplace */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-4">
                  This is the live OpenVC Founders marketplace. Access requires
                  registration with OpenVC.
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    asChild
                    className="bg-brand-yellow text-brand-black hover:bg-brand-yellow/90"
                  >
                    <a
                      href="https://openvc-founders.builtfirst.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Full Marketplace
                    </a>
                  </Button>
                  <Button variant="outline">Learn More About OpenVC</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Access */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-8">
                How to Access These Perks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center text-brand-black font-bold text-xl mx-auto mb-6">
                    1
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    Become a Client
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Sign up for any of our GetMVP services
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center text-brand-black font-bold text-xl mx-auto mb-6">
                    2
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    Get Your Perks Code
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Receive exclusive access codes from our team
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center text-brand-black font-bold text-xl mx-auto mb-6">
                    3
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    Start Saving
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Apply the codes and start using these amazing tools
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Total Savings */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">
                Total Potential Savings
              </h2>
              <div className="text-6xl font-bold text-brand-yellow mb-4">
                $50,000+
              </div>
              <p className="text-xl text-muted-foreground">
                Combined savings across all partner offers for the first year
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b">
              <div className="flex items-center gap-4">
                {selectedOffer.logo ? (
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={selectedOffer.logo}
                      alt={selectedOffer.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center text-brand-black font-bold text-xl">
                    {selectedOffer.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedOffer.name}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-700 border-0 text-sm font-medium mt-1"
                  >
                    {selectedOffer.category}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOffer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-brand-yellow mb-3">
                {selectedOffer.title}
              </h3>

              <p className="text-2xl font-bold text-green-600 mb-6">
                {selectedOffer.savings}
              </p>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {selectedOffer.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <Button
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "Authentication Required",
                        description:
                          "Please log in to access premium features.",
                        variant: "destructive",
                      });
                      openAuthModal("login");
                      return;
                    }
                    // Handle premium redemption logic here
                    toast({
                      title: "Premium Access",
                      description:
                        "You need to purchase our services to access this perk.",
                    });
                  }}
                  className="bg-brand-yellow text-brand-black hover:bg-brand-yellow/90 font-semibold"
                >
                  Go Premium To Redeem
                </Button>
                <Button variant="outline">Learn More</Button>
              </div>

              {/* Similar Items Section */}
              <div className="mt-8 pt-6 border-t">
                <h4 className="text-lg font-bold mb-4">Similar Items</h4>

                {loadingSimilar && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading similar items...</span>
                  </div>
                )}

                {errorSimilar && (
                  <div className="text-sm text-red-500">{errorSimilar}</div>
                )}

                {!loadingSimilar &&
                  !errorSimilar &&
                  similarItems.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {similarItems.map((item, index) => (
                        <Card
                          key={index}
                          className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            {item.seller?.logo_url ||
                            item.seller?.symbol_logo_url ? (
                              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
                                <img
                                  src={
                                    item.seller.symbol_logo_url ||
                                    item.seller.logo_url
                                  }
                                  alt={item.seller?.name || item.name}
                                  className="w-6 h-6 object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center text-brand-black font-bold text-xs">
                                {(item.seller?.name || item.name)?.charAt(0) ||
                                  "?"}
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {item.seller?.name || "Unknown"}
                            </span>
                          </div>

                          <h5
                            className="font-semibold text-brand-yellow text-sm mb-2 overflow-hidden"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {item.deal?.title || item.name}
                          </h5>

                          {item.deal && (
                            <p className="text-green-600 font-semibold text-sm mb-2">
                              {item.deal.average_total_savings_prefix
                                ? `${item.deal.average_total_savings_prefix} `
                                : ""}
                              {item.deal.average_total_savings_amount &&
                              item.deal.average_total_savings_currency
                                ? `${item.deal.average_total_savings_currency}${item.deal.average_total_savings_amount}`
                                : "Special Offer"}
                            </p>
                          )}

                          {item.description && (
                            <p
                              className="text-xs text-gray-600 overflow-hidden"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {item.description}
                            </p>
                          )}

                          {item.categories && item.categories.length > 0 && (
                            <div className="mt-2">
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 border-0 text-xs"
                              >
                                {item.categories[0].name}
                              </Badge>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}

                {!loadingSimilar &&
                  !errorSimilar &&
                  similarItems.length === 0 && (
                    <div className="text-sm text-gray-500">
                      No similar items found.
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Overlay Modal */}
      {showCartOverlay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Cart Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-brand-yellow" />
                <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCartOverlay(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Cart Content */}
            <div className="p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-600">
                    Browse the marketplace and add services you'd like us to
                    purchase for you.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Added: {new Date(item.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 break-all">
                            {item.url}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="bg-brand-yellow/10 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Total Items:</span>
                      <span className="font-bold">{cartItems.length}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>• Our team will manually process your purchase</p>
                      <p>• You'll receive confirmation within 24 hours</p>
                      <p>
                        • We'll handle all setup and provide you with access
                        details
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={requestPurchase}
                      className="flex-1 bg-brand-yellow text-brand-black hover:bg-brand-yellow/90 font-semibold"
                      size="lg"
                    >
                      Request Purchase ({cartItems.length} item
                      {cartItems.length !== 1 ? "s" : ""})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCartItems([])}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Perks;
