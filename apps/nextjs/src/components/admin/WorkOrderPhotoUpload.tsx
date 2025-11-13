'use client';

import * as React from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { apiService } from '@/services/apiService';
import { ImagePreviewDialog } from '@/components/common/ImagePreviewDialog';

interface WorkOrderPhoto {
  id: string;
  photo_url: string;
  caption?: string;
  uploaded_at?: string;
}

interface WorkOrderPhotoUploadProps {
  workOrderId: string;
  photos: WorkOrderPhoto[];
  onPhotosChange?: () => void;
}

export function WorkOrderPhotoUpload({ 
  workOrderId, 
  photos: initialPhotos,
  onPhotosChange 
}: WorkOrderPhotoUploadProps) {
  const [photos, setPhotos] = React.useState<WorkOrderPhoto[]>(initialPhotos || []);
  const [isUploading, setIsUploading] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewIndex, setPreviewIndex] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPhotos(initialPhotos || []);
  }, [initialPhotos]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast.warning('Solo se permiten archivos de imagen');
    }
    
    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast.warning('Solo se permiten archivos de imagen');
    }
    
    if (imageFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...imageFiles]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Selecciona al menos una imagen');
      return;
    }

    setIsUploading(true);
    const successfulUploads: string[] = [];
    const failedUploads: string[] = [];

    try {
      // Upload files in parallel for better performance
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('work_order_id', workOrderId);
        formData.append('photo', file);
        formData.append('caption', file.name);

        try {
          await apiService.uploadWorkOrderPhoto(workOrderId, formData);
          successfulUploads.push(file.name);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          failedUploads.push(file.name);
        }
      });

      await Promise.all(uploadPromises);

      // Show results
      if (successfulUploads.length > 0) {
        toast.success(`✓ ${successfulUploads.length} foto(s) subida(s) exitosamente`);
      }
      
      if (failedUploads.length > 0) {
        toast.error(`✗ ${failedUploads.length} foto(s) fallaron al subir`);
      }

      // Clear selected files and refresh
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh photos list
      if (onPhotosChange) {
        onPhotosChange();
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await apiService.deleteWorkOrderPhoto(photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      toast.success('Foto eliminada');
      
      if (onPhotosChange) {
        onPhotosChange();
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Error al eliminar la foto');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="photo-upload">Subir Fotos</Label>
        
        {/* Drag and Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors"
        >
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Arrastra imágenes aquí o haz clic para seleccionar
          </p>
          <Input
            id="photo-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Seleccionar Archivos
          </Button>
        </div>

        {selectedFiles.length > 0 && (
          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo {selectedFiles.length} foto(s)...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Subir {selectedFiles.length} foto(s)
              </>
            )}
          </Button>
        )}
      </div>

      {/* Preview selected files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <Label>Archivos Seleccionados ({selectedFiles.length})</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {selectedFiles.map((file, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-2">
                  <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="object-cover w-full h-full"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveSelectedFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs mt-1 truncate">{file.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Existing photos */}
      {photos.length > 0 ? (
        <div className="space-y-2">
          <Label>Fotos Existentes ({photos.length})</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {photos.map((photo, index) => (
              <Card key={photo.id} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || 'Work order photo'}
                      className="object-cover w-full h-full cursor-pointer transition-transform group-hover:scale-105"
                      onClick={() => {
                        setPreviewIndex(index);
                        setPreviewOpen(true);
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => {
                          setPreviewIndex(index);
                          setPreviewOpen(true);
                        }}
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeletePhoto(photo.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {photo.caption && (
                    <p className="text-xs mt-1 truncate">{photo.caption}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>No hay fotos subidas aún</p>
        </div>
      )}

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        images={photos.map(p => ({ url: p.photo_url, caption: p.caption }))}
        initialIndex={previewIndex}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
