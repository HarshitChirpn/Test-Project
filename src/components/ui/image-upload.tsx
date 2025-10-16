import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
// Note: Image upload functionality will be handled by backend API

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  folder = "images",
  accept = "image/*",
  maxSize = 5,
  label = "Image",
  placeholder = "Select an image to upload"
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Error",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, `${folder}/${filename}`);

      // Upload file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      onChange(downloadURL);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!value || !onRemove) return;

    try {
      // If it's a Firebase Storage URL, try to delete the file
      if (value.includes('firebasestorage.googleapis.com')) {
        // Extract the file path from the URL
        const decodedUrl = decodeURIComponent(value);
        const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
        if (pathMatch) {
          const filePath = pathMatch[1];
          const fileRef = ref(storage, filePath);
          await deleteObject(fileRef);
        }
      }

      onRemove();
      
      toast({
        title: "Success",
        description: "Image removed successfully",
      });
    } catch (error) {
      console.error('Remove error:', error);
      // Still call onRemove even if deletion fails
      onRemove();
      toast({
        title: "Warning",
        description: "Image removed from form, but file may still exist in storage",
        variant: "default",
      });
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
        
        <div className="flex-1">
          {value ? (
            <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 truncate flex-1">
                {value.split('/').pop()?.split('?')[0] || 'Uploaded image'}
              </span>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ) : (
            <div
              onClick={handleBrowseClick}
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{placeholder}</span>
                </>
              )}
            </div>
          )}
        </div>
        
        {value && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBrowseClick}
            disabled={disabled || uploading}
          >
            Change
          </Button>
        )}
      </div>
      
      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt="Preview"
            className="w-full max-w-xs h-32 object-cover rounded-md border"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, GIF, WebP. Max size: {maxSize}MB
      </p>
    </div>
  );
}