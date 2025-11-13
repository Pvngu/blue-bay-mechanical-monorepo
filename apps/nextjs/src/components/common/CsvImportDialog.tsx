'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface CsvImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: any[]) => Promise<void>;
  resourceName: string;
  expectedHeaders?: string[];
}

interface ParseResult {
  data: any[];
  errors: string[];
  meta: {
    fields?: string[];
  };
}

export function CsvImportDialog({
  isOpen,
  onOpenChange,
  onImport,
  resourceName,
  expectedHeaders = [],
}: CsvImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setParseErrors(['Por favor selecciona un archivo CSV válido']);
      return;
    }

    setFile(selectedFile);
    setParseErrors([]);
    setUploadSuccess(false);
    setUploadError(null);

    // Parse CSV
    Papa.parse<any>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const errors: string[] = [];

        // Validate headers if expected headers are provided
        if (expectedHeaders.length > 0 && results.meta.fields) {
          const missingHeaders = expectedHeaders.filter(
            header => !results.meta.fields?.includes(header)
          );
          
          if (missingHeaders.length > 0) {
            errors.push(
              `Faltan las siguientes columnas: ${missingHeaders.join(', ')}`
            );
          }
        }

        // Check if we have data
        if (results.data.length === 0) {
          errors.push('El archivo CSV está vacío');
        }

        setParseErrors(errors);
        setParsedData(results.data);
      },
      error: (error) => {
        setParseErrors([`Error al leer el archivo: ${error.message}`]);
        setParsedData([]);
      },
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0 || parseErrors.length > 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onImport(parsedData);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);

      // Close dialog after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Error al importar los datos'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setParseErrors([]);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar {resourceName} desde CSV</DialogTitle>
          <DialogDescription>
            Selecciona un archivo CSV para importar múltiples registros a la vez.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Input */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {file ? 'Cambiar archivo' : 'Seleccionar archivo CSV'}
            </Button>
          </div>

          {/* File Info */}
          {file && (
            <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {parsedData.length} registro(s) encontrado(s)
                </p>
              </div>
            </div>
          )}

          {/* Parse Errors */}
          {parseErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {parseErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-center text-muted-foreground">
                Importando... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Upload Success */}
          {uploadSuccess && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                ¡Importación completada exitosamente!
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Error */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Expected Headers Info */}
          {expectedHeaders.length > 0 && !file && (
            <div className="p-3 border rounded-md bg-muted/30">
              <p className="text-sm font-medium mb-2">
                Columnas esperadas en el CSV:
              </p>
              <div className="flex flex-wrap gap-2">
                {expectedHeaders.map(header => (
                  <span
                    key={header}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                  >
                    {header}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={
              !file ||
              parsedData.length === 0 ||
              parseErrors.length > 0 ||
              isUploading ||
              uploadSuccess
            }
          >
            {isUploading ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
