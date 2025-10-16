import { useParams, useNavigate } from "react-router-dom";
import { HeroHeader } from "@/components/ui/hero-section-4";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Share2,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Star,
  Code,
  Building,
  Target,
} from "lucide-react";
import { usePortfolio, PortfolioItem } from "@/contexts/PortfolioContext";
import { useEffect, useState, useMemo } from "react";

const PortfolioDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { portfolioItems: portfolios, portfolioLoading: portfoliosLoading, getPortfolioBySlug } = usePortfolio();
  const [portfolio, setPortfolio] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to find portfolio in already loaded data first
  const cachedPortfolio = useMemo(() => {
    if (!slug || portfoliosLoading || portfolios.length === 0) return null;
    return portfolios.find(p => p.slug === slug) || null;
  }, [slug, portfolios, portfoliosLoading]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      // If we have the portfolio in cache, use it immediately
      if (cachedPortfolio) {
        setPortfolio(cachedPortfolio);
        setLoading(false);
        return;
      }

      // If portfolios are still loading, wait for them
      if (portfoliosLoading) {
        return;
      }

      // Only fetch individually if not found in cache and portfolios are loaded
      try {
        setLoading(true);
        const portfolioData = await getPortfolioBySlug(slug);
        setPortfolio(portfolioData);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        setPortfolio(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [slug, cachedPortfolio, portfoliosLoading, getPortfolioBySlug]);

  if (loading || portfoliosLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeroHeader />
        <main className="flex-grow overflow-x-hidden">
          {/* Skeleton Loading */}
          <section className="bg-gray-100 mt-16">
            <div className="max-w-6xl mx-auto px-6">
              <div className="mb-2 pt-8">
                <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex flex-col lg:flex-row min-h-[500px] items-center gap-8">
                <div className="lg:w-1/2 space-y-6">
                  <div className="flex gap-3">
                    <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-3/4 h-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="lg:w-1/2">
                  <div className="w-full h-[400px] bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="w-full h-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-full h-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="lg:col-span-1">
                    <div className="w-full h-64 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen">
        <HeroHeader />
        <main className="overflow-x-hidden">
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl font-bold mb-4">
                Portfolio Item Not Found
              </h1>
              <p className="text-muted-foreground mb-6">
                The portfolio item you're looking for doesn't exist or has been
                removed.
              </p>
              <Button onClick={() => navigate("/getmvp")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const sharePortfolio = () => {
    if (navigator.share) {
      navigator.share({
        title: portfolio.title,
        text: portfolio.description,
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
        <section className="bg-gray-100 mt-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-2 pt-8">
              <Button
                variant="outline"
                onClick={() => navigate("/getmvp")}
                className="text-gray-600 hover:text-brand-black mb-2 border-gray-300 hover:bg-brand-yellow hover:shadow-lg transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <div className="flex flex-col lg:flex-row min-h-[500px] items-center gap-8">
              {/* Left Side - Content */}
              <div className="lg:w-1/2 h-full flex flex-col justify-center">
                <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Badge className="bg-brand-yellow text-black font-medium px-3 py-1">
                    {portfolio.category}
                  </Badge>
                  {portfolio.timeline && (
                    <div className="flex items-center text-gray-600 bg-white px-3 py-1 rounded-full border">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="font-medium">{portfolio.timeline}</span>
                    </div>
                  )}
                  {portfolio.teamSize && (
                    <div className="flex items-center text-gray-600 bg-white px-3 py-1 rounded-full border">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="font-medium">{portfolio.teamSize}</span>
                    </div>
                  )}
                  {portfolio.client && (
                    <div className="flex items-center text-gray-600 bg-white px-3 py-1 rounded-full border">
                      <Building className="w-4 h-4 mr-2" />
                      <span className="font-medium">{portfolio.client}</span>
                    </div>
                  )}
                  {portfolio.featured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-medium px-3 py-1">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                    {portfolio.title}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed font-light max-w-lg">
                    {portfolio.description}
                  </p>
                </div>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="lg:w-1/2 flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    className="w-full h-auto max-h-[400px] object-contain"
                    src={portfolio.image}
                    alt={portfolio.title}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Details */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Project Actions */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b">
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      Created: {new Date(portfolio.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {portfolio.updatedAt &&
                    new Date(portfolio.updatedAt).getTime() !==
                      new Date(portfolio.createdAt).getTime() && (
                      <div className="flex items-center">
                        <span>
                          Updated: {new Date(portfolio.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sharePortfolio}
                  className="flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Project Overview */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      Project Overview
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {portfolio.description}
                    </p>
                  </div>

                  {/* Key Metrics */}
                  {(portfolio.metrics.userGrowth ||
                    portfolio.metrics.funding ||
                    portfolio.metrics.timeToMarket ||
                    portfolio.metrics.revenue ||
                    portfolio.metrics.userRating) && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6">Key Results</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolio.metrics.userGrowth && (
                          <div className="text-center p-6 bg-green-50 rounded-xl">
                            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                            <div className="text-2xl font-bold text-green-700">
                              {portfolio.metrics.userGrowth}
                            </div>
                            <div className="text-sm text-green-600">
                              User Growth
                            </div>
                          </div>
                        )}
                        {portfolio.metrics.funding && (
                          <div className="text-center p-6 bg-blue-50 rounded-xl">
                            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                            <div className="text-2xl font-bold text-blue-700">
                              {portfolio.metrics.funding}
                            </div>
                            <div className="text-sm text-blue-600">
                              Funding Raised
                            </div>
                          </div>
                        )}
                        {portfolio.metrics.timeToMarket && (
                          <div className="text-center p-6 bg-orange-50 rounded-xl">
                            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                            <div className="text-2xl font-bold text-orange-700">
                              {portfolio.metrics.timeToMarket}
                            </div>
                            <div className="text-sm text-orange-600">
                              Time to Market
                            </div>
                          </div>
                        )}
                        {portfolio.metrics.userRating && (
                          <div className="text-center p-6 bg-yellow-50 rounded-xl">
                            <Star className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                            <div className="text-2xl font-bold text-yellow-700">
                              {portfolio.metrics.userRating}
                            </div>
                            <div className="text-sm text-yellow-600">
                              User Rating
                            </div>
                          </div>
                        )}
                        {portfolio.metrics.revenue && (
                          <div className="text-center p-6 bg-purple-50 rounded-xl">
                            <Target className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                            <div className="text-2xl font-bold text-purple-700">
                              {portfolio.metrics.revenue}
                            </div>
                            <div className="text-sm text-purple-600">
                              Revenue
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Results */}
                  {portfolio.results.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6">Achievements</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolio.results.map((result, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="w-3 h-3 bg-brand-yellow rounded-full mt-1.5"></div>
                            <span className="text-gray-700">{result}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Process */}
                  {portfolio.process.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6">Our Process</h2>
                      <div className="space-y-6">
                        {portfolio.process.map((step, index) => (
                          <div
                            key={index}
                            className="relative pl-8 pb-6 border-l-2 border-brand-yellow/30 last:border-l-0"
                          >
                            <div className="absolute -left-2 top-0 w-4 h-4 bg-brand-yellow rounded-full"></div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-semibold">
                                  {step.phase}
                                </h3>
                                <Badge variant="outline">{step.duration}</Badge>
                              </div>
                              <p className="text-muted-foreground">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mockups */}
                  {portfolio.mockups.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6">
                        Project Showcase
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {portfolio.mockups.map((mockup, index) => (
                          <div
                            key={index}
                            className="rounded-lg overflow-hidden shadow-lg"
                          >
                            <img
                              src={mockup.image}
                              alt={mockup.alt}
                              className="w-full h-64 object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Project Info */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="font-semibold mb-4">Project Information</h3>
                    <div className="space-y-3">
                      {portfolio.client && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">
                            Client
                          </dt>
                          <dd className="text-sm">{portfolio.client}</dd>
                        </div>
                      )}
                      {portfolio.timeline && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">
                            Timeline
                          </dt>
                          <dd className="text-sm">{portfolio.timeline}</dd>
                        </div>
                      )}
                      {portfolio.teamSize && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">
                            Team Size
                          </dt>
                          <dd className="text-sm">{portfolio.teamSize}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Category
                        </dt>
                        <dd>
                          <Badge variant="secondary">
                            {portfolio.category}
                          </Badge>
                        </dd>
                      </div>
                    </div>
                  </div>

                  {/* Technologies */}
                  {portfolio.technologies.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="font-semibold mb-4 flex items-center">
                        <Code className="w-4 h-4 mr-2" />
                        Technologies Used
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {portfolio.technologies.map((tech, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Testimonial */}
                  {portfolio.testimonial.quote && (
                    <div className="bg-gradient-to-br from-brand-yellow/10 to-orange-100 p-6 rounded-lg border">
                      <h3 className="font-semibold mb-4">Client Testimonial</h3>
                      <blockquote className="text-sm italic mb-4 leading-relaxed">
                        "{portfolio.testimonial.quote}"
                      </blockquote>
                      {(portfolio.testimonial.author ||
                        portfolio.testimonial.company) && (
                        <div className="flex items-center gap-3">
                          <img
                            src={portfolio.testimonial.avatar}
                            alt={portfolio.testimonial.author}
                            className="w-10 h-10 rounded-full"
                            loading="lazy"
                            decoding="async"
                          />
                          <div>
                            <div className="text-sm font-medium">
                              {portfolio.testimonial.author}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {portfolio.testimonial.position}
                              {portfolio.testimonial.position &&
                                portfolio.testimonial.company &&
                                ", "}
                              {portfolio.testimonial.company}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Start Your Project?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Let's discuss how we can help bring your vision to life with the
                same level of excellence and attention to detail.
              </p>
              <Button
                onClick={() => navigate("/getmvp/contact")}
                className="bg-brand-yellow text-brand-black hover:bg-yellow-400"
              >
                Get Started Today
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioDetail;
