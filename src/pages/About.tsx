import { HeroSection } from "@/components/ui/hero-section-4";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  Target,
  Users,
  Code,
  Zap,
  Layers,
  Rocket,
  Palette,
  TrendingUp,
  Share2,
  ShoppingCart,
  HelpCircle,
} from "lucide-react";
import useScrollReveal from "@/hooks/useScrollReveal";
import { Process } from "@/components/ui/demo";

const About = () => {
  useScrollReveal();
  const processSteps = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Discover",
      description: "Understanding your vision and market needs",
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: "Define",
      description: "Creating clear project requirements and scope",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Design",
      description: "Crafting user-centered experiences",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Develop",
      description: "Building scalable, robust solutions",
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Deploy",
      description: "Launching your product to market",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Deliver",
      description: "Ongoing support and optimization",
    },
  ];

  return (
    <div className="min-h-screen">
      <HeroSection />
      <main>
        {/* Hero Cards */}
        <section className="pb-4 pt-12 md:pb-6">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="relative bg-white border-2 border-gray-100 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-3 hover:border-primary/20 transition-all duration-500 group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="w-16 h-1 bg-brand-yellow rounded-full mx-auto mb-6"></div>
                  </div>
                  <h2 className="text-2xl font-bold mb-6 text-foreground leading-tight">
                    Who Are We
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed text-base">
                    IDEA2MVP is a team of experienced professionals who work collaboratively with clients to deliver customized product development solutions, empowering them to achieve success in today's competitive marketplace.
                  </p>
                </div>
              </Card>
              <Card className="relative bg-white border-2 border-gray-100 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-3 hover:border-primary/20 transition-all duration-500 group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="w-16 h-1 bg-brand-yellow rounded-full mx-auto mb-6"></div>
                  </div>
                  <h2 className="text-2xl font-bold mb-6 text-foreground leading-tight">
                    Our Mission
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed text-base">
                    Our mission at IDEA2MVP is to empower businesses and entrepreneurs to realize their product visions by providing customized product development solutions and expert guidance throughout the process.
                  </p>
                </div>
              </Card>
              <Card className="relative bg-white border-2 border-gray-100 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-3 hover:border-primary/20 transition-all duration-500 group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="w-16 h-1 bg-brand-yellow rounded-full mx-auto mb-6"></div>
                  </div>
                  <h2 className="text-2xl font-bold mb-6 text-foreground leading-tight">
                    What We Do
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed text-base">
                    At IDEA2MVP, we offer a comprehensive range of product development services, from venture validation to functional MVP development, all with the goal of helping businesses and entrepreneurs turn their ideas into successful products.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 6-D Process Steps */}
        <section className="bg-background py-12">
          <Process />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
