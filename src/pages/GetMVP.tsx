import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroSection } from "@/components/ui/hero-section-4";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useTestimonials } from "@/contexts/TestimonialContext";
import { useEffect } from "react";
import {
  ArrowRight,
  Rocket,
  Users,
  Zap,
  Target,
  Code,
  Palette,
  TrendingUp,
  Share2,
  ShoppingCart,
  HelpCircle,
  Lightbulb,
  BarChart3,
  CheckCircle,
  Play,
  Sparkles,
} from "lucide-react";
import useScrollReveal from "@/hooks/useScrollReveal";
import heroImage from "@/assets/hero-bg.jpg";
import shapesImage from "@/assets/3d-shapes-pastel.jpg";
import joanneImage from "@/assets/joanne-williams.jpg";
import fredImage from "@/assets/fred-buster.jpg";
import lisaImage from "@/assets/lisa-hoffman.jpg";
import { Process } from "@/components/ui/demo";
import Portfolio from "@/components/Portfolio";

const GetMVP = () => {
  const { user } = useAuth();
  const { featuredTestimonials, loading: testimonialsLoading } = useTestimonials();
  useScrollReveal();

  // Debug testimonials
  console.log('🔍 GetMVP - featuredTestimonials:', featuredTestimonials);
  console.log('🔍 GetMVP - testimonialsLoading:', testimonialsLoading);

  const heroSections = [
    {
      heading: "By the Entrepreneurs, for the Entrepreneurs",
      subheading:
        "We are a team of startup founders, with the Entrepreneurial passion of helping other Entrepreneurs and make the venture development easy to manage.",
    },
    {
      heading: "Lean Startup Approach - Build, Measure & Learn",
      subheading:
        "Our Lean Startup Approach is designed to help startups and businesses of all sizes build successful products and services by following a simple yet powerful methodology: Build, Measure & Learn.",
    },
    {
      heading: "Ensure faster Go-To Market",
      subheading:
        "We provide the full stack service from Idea to MVP – all in 2 weeks including venture validation.",
    },
  ];

  const services = [
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Design",
      description: "UI/UX that converts",
      accent: "green",
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Development",
      description: "Scalable solutions",
      accent: "magenta",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Marketing",
      description: "Growth strategies",
      accent: "green",
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Social Media",
      description: "Brand presence",
      accent: "magenta",
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "eCommerce",
      description: "Online stores",
      accent: "green",
    },
    {
      icon: <HelpCircle className="w-6 h-6" />,
      title: "Help & Support",
      description: "24/7 assistance",
      accent: "magenta",
    },
  ];

  const processSteps = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Ideate",
      description: "Validate your concept with market research",
      step: "01",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Define",
      description: "Create detailed specifications and wireframes",
      step: "02",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Develop",
      description: "Build your MVP with cutting-edge technology",
      step: "03",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Deploy",
      description: "Launch and gather real user feedback",
      step: "04",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Scale",
      description: "Iterate and grow based on data insights",
      step: "05",
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Succeed",
      description: "Achieve product-market fit and beyond",
      step: "06",
    },
  ];

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

  const team = [
    {
      name: "Joanne Williams",
      role: "Founder",
      image: joanneImage,
    },
    {
      name: "Fred Buster",
      role: "Director OPS",
      image: fredImage,
    },
    {
      name: "Lisa Hoffman",
      role: "Director HR",
      image: lisaImage,
    },
  ];

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Hero Cards */}
      <section className="pb-8 pt-12 md:pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {heroSections.map((section, index) => (
              <Card
                key={index}
                className="relative bg-white border-2 border-gray-100 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-3 hover:border-primary/20 transition-all duration-500 group overflow-hidden"
              >
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="w-16 h-1 bg-brand-yellow rounded-full mx-auto mb-6"></div>
                  </div>

                  <h2 className="text-2xl font-bold mb-6 text-foreground leading-tight">
                    {section.heading}
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed text-base">
                    {section.subheading}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6-D Process Steps */}
      <div className="[&>div]:!pt-8 [&>div]:md:!pt-12">
        <Process />
      </div>

      {/* Portfolio Section */}
      <Portfolio />

      {/* Testimonials */}
      <section className="bg-background pb-24 pt-8 md:pb-32 md:pt-12">
        <div className="mx-auto max-w-6xl px-6 text-center mb-16">
          <h2 className="text-4xl font-medium">What Our Clients Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            Hear from the founders and leaders who have transformed their ideas
            into successful products with our help.
          </p>
        </div>
        <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
      </section>
      <Footer />
    </div>
  );
};

export default GetMVP;
