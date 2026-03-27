import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

interface OfferGridCardProps {
  name: string;
  imageUrl: string | null;
  priceDisplay?: React.ReactNode;
  locationLabel?: string | null;
  actions?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function OfferGridCard({
  name,
  imageUrl,
  priceDisplay,
  locationLabel,
  actions,
  onClick,
  children,
}: OfferGridCardProps) {
  return (
    <div
      className="rounded-lg overflow-hidden border bg-card hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[3/2] w-full bg-muted/20 rounded-lg overflow-hidden border">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        {locationLabel && (
          <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded backdrop-blur-xs">
            {locationLabel}
          </span>
        )}
        {actions && (
          <div
            className="absolute top-1.5 left-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-2.5 space-y-1">
        <p className="font-bold text-sm leading-tight truncate">{name}</p>
        {priceDisplay}
        {children}
      </div>
    </div>
  );
}

export function OfferGridCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="aspect-[3/2] w-full" />
      <div className="p-2.5 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
