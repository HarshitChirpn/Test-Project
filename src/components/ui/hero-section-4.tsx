"use client";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useCart } from "@/contexts/CartContext";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Rocket,
  Zap,
  LogOut,
  User,
  Shield,
  ChevronDown,
  Settings,
  ShoppingCart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const heroSlides = [
  {
    target: "Startup Incubators",
    heading: "Lower the risk on your Investments",
    subheading: "Let the Entrepreneur focus on customer development",
    icon: <Users className="w-8 h-8" />,
    image:
      "https://idea2mvp.net/getmvp/wp-content/uploads/2024/07/Banner-Image-Lower-the-risk-on-your-investments-scaled.jpg",
    alt: "Lower the risk on your investments",
  },
  {
    target: "Founders",
    heading: "Validate your Idea & build MVP",
    subheading: "From concept to market in 15 days",
    icon: <Rocket className="w-8 h-8" />,
    image:
      "https://idea2mvp.net/getmvp/wp-content/uploads/2024/07/Banner-Image-Validate-your-idea-and-build-MVP-scaled.jpg",
    alt: "Validate your idea and build MVP",
  },
  {
    target: "Enterprise",
    heading: "Get to market faster...",
    subheading: "Full-stack innovation for established companies",
    icon: <Zap className="w-8 h-8" />,
    image:
      "https://idea2mvp.net/getmvp/wp-content/uploads/2024/07/Banner-image-Get-to-market-faster-scaled.jpg",
    alt: "Get to market faster",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/getmvp");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentSlideData = heroSlides[currentSlide];

  return (
    <>
      <HeroHeader />
      <main className="overflow-x-hidden">
        <section className="relative h-[70vh] mt-16">
          {/* Full Screen Background Image */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            <img
              className="h-full w-full object-cover object-center transition-all duration-500"
              src={currentSlideData.image}
              alt={currentSlideData.alt}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                target.previousElementSibling?.remove();
              }}
            />
            {/* Subtle dark overlay for dimming */}
            <div className="absolute inset-0 bg-black/25"></div>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-6xl mx-auto px-6 w-full">
              <div className="max-w-xl">
                <div className="mb-4">
                  <span className="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-white text-black">
                    {currentSlideData.target}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl transition-all duration-500 leading-tight">
                  {currentSlideData.heading}
                </h1>
                <p className="mt-6 text-lg text-white md:text-xl transition-all duration-500 leading-relaxed">
                  {currentSlideData.subheading}
                </p>

                <div className="mt-8">
                  {!loading && (
                    <>
                      {user ? (
                        // User is signed in - show dashboard or profile button
                        <Button
                          asChild
                          size="lg"
                          className="px-8 py-3 text-base bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold"
                        >
                          <Link to="/getmvp/dashboard">
                            <span className="text-nowrap">Go to Dashboard</span>
                          </Link>
                        </Button>
                      ) : (
                        // User is not signed in - show get started button
                        <Button
                          onClick={() => openAuthModal("register")}
                          size="lg"
                          className="px-8 py-3 text-base bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold"
                        >
                          <span className="text-nowrap">Get Started</span>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  currentSlide === index
                    ? "bg-brand-yellow scale-125"
                    : "bg-white/50 hover:bg-white/80"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>
        {/* <section className="bg-background pb-16 md:pb-32">
          <div className="group relative m-auto max-w-6xl px-6">
            <div className="flex flex-col items-center md:flex-row">
              <div className="md:max-w-44 md:border-r md:pr-6">
                <p className="text-end text-sm">Powering the best teams</p>
              </div>
              <div className="relative py-6 md:w-[calc(100%-11rem)]">
                <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/nvidia.svg"
                      alt="Nvidia Logo"
                      height="20"
                      width="auto"
                    />
                  </div>

                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/column.svg"
                      alt="Column Logo"
                      height="16"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/github.svg"
                      alt="GitHub Logo"
                      height="16"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/nike.svg"
                      alt="Nike Logo"
                      height="20"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                      alt="Lemon Squeezy Logo"
                      height="20"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/laravel.svg"
                      alt="Laravel Logo"
                      height="16"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-7 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/lilly.svg"
                      alt="Lilly Logo"
                      height="28"
                      width="auto"
                    />
                  </div>

                  <div className="flex">
                    <img
                      className="mx-auto h-6 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/openai.svg"
                      alt="OpenAI Logo"
                      height="24"
                      width="auto"
                    />
                  </div>
                </InfiniteSlider>

                <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
                <ProgressiveBlur
                  className="pointer-events-none absolute left-0 top-0 h-full w-20"
                  direction="left"
                  blurIntensity={1}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute right-0 top-0 h-full w-20"
                  direction="right"
                  blurIntensity={1}
                />
              </div>
            </div>
          </div>
        </section> */}
      </main>
    </>
  );
}

const menuItems = [
  { name: "Services", href: "/getmvp/services" },
  { name: "About", href: "/getmvp/about" },
  { name: "Perks", href: "/getmvp/perks" },
  { name: "Blog", href: "/getmvp/blog" },
];

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const { openAuthModal } = useAuthModal();
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/getmvp");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="group bg-background/50 fixed z-50 w-full border-b backdrop-blur-3xl"
      >
        <div className="mx-auto max-w-6xl px-6 transition-all duration-300">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link
                to="/getmvp"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>

              <div className="hidden lg:block">
                <ul className="flex gap-8 text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.href}
                        className="text-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.href}
                        className="text-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                {!loading && (
                  <>
                    {/* Cart Icon */}
                    <Link to="/getmvp/cart">
                      <Button
                        variant="outline"
                        size="sm"
                        className="relative flex items-center space-x-2 px-3 py-2 hover-neon border-border/20 hover:border-border/40"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span className="text-sm font-medium hidden md:block">Cart</span>
                        {getItemCount() > 0 && (
                          <span className="absolute -top-2 -right-2 bg-brand-yellow text-brand-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {getItemCount()}
                          </span>
                        )}
                      </Button>
                    </Link>

                    {user ? (
                      // User is signed in - Dropdown Menu
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex items-center space-x-2 px-3 py-2 hover-neon border-border/20 hover:border-border/40"
                            size="sm"
                          >
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.displayName || user.name || user.email || "User"}
                                className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-semibold text-sm border-2 border-white/20">
                                {(user.displayName || user.name || user.email || "U").charAt(0).toUpperCase()}
                              </div>
                            )}

                            <span className="text-sm font-medium hidden md:block">
                              {user.displayName || user.name || user.email}
                            </span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                          <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium">
                                {user.displayName || "User"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem asChild>
                            <Link
                              to="/getmvp/dashboard"
                              className="flex items-center cursor-pointer"
                            >
                              <Rocket className="mr-2 h-4 w-4" />
                              <span>Dashboard</span>
                            </Link>
                          </DropdownMenuItem>

                          {isAdmin && (
                            <DropdownMenuItem asChild>
                              <Link
                                to="/getmvp/admin"
                                className="flex items-center cursor-pointer"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Admin Dashboard</span>
                              </Link>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem asChild>
                            <Link
                              to="/getmvp/profile"
                              className="flex items-center cursor-pointer"
                            >
                              <User className="mr-2 h-4 w-4" />
                              <span>Profile</span>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link
                              to="/getmvp/settings"
                              className="flex items-center cursor-pointer"
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Settings</span>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={handleSignOut}
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign Out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      // User is not signed in
                      <>
                        <Button
                          onClick={() => openAuthModal("login")}
                          variant="outline"
                          size="sm"
                        >
                          <span>Login</span>
                        </Button>
                        <Button
                          onClick={() => openAuthModal("register")}
                          size="sm"
                        >
                          <span>Sign Up</span>
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

const Logo = ({ className }: { className?: string }) => {
  return (
    <img
      src="https://idea2mvp.net/getmvp/wp-content/uploads/2024/07/Idea-2-MVP-final-logo-Full-colour-png-01-2048x1292.png"
      alt="Idea2MVP Logo"
      className={cn("h-12 w-auto", className)}
      loading="eager"
      decoding="async"
      fetchPriority="high"
    />
  );
};
