"use client";

import { useCharacterLimit } from "@/components/hooks/use-character-limit";
import { useImageUpload } from "@/components/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, ImagePlus, X } from "lucide-react";
import { useId, useState } from "react";

interface ProfileEditDialogProps {
  children: React.ReactNode;
  defaultValues?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    website?: string;
    linkedin?: string;
    bio?: string;
    profileImage?: string;
    backgroundImage?: string;
  };
  onSave?: (values: {
    firstName: string;
    lastName: string;
    username: string;
    website: string;
    linkedin: string;
    bio: string;
    profileImage?: string;
    backgroundImage?: string;
  }) => void;
  onUploadSuccess?: () => void;
}

function ProfileEditDialog({ children, defaultValues, onSave, onUploadSuccess }: ProfileEditDialogProps) {
  const id = useId();
  
  // Form state
  const [firstName, setFirstName] = useState(defaultValues?.firstName || "");
  const [lastName, setLastName] = useState(defaultValues?.lastName || "");
  const [username, setUsername] = useState(defaultValues?.username || "");
  const [website, setWebsite] = useState(defaultValues?.website || "");
  const [linkedin, setLinkedin] = useState(defaultValues?.linkedin || "");

  const maxLength = 180;
  const {
    value: bio,
    characterCount,
    handleChange: handleBioChange,
    maxLength: limit,
  } = useCharacterLimit({
    maxLength,
    initialValue: defaultValues?.bio || "Tell us about yourself, your goals, and what you're looking to accomplish with Idea2MVP...",
  });

  const handleSave = () => {
    onSave?.({
      firstName,
      lastName,
      username,
      website,
      linkedin,
      bio,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Edit profile
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Make changes to your profile here. You can change your photo and set personal information.
        </DialogDescription>
        <div className="overflow-y-auto">
          <ProfileBackground defaultImage="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&h=300&q=80" />
          <ProfileAvatar 
            defaultImage={defaultValues?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80"} 
            onUploadSuccess={onUploadSuccess}
          />
          <div className="px-6 pb-6 pt-4">
            <form className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-first-name`}>First name</Label>
                  <Input
                    id={`${id}-first-name`}
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    type="text"
                    className="focus:ring-brand-yellow focus:border-brand-yellow"
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-last-name`}>Last name</Label>
                  <Input
                    id={`${id}-last-name`}
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    type="text"
                    className="focus:ring-brand-yellow focus:border-brand-yellow"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-username`}>Username</Label>
                <div className="relative">
                  <Input
                    id={`${id}-username`}
                    className="peer pe-9 focus:ring-brand-yellow focus:border-brand-yellow"
                    placeholder="john-doe-123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground/80 peer-disabled:opacity-50">
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="text-green-500"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-website`}>Website</Label>
                <div className="flex rounded-lg shadow-sm shadow-black/5">
                  <span className="-z-10 inline-flex items-center rounded-s-lg border border-input bg-background px-3 text-sm text-muted-foreground">
                    https://
                  </span>
                  <Input
                    id={`${id}-website`}
                    className="-ms-px rounded-s-none shadow-none focus:ring-brand-yellow focus:border-brand-yellow"
                    placeholder="yourwebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-linkedin`}>LinkedIn Profile</Label>
                <div className="flex rounded-lg shadow-sm shadow-black/5">
                  <span className="-z-10 inline-flex items-center rounded-s-lg border border-input bg-background px-3 text-sm text-muted-foreground">
                    https://linkedin.com/in/
                  </span>
                  <Input
                    id={`${id}-linkedin`}
                    className="-ms-px rounded-s-none shadow-none focus:ring-brand-yellow focus:border-brand-yellow"
                    placeholder="your-profile"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-bio`}>Biography</Label>
                <Textarea
                  id={`${id}-bio`}
                  placeholder="Write a few sentences about yourself and your goals with Idea2MVP..."
                  value={bio}
                  maxLength={maxLength}
                  onChange={handleBioChange}
                  className="focus:ring-brand-yellow focus:border-brand-yellow"
                  aria-describedby={`${id}-description`}
                />
                <p
                  id={`${id}-description`}
                  className="mt-2 text-right text-xs text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  <span className="tabular-nums">{limit - characterCount}</span> characters left
                </p>
              </div>
            </form>
          </div>
        </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button 
              type="button" 
              className="bg-brand-yellow hover:bg-yellow-600 text-brand-black"
              onClick={handleSave}
            >
              Save changes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileBackground({ defaultImage }: { defaultImage?: string }) {
  const [hideDefault, setHideDefault] = useState(false);
  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } =
    useImageUpload();

  const currentImage = previewUrl || (!hideDefault ? defaultImage : null);

  const handleImageRemove = () => {
    handleRemove();
    setHideDefault(true);
  };

  return (
    <div className="h-32">
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-yellow/20 to-brand-yellow/10">
        {currentImage && (
          <img
            className="h-full w-full object-cover"
            src={currentImage}
            alt={previewUrl ? "Preview of uploaded image" : "Default profile background"}
            width={512}
            height={96}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <button
            type="button"
            className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-brand-yellow/90 text-brand-black outline-offset-2 transition-colors hover:bg-brand-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
            onClick={handleThumbnailClick}
            aria-label={currentImage ? "Change image" : "Upload image"}
          >
            <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
          </button>
          {currentImage && (
            <button
              type="button"
              className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              onClick={handleImageRemove}
              aria-label="Remove image"
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        aria-label="Upload image file"
      />
    </div>
  );
}

function ProfileAvatar({ defaultImage, onUploadSuccess }: { defaultImage?: string; onUploadSuccess?: () => void }) {
  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange } = useImageUpload();

  const currentImage = previewUrl || defaultImage;

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      console.log('🔄 Starting profile picture upload...');
      const { uploadService } = await import('@/services/uploadService');
      const result = await uploadService.uploadAvatar(file);
      console.log('✅ Upload result:', result);
      
      // Call the success callback to update the user context
      if (onUploadSuccess) {
        console.log('🔄 Calling onUploadSuccess callback...');
        await onUploadSuccess();
        console.log('✅ onUploadSuccess callback completed');
      }
      
      // Show success message
      const { useToast } = await import('@/components/ui/use-toast');
      const { toast } = useToast();
      toast({
        title: "Profile picture updated! 🎉",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error('❌ Error uploading profile picture:', error);
      const { useToast } = await import('@/components/ui/use-toast');
      const { toast } = useToast();
      toast({
        title: "Upload failed ❌",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="-mt-10 px-6">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-gradient-to-br from-brand-yellow/20 to-brand-yellow/10 shadow-sm shadow-black/10">
        {currentImage && (
          <img
            src={currentImage}
            className="h-full w-full object-cover"
            width={80}
            height={80}
            alt="Profile image"
          />
        )}
        <button
          type="button"
          className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-brand-yellow hover:bg-yellow-600 text-brand-black outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
          onClick={handleThumbnailClick}
          aria-label="Change profile picture"
        >
          <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            handleFileChange(e);
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
          className="hidden"
          accept="image/*"
          aria-label="Upload profile picture"
        />
      </div>
    </div>
  );
}

export { ProfileEditDialog };