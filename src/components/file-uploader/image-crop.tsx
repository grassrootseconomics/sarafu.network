import { cn } from "@udecode/cn";
import { CheckIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { toast } from "sonner";
import { Loading } from "../loading";
import { Button } from "../ui/button";

const ImageCrop = ({
  image,
  onComplete,
  className,
  aspectRatio = 1,
  circularCrop = false,
  loading = false,
  onCancel,
}: {
  image: string;
  onComplete: (blob: Blob) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  aspectRatio?: number;
  circularCrop?: boolean;
  loading?: boolean;
  className?: string;
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    width: 300 * aspectRatio,
    height: 300,
    x: 0,
    y: 0,
    unit: "px",
  });

  // Disable body scroll when component mounts
  useEffect(() => {
    // Save original body styles
    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = originalStyle.overflow;

    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    // Restore on cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    if (!imageRef.current) return;
    const imageWidth = imageRef.current.width;
    const imageHeight = imageRef.current.height;
    if (!imageWidth || !imageHeight) return;
    if (imageWidth / aspectRatio > imageHeight) {
      setCrop({
        width: imageHeight * aspectRatio,
        height: imageHeight,
        x: 0,
        y: 0,
        unit: "px",
      });
    } else {
      setCrop({
        width: imageWidth,
        height: imageWidth / aspectRatio,
        x: 0,
        y: 0,
        unit: "px",
      });
    }
  }, [aspectRatio]);

  // Get cropped image
  const onCropComplete = useCallback((completedCrop: Crop) => {
    if (!completedCrop || !imageRef.current) {
      console.log("No completed crop or image ref");
      return;
    }
    const canvas = document.createElement("canvas");
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("No context");
      return;
    }
    ctx.drawImage(
      imageRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise<Blob>((resolve) => {
      try {
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            toast.error("Canvas is empty");
            return;
          }
          // const fileUrl = window.URL.createObjectURL(blob);
          resolve(blob);
        }, "image/jpeg");
      } catch (error) {
        console.error("Error getting cropped image", error);
        toast.error("Error getting cropped image");
      }
    });
  }, []);

  // Handle click to prevent event bubbling
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Create modal content with very high z-index
  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 w-full h-full z-[99999] bg-black/80",
        className
      )}
      style={{ pointerEvents: "auto" }}
      onClick={handleOverlayClick}
    >
      <div
        className="fixed inset-0 w-full h-full flex items-center justify-center"
        style={{ pointerEvents: "auto" }}
        onClick={handleOverlayClick}
      >
        <ReactCrop
          crop={crop}
          aspect={aspectRatio}
          circularCrop={circularCrop}
          className="mx-auto"
          onChange={(newCrop) => setCrop(newCrop)}
          style={{ zIndex: 100000, pointerEvents: "auto" }}
        >
          <img
            alt="Cropped"
            src={image}
            ref={imageRef}
            style={{
              maxWidth: "calc(100vw - 40px)",
              maxHeight: "calc(100vh - 40px)",
              objectFit: "contain",
              pointerEvents: "auto",
            }}
          />
        </ReactCrop>
        <Button
          type="button"
          onClick={async (e) => {
            e.stopPropagation();
            const croppedImageBlob = await onCropComplete(crop);
            if (croppedImageBlob) {
              await onComplete(croppedImageBlob);
            }
          }}
          variant="outline"
          className="absolute bottom-2 w-10 h-10 p-2 left-[50%] translate-x-[-50%] rounded-full"
          style={{ zIndex: 100001, pointerEvents: "auto" }}
          disabled={loading}
        >
          {loading ? <Loading /> : <CheckIcon className="w-full h-full" />}
        </Button>
        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void onCancel();
          }}
          variant="outline"
          className="absolute top-2 right-2 w-10 h-10 p-2 rounded-full"
          style={{ zIndex: 100001, pointerEvents: "auto" }}
        >
          <XIcon className="w-full h-full" />
        </Button>
      </div>
    </div>
  );

  // Use createPortal to render at the very top level, outside of any stacking contexts
  return createPortal(modalContent, document.body);
};

export default ImageCrop;
