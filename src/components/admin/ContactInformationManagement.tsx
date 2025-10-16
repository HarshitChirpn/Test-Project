import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Save, 
  RefreshCw, 
  Edit3,
  CheckCircle,
  AlertCircle,
  Building,
  Globe,
  MessageSquare
} from 'lucide-react';

interface ContactInfo {
  _id?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    location: string; // e.g., "Silicon Valley, California"
  };
  email: {
    primary: string;
    support?: string;
    sales?: string;
  };
  phone: {
    primary: string;
    support?: string;
    sales?: string;
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
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  companyInfo: {
    name: string;
    tagline: string;
    description: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const ContactInformationManagement = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: {
      street: '983 Corporate Way',
      city: 'Fremont',
      state: 'CA',
      zipCode: '94555',
      country: 'USA',
      location: 'Silicon Valley, California'
    },
    email: {
      primary: 'contact@idea2mvp.com',
      support: 'support@idea2mvp.com',
      sales: 'sales@idea2mvp.com'
    },
    phone: {
      primary: '+1 (585) 755-3200',
      support: '+1 (585) 755-3201',
      sales: '+1 (585) 755-3202'
    },
    officeHours: {
      weekdays: {
        start: '9:00 AM',
        end: '6:00 PM',
        timezone: 'PST'
      },
      saturday: {
        start: '10:00 AM',
        end: '2:00 PM',
        timezone: 'PST'
      },
      sunday: {
        start: 'Closed',
        end: 'Closed',
        timezone: 'PST'
      }
    },
    companyInfo: {
      name: 'Idea2MVP',
      tagline: 'Turn Your Ideas Into Reality',
      description: 'We help entrepreneurs and businesses build their MVP and bring their ideas to market faster.'
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contact/admin/contact-info');
      if (response.success && response.data) {
        setContactInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      toast({
        title: "Warning",
        description: "Using default contact information. API connection failed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/contact/admin/contact-info', contactInfo);
      
      if (response.success) {
        toast({
          title: "Success! 🎉",
          description: "Contact information updated successfully",
        });
        setEditing(false);
        // Refresh the contact info to show updated data
        await fetchContactInfo();
      } else {
        throw new Error(response.message || 'Failed to update contact information');
      }
    } catch (error: any) {
      console.error('Error saving contact info:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save contact information",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ContactInfo],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ContactInfo],
        [subsection]: {
          ...(prev[section as keyof ContactInfo] as any)[subsection],
          [field]: value
        }
      }
    }));
  };

  const handleCompanyInfoChange = (field: string, value: string) => {
    console.log(`📝 Updating company info ${field}:`, value);
    setContactInfo(prev => ({
      ...prev,
      companyInfo: {
        ...prev.companyInfo,
        [field]: value
      }
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleEmailChange = (field: string, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [field]: value
      }
    }));
  };

  const handlePhoneChange = (field: string, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      phone: {
        ...prev.phone,
        [field]: value
      }
    }));
  };

  const handleOfficeHoursChange = (day: string, field: string, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      officeHours: {
        ...prev.officeHours,
        [day]: {
          ...prev.officeHours[day as keyof typeof prev.officeHours],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Information Management</h2>
          <p className="text-gray-600">Manage your company's contact details and office information</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={fetchContactInfo} 
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {editing ? (
            <div className="flex space-x-2">
              <Button 
                onClick={() => setEditing(false)} 
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                size="sm"
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setEditing(true)} 
              size="sm"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Information
            </Button>
          )}
        </div>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Company Information
          </CardTitle>
          <CardDescription>
            Basic company details and branding information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={contactInfo.companyInfo.name}
                onChange={(e) => handleCompanyInfoChange('name', e.target.value)}
                disabled={!editing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={contactInfo.companyInfo.tagline}
                onChange={(e) => handleCompanyInfoChange('tagline', e.target.value)}
                disabled={!editing}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              value={contactInfo.companyInfo.description}
              onChange={(e) => handleCompanyInfoChange('description', e.target.value)}
              disabled={!editing}
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Address Information
          </CardTitle>
          <CardDescription>
            Office location and mailing address details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={contactInfo.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                disabled={!editing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={contactInfo.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                disabled={!editing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={contactInfo.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                disabled={!editing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP/Postal Code</Label>
              <Input
                id="zipCode"
                value={contactInfo.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                disabled={!editing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={contactInfo.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                disabled={!editing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="location">Location Description</Label>
              <Input
                id="location"
                value={contactInfo.address.location}
                onChange={(e) => handleAddressChange('location', e.target.value)}
                disabled={!editing}
                placeholder="e.g., Silicon Valley, California"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Addresses
            </CardTitle>
            <CardDescription>
              Contact email addresses for different purposes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryEmail">Primary Email</Label>
              <Input
                id="primaryEmail"
                type="email"
                value={contactInfo.email.primary}
                onChange={(e) => handleEmailChange('primary', e.target.value)}
                disabled={!editing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={contactInfo.email.support || ''}
                onChange={(e) => handleEmailChange('support', e.target.value)}
                disabled={!editing}
                className="mt-1"
                placeholder="support@company.com"
              />
            </div>
            <div>
              <Label htmlFor="salesEmail">Sales Email</Label>
              <Input
                id="salesEmail"
                type="email"
                value={contactInfo.email.sales || ''}
                onChange={(e) => handleEmailChange('sales', e.target.value)}
                disabled={!editing}
                className="mt-1"
                placeholder="sales@company.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Phone Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Phone Numbers
            </CardTitle>
            <CardDescription>
              Contact phone numbers for different purposes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryPhone">Primary Phone</Label>
              <Input
                id="primaryPhone"
                value={contactInfo.phone.primary}
                onChange={(e) => handlePhoneChange('primary', e.target.value)}
                disabled={!editing}
                className="mt-1"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                value={contactInfo.phone.support || ''}
                onChange={(e) => handlePhoneChange('support', e.target.value)}
                disabled={!editing}
                className="mt-1"
                placeholder="+1 (555) 123-4568"
              />
            </div>
            <div>
              <Label htmlFor="salesPhone">Sales Phone</Label>
              <Input
                id="salesPhone"
                value={contactInfo.phone.sales || ''}
                onChange={(e) => handlePhoneChange('sales', e.target.value)}
                disabled={!editing}
                className="mt-1"
                placeholder="+1 (555) 123-4569"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Office Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Office Hours
          </CardTitle>
          <CardDescription>
            Business hours and availability information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weekdays">Weekdays (Mon-Fri)</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="weekdaysStart"
                  value={contactInfo.officeHours.weekdays.start}
                  onChange={(e) => handleOfficeHoursChange('weekdays', 'start', e.target.value)}
                  disabled={!editing}
                  placeholder="9:00 AM"
                />
                <Input
                  id="weekdaysEnd"
                  value={contactInfo.officeHours.weekdays.end}
                  onChange={(e) => handleOfficeHoursChange('weekdays', 'end', e.target.value)}
                  disabled={!editing}
                  placeholder="6:00 PM"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="saturday">Saturday</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="saturdayStart"
                  value={contactInfo.officeHours.saturday.start}
                  onChange={(e) => handleOfficeHoursChange('saturday', 'start', e.target.value)}
                  disabled={!editing}
                  placeholder="10:00 AM"
                />
                <Input
                  id="saturdayEnd"
                  value={contactInfo.officeHours.saturday.end}
                  onChange={(e) => handleOfficeHoursChange('saturday', 'end', e.target.value)}
                  disabled={!editing}
                  placeholder="2:00 PM"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sunday">Sunday</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="sundayStart"
                  value={contactInfo.officeHours.sunday.start}
                  onChange={(e) => handleOfficeHoursChange('sunday', 'start', e.target.value)}
                  disabled={!editing}
                  placeholder="Closed"
                />
                <Input
                  id="sundayEnd"
                  value={contactInfo.officeHours.sunday.end}
                  onChange={(e) => handleOfficeHoursChange('sunday', 'end', e.target.value)}
                  disabled={!editing}
                  placeholder="Closed"
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={contactInfo.officeHours.weekdays.timezone}
              onChange={(e) => {
                const timezone = e.target.value;
                setContactInfo(prev => ({
                  ...prev,
                  officeHours: {
                    ...prev.officeHours,
                    weekdays: { ...prev.officeHours.weekdays, timezone },
                    saturday: { ...prev.officeHours.saturday, timezone },
                    sunday: { ...prev.officeHours.sunday, timezone }
                  }
                }));
              }}
              disabled={!editing}
              className="mt-1"
              placeholder="PST"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Live Preview
          </CardTitle>
          <CardDescription>
            How your contact information will appear on the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Preview */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Office Address</h4>
                  <p className="text-gray-600 text-sm">
                    {contactInfo.address.street}<br />
                    {contactInfo.address.city}, {contactInfo.address.state} {contactInfo.address.zipCode}<br />
                    <span className="text-gray-500">📍 {contactInfo.address.location}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Email Preview */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Email Us</h4>
                  <p className="text-green-600 text-sm font-medium">{contactInfo.email.primary}</p>
                  <p className="text-gray-500 text-xs">📧 We respond within 24 hours</p>
                </div>
              </div>
            </div>

            {/* Phone Preview */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Call Us</h4>
                  <p className="text-purple-600 text-sm font-medium">{contactInfo.phone.primary}</p>
                  <p className="text-gray-500 text-xs">📞 Mon-Fri {contactInfo.officeHours.weekdays.start}-{contactInfo.officeHours.weekdays.end} {contactInfo.officeHours.weekdays.timezone}</p>
                </div>
              </div>
            </div>

            {/* Hours Preview */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Office Hours</h4>
                  <div className="text-gray-600 text-sm space-y-1">
                    <div>Mon-Fri: {contactInfo.officeHours.weekdays.start} - {contactInfo.officeHours.weekdays.end} {contactInfo.officeHours.weekdays.timezone}</div>
                    <div>Sat: {contactInfo.officeHours.saturday.start} - {contactInfo.officeHours.saturday.end} {contactInfo.officeHours.saturday.timezone}</div>
                    <div>Sun: {contactInfo.officeHours.sunday.start}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInformationManagement;
