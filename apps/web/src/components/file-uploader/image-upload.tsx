import { CameraIcon } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import type Webcam from "react-webcam";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { AspectRatio } from "../ui/aspect-ratio";
import { Button } from "../ui/button";
import FileInput from "./file-input";
import ImageCrop from "./image-crop";
import useFileUpload from "./use-file-upload";
import WebcamCapture from "./webcam-capture";

interface ImageUploadComponentProps {
  value: string | null;
  folder: string;
  onUpload: (value: string) => void;
  aspectRatio?: number;
  circularCrop?: boolean;
  className?: string;
}

const ImageUploadComponent = ({
  value,
  folder,
  onUpload,
  aspectRatio,
  className,
  circularCrop,
}: ImageUploadComponentProps) => {
  const [state, setState] = useState({
    image: null as string | null,
    currentStep: "initial" as "initial" | "webcam" | "crop",
    loading: false,
  });

  const webcamRef = useRef<Webcam>(null);
  const { uploadFile } = useFileUpload();

  // Handle file selection
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadstart = () =>
        setState((prev) => ({ ...prev, loading: true }));
      reader.onloadend = () =>
        setState((prev) => ({ ...prev, loading: false }));
      reader.onload = () => {
        setState((prev) => ({
          ...prev,
          image: reader.result as string,
          currentStep: "crop",
        }));
      };
      reader.onerror = () => {
        toast.error("Failed to read file.");
        setState((prev) => ({ ...prev, loading: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload cropped image
  const handleUpload = async (blob: Blob) => {
    if (!blob) {
      toast.error("No cropped image to upload.");
      return;
    }
    const file = new File([blob], "cropped_image.jpg", { type: "image/jpeg" });

    try {
      setState((prev) => ({ ...prev, loading: true }));
      const url = await uploadFile(file, folder);
      onUpload(url);
      setState((prev) => ({ ...prev, currentStep: "initial", loading: false }));
    } catch (error) {
      toast.error("Failed to upload image.");
      console.error(error);
      setState((prev) => ({ ...prev, currentStep: "initial", loading: false }));
    }
  };

  // Capture photo from webcam
  const capturePhoto = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    setState((prev) => ({ ...prev, image: imageSrc, currentStep: "crop" }));
  };

  return (
    <>
      <AspectRatio
        ratio={aspectRatio}
        className={cn("relative bg-muted mx-auto", className)}
      >
        {state.currentStep === "initial" && (
          <>
            {value && (
              <Image
                src={value}
                alt="Uploaded Image"
                fill
                className="rounded-md object-cover"
              />
            )}
            <div className="absolute bottom-0 right-0 flex justify-end items-end gap-2 h-full w-full">
              <FileInput onSelectFile={onSelectFile} />
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setState((prev) => ({ ...prev, currentStep: "webcam" }));
                }}
                variant="outline"
                size="sm"
              >
                <CameraIcon size={16} />
              </Button>
            </div>
          </>
        )}
        {state.currentStep === "webcam" && (
          <WebcamCapture
            ref={webcamRef}
            capturePhoto={capturePhoto}
            onCancel={() =>
              setState((prev) => ({ ...prev, currentStep: "initial" }))
            }
          />
        )}
      </AspectRatio>
      {state.currentStep === "crop" && state.image && (
        <ImageCrop
          image={state.image}
          onComplete={handleUpload}
          onCancel={() =>
            setState((prev) => ({ ...prev, currentStep: "initial" }))
          }
          aspectRatio={aspectRatio}
          circularCrop={circularCrop}
          loading={state.loading}
        />
      )}
    </>
  );
};

export default ImageUploadComponent;
