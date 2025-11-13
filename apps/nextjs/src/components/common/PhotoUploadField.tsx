'use client';

import * as React from 'react';
import { Upload, X, Eye, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ImagePreviewDialog } from '@/components/common/ImagePreviewDialog';

interface PhotoUploadFieldProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function PhotoUploadField({
  value = [],
  onChange,
  disabled = false,
  label = 'Photos',
  description = 'Upload images (JPG, PNG, etc.)',
}: PhotoUploadFieldProps) {
  const [files, setFiles] = React.useState<File[]>(value);
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewIndex, setPreviewIndex] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Update local state when value prop changes
  React.useEffect(() => {
    setFiles(value);
  }, [value]);

  // Generate preview URLs for selected files
  React.useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Cleanup URLs on unmount
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    const updatedFiles = [...files, ...imageFiles];
    setFiles(updatedFiles);
    onChange?.(updatedFiles);

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;

    const droppedFiles = Array.from(event.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    
    const updatedFiles = [...files, ...imageFiles];
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handlePreviewClick = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-4">
      {label && (
        <div className="space-y-1">
          <Label>{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Drag and Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          disabled
            ? 'border-muted-foreground/10 bg-muted/5 cursor-not-allowed'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer'
        }`}
      >
        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          Arrastra imágenes aquí o haz clic para seleccionar
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="mr-2 h-4 w-4" />
          Seleccionar Archivos
        </Button>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">
            Imágenes Seleccionadas ({files.length})
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {files.map((file, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
                    <img
                      src={previewUrls[index]}
                      alt={file.name}
                      className="object-cover w-full h-full cursor-pointer transition-transform group-hover:scale-105"
                      onClick={() => handlePreviewClick(index)}
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => handlePreviewClick(index)}
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Delete Button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveFile(index)}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* File Name */}
                  <p className="text-xs mt-1 truncate" title={file.name}>
                    {file.name}
                  </p>
                  
                  {/* File Size */}
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        images={previewUrls.map((url, idx) => ({
          url,
          caption: files[idx]?.name,
        }))}
        initialIndex={previewIndex}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
