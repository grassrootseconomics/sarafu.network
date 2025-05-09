import { cn } from "@udecode/cn";
import { CheckIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

  // Handle crop completion
  return (
    <div
      className={cn(
        "fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-muted",
        className
      )}
    >
      <ReactCrop
        crop={crop}
        aspect={aspectRatio}
        circularCrop={circularCrop}
        className="mx-auto"
        onChange={(newCrop) => setCrop(newCrop)}
      >
        <img
          alt="Cropped"
          src={image}
          ref={imageRef}
          style={{
            maxWidth: "calc(100vw - 40px)",
            maxHeight: "calc(100vh - 40px)",
            objectFit: "contain",
          }}
        />
      </ReactCrop>
      <Button
        type="button"
        onClick={async () => {
          const croppedImageBlob = await onCropComplete(crop);
          if (croppedImageBlob) {
            await onComplete(croppedImageBlob);
          }
        }}
        variant="outline"
        className="absolute bottom-2 w-10 h-10 p-2 left-[50%] translate-x-[-50%] rounded-full"
        disabled={loading}
      >
        {loading ? <Loading /> : <CheckIcon className="w-full h-full" />}
      </Button>
      <Button
        type="button"
        onClick={onCancel}
        variant="outline"
        className="absolute top-2 right-2 w-10 h-10 p-2 rounded-full"
      >
        <XIcon className="w-full h-full" />
      </Button>
    </div>
  );
};

export default ImageCrop;
