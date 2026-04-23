"use client";

import { CameraIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import type Webcam from "react-webcam";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import ImageCrop from "./file-uploader/image-crop";
import useFileUpload from "./file-uploader/use-file-upload";
import WebcamCapture from "./file-uploader/webcam-capture";
import { Loading } from "./loading";
import { Button } from "./ui/button";

type Step = "idle" | "crop" | "webcam";

interface EditableImageOverlayProps {
  children: React.ReactNode;
  canEdit: boolean;
  folder: string;
  aspectRatio?: number;
  circularCrop?: boolean;
  onImageSaved: (url: string) => void | Promise<void>;
  isSaving?: boolean;
  overlayPosition?: "top-right" | "center";
  className?: string;
}

export function EditableImageOverlay({
  children,
  canEdit,
  folder,
  aspectRatio,
  circularCrop,
  onImageSaved,
  isSaving,
  overlayPosition = "top-right",
  className,
}: EditableImageOverlayProps) {
  const [step, setStep] = useState<Step>("idle");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const { uploadFile } = useFileUpload();

  if (!canEdit) {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setStep("crop");
      };
      reader.onerror = () => {
        toast.error("Failed to read file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (blob: Blob) => {
    if (!blob) {
      toast.error("No cropped image to upload.");
      return;
    }
    const file = new File([blob], "cropped_image.jpg", { type: "image/jpeg" });
    try {
      setLoading(true);
      const url = await uploadFile(file, folder);
      setStep("idle");
      setLoading(false);
      await onImageSaved(url);
    } catch (error) {
      toast.error("Failed to upload image.");
      console.error(error);
      setStep("idle");
      setLoading(false);
    }
  };

  const capturePhoto = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setStep("crop");
  };

  const isLoading = loading || isSaving;

  return (
    <div className={cn("group/editable relative", className)}>
      {children}

      {/* Hidden file input */}
      <input
        type="file"
        accept=".png, .jpg, .jpeg, .webp"
        onChange={onSelectFile}
        ref={fileInputRef}
        className="hidden"
      />

      {/* Edit overlay */}
      {overlayPosition === "top-right" ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          aria-label="Edit image"
          className="absolute top-3 right-3 z-20 gap-1.5 bg-black/50 hover:bg-black/70 text-white border-white/20 backdrop-blur-sm opacity-60 sm:opacity-0 sm:group-hover/editable:opacity-100 transition-opacity duration-200"
        >
          {isLoading ? (
            <Loading />
          ) : (
            <>
              <CameraIcon className="size-4" />
              <span className="text-xs hidden sm:inline">Edit</span>
            </>
          )}
        </Button>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Edit image"
          className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/0 hover:bg-black/40 opacity-60 sm:opacity-0 sm:group-hover/editable:opacity-100 transition-all duration-200 cursor-pointer"
        >
          {isLoading ? (
            <Loading />
          ) : (
            <CameraIcon className="size-6 text-white drop-shadow-md" />
          )}
        </div>
      )}

      {/* Crop modal */}
      {step === "crop" && image && (
        <ImageCrop
          image={image}
          onComplete={handleCropComplete}
          onCancel={() => setStep("idle")}
          aspectRatio={aspectRatio}
          circularCrop={circularCrop}
          loading={loading}
        />
      )}

      {/* Webcam modal */}
      {step === "webcam" && (
        <WebcamCapture
          ref={webcamRef}
          capturePhoto={capturePhoto}
          onCancel={() => setStep("idle")}
        />
      )}
    </div>
  );
}
