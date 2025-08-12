import { ClockIcon, EditIcon, ImageIcon, PackageIcon } from "lucide-react";
import { Authorization } from "~/hooks/useAuth";
import { type RouterOutput } from "~/server/api/root";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export const ProductListItem = ({
  product,
  onClick,
  voucherSymbol,
  isOwner,
  layout = "card",
}: {
  product: RouterOutput["voucher"]["commodities"][number];
  onClick?: (product: RouterOutput["voucher"]["commodities"][number]) => void;
  voucherSymbol: string;
  isOwner: boolean;
  layout?: "card" | "list";
}) => {
  const getPriceDisplay = () => {
    if (
      product.price === null ||
      product.price === undefined ||
      product.price === 0
    ) {
      return (
        <Badge
          variant="outline"
          className="text-amber-600 border-amber-300 bg-amber-50"
        >
          Price on request
        </Badge>
      );
    }
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-green-600">
          {product.price}
        </span>
        <span className="text-sm text-green-500 font-medium">
          {voucherSymbol}
        </span>
      </div>
    );
  };

  const getTypeVariant = () => {
    if (product.commodity_type === "GOOD") return "default";
    if (product.commodity_type === "SERVICE") return "secondary";
    return "outline";
  };

  if (layout === "list") {
    return (
      <Card className="group hover:shadow-md transition-all duration-200 border-muted hover:border-muted-foreground/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Product Image */}
            <div className="relative bg-muted/30 h-16 w-16 flex items-center justify-center rounded-lg flex-shrink-0">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.commodity_name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
                  {product.commodity_name}
                </h3>
                <Badge variant={getTypeVariant()} className="font-medium text-xs flex-shrink-0">
                  {product.commodity_type}
                </Badge>
              </div>
              
              <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                {product.commodity_description || "No description available"}
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <PackageIcon className="h-4 w-4 mr-1" />
                  <span>Qty: <span className="font-medium text-foreground">{product.quantity || "N/A"}</span></span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>Freq: <span className="font-medium text-foreground">{product.frequency || "N/A"}</span></span>
                </div>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div>{getPriceDisplay()}</div>
              
              <Authorization resource={"Products"} action="UPDATE" isOwner={isOwner}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onClick?.(product)}
                        className="h-8 w-8 p-0"
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit this product</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Authorization>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card layout (original)
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 h-full flex flex-col rounded-lg overflow-hidden border-muted hover:border-muted-foreground/20">
      <div className="relative bg-muted/30 h-40 flex items-center justify-center">
        {/* Placeholder for product image - in a real app, you'd use an actual image */}
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.commodity_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/60">
            <ImageIcon className="h-10 w-10 mb-2" />
            <span className="text-xs">No image available</span>
          </div>
        )}

        <div className="absolute top-3 right-3 z-10">
          <Badge variant={getTypeVariant()} className="font-medium shadow-sm">
            {product.commodity_type}
          </Badge>
        </div>

        <Authorization resource={"Products"} action="UPDATE" isOwner={isOwner}>
          <div className="absolute top-3 left-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onClick?.(product)}
                    className="h-8 w-8 p-0 rounded-full bg-muted backdrop-blur-sm hover:bg-muted"
                  >
                    <EditIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Edit this product</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Authorization>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="text-xl font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {product.commodity_name}
          </h3>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow">
          {product.commodity_description || "No description available"}
        </p>

        <div className="mt-auto">{getPriceDisplay()}</div>
      </CardContent>

      <CardFooter className="px-5 py-3 bg-muted/10 border-t text-sm">
        <div className="flex justify-between w-full">
          <div className="flex items-center">
            <PackageIcon className="h-4 w-4 mr-1.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              Qty:{" "}
              <span className="font-medium text-foreground">
                {product.quantity || "N/A"}
              </span>
            </span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              Freq:{" "}
              <span className="font-medium text-foreground">
                {product.frequency || "N/A"}
              </span>
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
