import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { progressService } from '@/services/progressService';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: string;
  onProjectCreated?: () => void;
}

const serviceOptions = [
  { id: 'design', label: 'UI/UX Design', description: 'User interface and experience design' },
  { id: 'development', label: 'Development', description: 'Frontend and backend development' },
  { id: 'gtm-strategies', label: 'Go-to-Market', description: 'Marketing and launch strategies' },
  { id: 'social-media', label: 'Social Media', description: 'Social media marketing and content' },
];

const getProjectTypeOptions = (userType: string) => {
  switch (userType) {
    case 'founders':
      return [
        { value: 'MVP Development', label: 'MVP Development' },
        { value: 'Product Enhancement', label: 'Product Enhancement' },
        { value: 'Market Expansion', label: 'Market Expansion' },
        { value: 'Feature Addition', label: 'Feature Addition' },
      ];
    case 'incubators':
      return [
        { value: 'Portfolio Support', label: 'Portfolio Company Support' },
        { value: 'Due Diligence', label: 'Due Diligence Project' },
        { value: 'Market Research', label: 'Market Research' },
        { value: 'Investment Analysis', label: 'Investment Analysis' },
      ];
    case 'enterprise':
      return [
        { value: 'Enterprise Solution', label: 'Enterprise Solution' },
        { value: 'Digital Transformation', label: 'Digital Transformation' },
        { value: 'Innovation Lab', label: 'Innovation Lab Project' },
        { value: 'R&D Initiative', label: 'R&D Initiative' },
      ];
    default:
      return [
        { value: 'Custom Development', label: 'Custom Development' },
        { value: 'Consulting Project', label: 'Consulting Project' },
        { value: 'Strategic Initiative', label: 'Strategic Initiative' },
      ];
  }
};

export default function NewProjectModal({ isOpen, onClose, userType, onProjectCreated }: NewProjectModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    services: [] as string[],
    timeline: '1-month',
    budget: 25,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      services: checked 
        ? [...prev.services, serviceId]
        : prev.services.filter(s => s !== serviceId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!formData.name.trim() || !formData.type || formData.services.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one service.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await progressService.createNewProject(user.uid, {
        name: formData.name.trim(),
        description: formData.description.trim() || `New ${formData.type} project`,
        type: formData.type,
        services: formData.services,
        timeline: formData.timeline,
        budget: formData.budget,
      });

      toast({
        title: "Project Created!",
        description: `Your ${formData.type} project "${formData.name}" has been created successfully.`,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        type: '',
        services: [],
        timeline: '1-month',
        budget: 25,
      });

      onClose();
      onProjectCreated?.();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const projectTypeOptions = getProjectTypeOptions(userType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {userType === 'founders' ? 'Start New Startup Project' :
             userType === 'incubators' ? 'Add Portfolio Company' :
             userType === 'enterprise' ? 'Launch R&D Initiative' :
             'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            Tell us about your new project and we'll set up a comprehensive tracking system for you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              id="projectName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={
                userType === 'founders' ? 'e.g., FoodTech MVP' :
                userType === 'incubators' ? 'e.g., Portfolio Company X' :
                userType === 'enterprise' ? 'e.g., Digital Transformation Initiative' :
                'e.g., New Product Launch'
              }
              required
            />
          </div>

          {/* Project Type */}
          <div className="space-y-2">
            <Label htmlFor="projectType">Project Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                {projectTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your project goals, target audience, and key requirements..."
              rows={3}
            />
          </div>

          {/* Services */}
          <div className="space-y-3">
            <Label>Services Needed *</Label>
            <div className="grid grid-cols-1 gap-3">
              {serviceOptions.map(service => (
                <div key={service.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={service.id}
                    checked={formData.services.includes(service.id)}
                    onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor={service.id} className="font-medium cursor-pointer">
                      {service.label}
                    </label>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline">Expected Timeline</Label>
            <Select value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2-weeks">2 Weeks</SelectItem>
                <SelectItem value="1-month">1 Month</SelectItem>
                <SelectItem value="2-months">2 Months</SelectItem>
                <SelectItem value="3-months">3 Months</SelectItem>
                <SelectItem value="6-months">6 Months</SelectItem>
                <SelectItem value="custom">Custom Timeline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div className="space-y-4">
            <Label>Budget Range</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">$5K</span>
                <span className="text-lg font-semibold">
                  ${formData.budget >= 100 ? "100K+" : `${formData.budget}K`}
                </span>
                <span className="text-sm text-muted-foreground">$100K+</span>
              </div>
              <Slider
                value={[formData.budget]}
                onValueChange={(values) => setFormData(prev => ({ ...prev, budget: values[0] }))}
                max={100}
                min={5}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading || !formData.name.trim() || !formData.type || formData.services.length === 0}
          >
            {isLoading ? 'Creating...' : 
             userType === 'founders' ? 'Launch Project' :
             userType === 'incubators' ? 'Add to Portfolio' :
             userType === 'enterprise' ? 'Start Initiative' :
             'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}