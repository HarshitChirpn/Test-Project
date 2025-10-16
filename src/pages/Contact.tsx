import { HeroHeader } from "@/components/ui/hero-section-4";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, Mail, Phone, Send, CheckCircle, Sparkles, MessageCircle, Clock, Users, Zap, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Define the Service interface
interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  order: number;
  createdAt: Date;
}

// Define the ContactInfo interface
interface ContactInfo {
  companyInfo: {
    name: string;
    tagline: string;
    description: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    location: string;
  };
  email: {
    primary: string;
    support: string;
    sales: string;
  };
  phone: {
    primary: string;
    support: string;
    sales: string;
  };
  officeHours: {
    weekdays: {
      start: string;
      end: string;
      timezone: string;
    };
    saturday: {
      start: string;
      end: string;
      timezone: string;
    };
    sunday: {
      start: string;
      end: string;
      timezone: string;
    };
  };
}

const Contact = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [contactInfoLoading, setContactInfoLoading] = useState(true);

  // Fetch contact information from backend API
  const fetchContactInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contact/contact-info');
      const data = await response.json();
      
      if (data.success && data.data) {
        setContactInfo(data.data);
      } else {
        // Use default values if API fails
        setContactInfo({
          companyInfo: {
            name: "Idea2MVP",
            tagline: "Turn Your Ideas Into Reality",
            description: "We help entrepreneurs and businesses build their MVP and bring their ideas to market faster."
          },
          address: {
            street: "983 Corporate Way",
            city: "Fremont",
            state: "CA",
            zipCode: "94555",
            country: "USA",
            location: "Silicon Valley, California"
          },
          email: {
            primary: "contact@idea2mvp.com",
            support: "support@idea2mvp.com",
            sales: "sales@idea2mvp.com"
          },
          phone: {
            primary: "+1 (585) 755-3200",
            support: "+1 (585) 755-3201",
            sales: "+1 (585) 755-3202"
          },
          officeHours: {
            weekdays: {
              start: "9:00 AM",
              end: "6:00 PM",
              timezone: "PST"
            },
            saturday: {
              start: "10:00 AM",
              end: "2:00 PM",
              timezone: "PST"
            },
            sunday: {
              start: "Closed",
              end: "Closed",
              timezone: "PST"
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Use default values if API fails
      setContactInfo({
        companyInfo: {
          name: "Idea2MVP",
          tagline: "Turn Your Ideas Into Reality",
          description: "We help entrepreneurs and businesses build their MVP and bring their ideas to market faster."
        },
        address: {
          street: "983 Corporate Way",
          city: "Fremont",
          state: "CA",
          zipCode: "94555",
          country: "USA",
          location: "Silicon Valley, California"
        },
        email: {
          primary: "contact@idea2mvp.com",
          support: "support@idea2mvp.com",
          sales: "sales@idea2mvp.com"
        },
        phone: {
          primary: "+1 (585) 755-3200",
          support: "+1 (585) 755-3201",
          sales: "+1 (585) 755-3202"
        },
        officeHours: {
          weekdays: {
            start: "9:00 AM",
            end: "6:00 PM",
            timezone: "PST"
          },
          saturday: {
            start: "10:00 AM",
            end: "2:00 PM",
            timezone: "PST"
          },
          sunday: {
            start: "Closed",
            end: "Closed",
            timezone: "PST"
          }
        }
      });
    } finally {
      setContactInfoLoading(false);
    }
  };

  // Fetch services from backend API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const result = await api.get('/services');

        if (result.success && result.data?.services) {
          const formattedServices = result.data.services.map((service: any) => ({
            id: service._id,
            title: service.title,
            description: service.description,
            icon: service.icon || '',
            category: service.category,
            order: service.order,
            createdAt: service.createdAt
          })) as Service[];

          setServices(formattedServices);
        }
        setServicesLoading(false);
      } catch (error) {
        console.error("Error fetching services:", error);
        setServicesLoading(false);
      }
    };

    fetchServices();
    fetchContactInfo();
  }, []);

  // Auto-fill service based on URL parameter
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam && services.length > 0) {
      // Find matching service by id or title
      const matchingService = services.find(s => 
        s.id === serviceParam || 
        s.title.toLowerCase().replace(/\s+/g, '-') === serviceParam
      );
      
      if (matchingService) {
        setSelectedService(matchingService.id);
        setMessage(`Hi, I'm interested in your ${matchingService.title} services. `);
      }
    }
  }, [searchParams, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (message.length < 20) {
      toast({
        title: "Message Too Short",
        description: "Please provide a more detailed message (at least 20 characters).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/contact/submissions', {
        name,
        email,
        message,
        selectedService,
        services,
        subject: `Contact from ${name} - ${selectedService ? 'Service Inquiry' : 'General Inquiry'}`,
        type: 'general',
        source: 'contact-form'
      });

      if (response.success) {
        toast({
          title: "Message Sent Successfully! 🎉",
          description: "Thank you for contacting us. We'll get back to you within 24 hours.",
        });
        
        // Reset form
        setName("");
        setEmail("");
        setMessage("");
        setSelectedService("");
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Failed to Send Message",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              className="h-full w-full object-cover object-bottom"
              src="https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Contact Us"
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-6xl mx-auto px-6 w-full text-center">
              <h1 className="text-5xl font-bold text-white md:text-6xl lg:text-7xl leading-tight">
                Contact Us
              </h1>
              <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Ready to turn your idea into reality? Get in touch with our team
                and let's discuss your project
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20 relative overflow-hidden">
          {/* Floating Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-20 h-20 bg-brand-yellow/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
            <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-green-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="relative bg-gradient-to-br from-white via-white to-brand-yellow/5 border-2 border-gray-100 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl hover:-translate-y-3 hover:border-brand-yellow/30 transition-all duration-700 group overflow-hidden">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-brand-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Sparkle Animation */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Sparkles className="w-6 h-6 text-brand-yellow animate-pulse" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-3 bg-gradient-to-br from-brand-yellow to-yellow-400 rounded-2xl shadow-lg">
                      <MessageCircle className="w-8 h-8 text-brand-black" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Send us a message
                  </h2>
                  <p className="text-gray-600 mb-8">We'll get back to you within 24 hours</p>
                  
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div className="group">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Full Name *
                        </Label>
                        <div className="relative">
                          <Input
                            id="name"
                            type="text"
                            required
                            className="h-12 pl-4 pr-4 border-2 border-gray-200 rounded-xl focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300 hover:border-gray-300"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-yellow/0 to-brand-yellow/0 group-focus-within:from-brand-yellow/5 group-focus-within:to-brand-yellow/10 transition-all duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                      
                      <div className="group">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Email Address *
                        </Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            required
                            className="h-12 pl-4 pr-4 border-2 border-gray-200 rounded-xl focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300 hover:border-gray-300"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-yellow/0 to-brand-yellow/0 group-focus-within:from-brand-yellow/5 group-focus-within:to-brand-yellow/10 transition-all duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                      
                      <div className="group">
                        <Label htmlFor="service" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Service of Interest
                        </Label>
                        <div className="relative">
                          <Select value={selectedService} onValueChange={setSelectedService}>
                            <SelectTrigger className="h-12 pl-4 pr-4 border-2 border-gray-200 rounded-xl focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300 hover:border-gray-300">
                              <SelectValue placeholder="Select a service (optional)" />
                            </SelectTrigger>
                            <SelectContent className="border-2 border-gray-200 rounded-xl">
                              <SelectItem value="none">No specific service</SelectItem>
                              {servicesLoading ? (
                                <SelectItem value="loading" disabled>Loading services...</SelectItem>
                              ) : (
                                services.map((service) => (
                                  <SelectItem key={service.id} value={service.id}>
                                    {service.title}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="group">
                        <Label htmlFor="message" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Project Details *
                        </Label>
                        <div className="relative">
                          <Textarea
                            id="message"
                            required
                            className="min-h-[140px] pl-4 pr-4 pt-3 border-2 border-gray-200 rounded-xl focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300 hover:border-gray-300 resize-none"
                            placeholder="Tell us about your project, goals, timeline, and any specific requirements..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-yellow/0 to-brand-yellow/0 group-focus-within:from-brand-yellow/5 group-focus-within:to-brand-yellow/10 transition-all duration-300 pointer-events-none"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {message.length}/500 characters (minimum 20 required)
                        </p>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-14 bg-gradient-to-r from-brand-yellow to-yellow-400 text-brand-black hover:from-yellow-400 hover:to-brand-yellow font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-brand-black border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending Message...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="w-5 h-5" />
                          <span>Send Message</span>
                          <Zap className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </div>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Get In Touch
                  </h2>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Have a project in mind? We'd love to hear about it. Send us
                    a message and we'll get back to you as soon as possible.
                  </p>
                  
                  {/* Loading indicator for contact info */}
                  {contactInfoLoading && (
                    <div className="flex items-center justify-center p-4 mb-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-yellow"></div>
                      <span className="ml-2 text-gray-600">Loading contact information...</span>
                    </div>
                  )}
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-800">24h Response</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-800">Free Consultation</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-6">
                  <Card className="relative bg-gradient-to-br from-white via-white to-blue-50/30 border-2 border-gray-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-3 hover:border-blue-200/50 transition-all duration-500 group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start space-x-4 relative z-10">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <MapPin className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 text-gray-900">Office Address</h3>
                        <p className="text-gray-600 leading-relaxed">
                          {contactInfo?.address?.street || "983 Corporate Way"}<br />
                          {contactInfo?.address?.city || "Fremont"}, {contactInfo?.address?.state || "CA"} {contactInfo?.address?.zipCode || "94555"}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">📍 {contactInfo?.address?.location || "Silicon Valley, California"}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="relative bg-gradient-to-br from-white via-white to-green-50/30 border-2 border-gray-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-3 hover:border-green-200/50 transition-all duration-500 group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start space-x-4 relative z-10">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Mail className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 text-gray-900">Email Us</h3>
                        <a
                          href={`mailto:${contactInfo?.email?.primary || "contact@idea2mvp.com"}`}
                          className="text-green-600 hover:text-green-700 font-medium transition-colors duration-300 block mb-1"
                        >
                          {contactInfo?.email?.primary || "contact@idea2mvp.com"}
                        </a>
                        <p className="text-sm text-gray-500">📧 We respond within 24 hours</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="relative bg-gradient-to-br from-white via-white to-purple-50/30 border-2 border-gray-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-3 hover:border-purple-200/50 transition-all duration-500 group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start space-x-4 relative z-10">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Phone className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 text-gray-900">Call Us</h3>
                        <a
                          href={`tel:${contactInfo?.phone?.primary || "+15857553200"}`}
                          className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-300 block mb-1"
                        >
                          {contactInfo?.phone?.primary || "+1 (585) 755-3200"}
                        </a>
                        <p className="text-sm text-gray-500">📞 Mon-Fri 9AM-6PM PST</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Office Hours */}
                <Card className="relative bg-gradient-to-br from-white via-white to-orange-50/30 border-2 border-gray-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-3 hover:border-orange-200/50 transition-all duration-500 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Office Hours</h3>
                    </div>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                        <span className="font-medium">Monday - Friday</span>
                        <span className="text-orange-600 font-semibold">
                          {contactInfo?.officeHours?.weekdays?.start || "9:00 AM"} - {contactInfo?.officeHours?.weekdays?.end || "6:00 PM"} {contactInfo?.officeHours?.weekdays?.timezone || "PST"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                        <span className="font-medium">Saturday</span>
                        <span className="text-orange-600 font-semibold">
                          {contactInfo?.officeHours?.saturday?.start || "10:00 AM"} - {contactInfo?.officeHours?.saturday?.end || "2:00 PM"} {contactInfo?.officeHours?.saturday?.timezone || "PST"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-100/50 rounded-lg">
                        <span className="font-medium text-gray-500">Sunday</span>
                        <span className="text-gray-500 font-semibold">
                          {contactInfo?.officeHours?.sunday?.start || "Closed"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-brand-yellow/5 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-brand-yellow/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-yellow to-yellow-400 rounded-3xl shadow-xl mb-6">
                  <Rocket className="w-10 h-10 text-brand-black" />
                </div>
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Ready to Start Your Project?
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                  Don't wait any longer. Take the first step towards building your
                  MVP today and turn your idea into reality.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/getmvp/register">
                  <Button
                    size="lg"
                    className="h-14 px-8 bg-gradient-to-r from-brand-yellow to-yellow-400 text-brand-black hover:from-yellow-400 hover:to-brand-yellow font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Get Started Now
                  </Button>
                </Link>
                <Link to="/getmvp/services">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="h-14 px-8 border-2 border-gray-300 hover:border-brand-yellow hover:bg-brand-yellow/10 font-semibold text-lg rounded-2xl transition-all duration-300"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    View Our Services
                  </Button>
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Projects Completed</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50">
                  <div className="text-2xl font-bold text-gray-900">24h</div>
                  <div className="text-sm text-gray-600">Response Time</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50">
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Client Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <section className="py-8 text-center text-sm text-muted-foreground border-t border-border">
          <div className="container mx-auto px-4">
            <p>
              By contacting us, you agree to our{" "}
              <Link
                to="/getmvp/privacy-policy"
                className="hover:text-brand-yellow transition-smooth"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
