"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  projectId: string;
  onUploadComplete?: (document: any) => void;
  uploadedBy?: string;
}

interface UploadedFile {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  document?: any;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

export function DocumentUpload({
  projectId,
  onUploadComplete,
  uploadedBy,
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      status: "pending",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Start uploading each file
    newFiles.forEach((uploadFile) => {
      uploadFile(uploadFile.file);
    });
  }, [projectId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: MAX_FILE_SIZE,
  });

  const uploadFile = async (file: File) => {
    const updateFileStatus = (status: UploadedFile["status"], progress: number, error?: string, document?: any) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, status, progress, error, document }
            : f
        )
      );
    };

    updateFileStatus("uploading", 0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (uploadedBy) {
        formData.append("uploadedBy", uploadedBy);
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          updateFileStatus("uploading", progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          updateFileStatus("success", 100, undefined, response.data);
          if (onUploadComplete) {
            onUploadComplete(response.data);
          }
        } else {
          const error = JSON.parse(xhr.responseText);
          updateFileStatus("error", 0, error.message || "Error uploading file");
        }
      });

      xhr.addEventListener("error", () => {
        updateFileStatus("error", 0, "Network error");
      });

      xhr.open("POST", `/api/projects/${projectId}/documents`);
      xhr.send(formData);
    } catch (error) {
      updateFileStatus("error", 0, error instanceof Error ? error.message : "Unknown error");
    }
  };

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== file));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          "hover:border-primary hover:bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {isDragActive
                ? "Suelta los archivos aquí"
                : "Arrastra archivos aquí o haz clic para seleccionar"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Formatos: PDF, JPG, PNG (máx. 5MB)
            </p>
          </div>
        </div>
      </Card>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadFile, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {uploadFile.status === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : uploadFile.status === "error" ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <File className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadFile.file.size / 1024).toFixed(1)} KB
                  </p>

                  {/* Progress bar */}
                  {uploadFile.status === "uploading" && (
                    <Progress value={uploadFile.progress} className="mt-2" />
                  )}

                  {/* Error message */}
                  {uploadFile.status === "error" && uploadFile.error && (
                    <p className="text-xs text-destructive mt-1">
                      {uploadFile.error}
                    </p>
                  )}

                  {/* Success message */}
                  {uploadFile.status === "success" && (
                    <p className="text-xs text-green-600 mt-1">
                      Subido exitosamente
                    </p>
                  )}
                </div>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(uploadFile.file)}
                  disabled={uploadFile.status === "uploading"}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
