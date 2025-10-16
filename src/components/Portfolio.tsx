import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useNavigate } from "react-router-dom";

const Portfolio = () => {
  const { portfolioItems, portfolioLoading } = usePortfolio();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    "All",
    "Web App",
    "Mobile App",
    "SaaS Platform",
    "E-commerce",
    "Fintech",
  ];

  const filteredPortfolios =
    selectedCategory && selectedCategory !== "All"
      ? (portfolioItems || []).filter((portfolio) => portfolio.category === selectedCategory)
      : (portfolioItems || []);

  if (portfolioLoading) {
    return (
      <section className="pb-16 pt-8 md:pb-24 md:pt-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 reveal-on-scroll">
              Our Success Stories
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Loading our portfolio...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-16 pt-8 md:pb-24 md:pt-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 reveal-on-scroll">
            Our Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover how we've helped startups and enterprises transform their
            ideas into successful products. Each case study showcases our proven
            process from validation to launch.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={
                  selectedCategory === category ||
                  (category === "All" && !selectedCategory)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  setSelectedCategory(category === "All" ? null : category)
                }
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPortfolios.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground">
                {selectedCategory && selectedCategory !== "All" 
                  ? `No portfolio items found in the ${selectedCategory} category.`
                  : "No portfolio items available yet."
                }
              </p>
            </div>
          ) : (
            filteredPortfolios.map((portfolio) => (
              <Card 
                key={portfolio.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
                onClick={() => {
                  console.log('Navigating to portfolio:', `/getmvp/portfolio/${portfolio.slug}`);
                  navigate(`/getmvp/portfolio/${portfolio.slug}`);
                }}
              >
                    <div className="relative overflow-hidden bg-gray-100">
                      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                      <img
                        src={portfolio.image}
                        alt={portfolio.title}
                        className="w-full h-64 object-contain group-hover:scale-102 transition-transform duration-300"
                        style={{ objectFit: 'contain' }}
                        loading="lazy"
                        decoding="async"
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          const placeholder = target.previousElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'none';
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant="secondary"
                          className="bg-white/90 text-slate-700"
                        >
                          {portfolio.category}
                        </Badge>
                      </div>
                      {portfolio.featured && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-yellow-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-yellow-600 transition-colors">
                        {portfolio.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {portfolio.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {portfolio.timeline || "Timeline TBD"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {portfolio.teamSize || "Team TBD"}
                        </span>
                      </div>
                    </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;