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
}: {
  product: RouterOutput["voucher"]["commodities"][number];
  onClick?: (product: RouterOutput["voucher"]["commodities"][number]) => void;
  voucherSymbol: string;
  isOwner: boolean;
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

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 h-full flex flex-col rounded-lg overflow-hidden border-muted hover:border-muted-foreground/20">
      <div className="relative bg-muted/30 h-40 flex items-center justify-center">
        {/* Placeholder for product image - in a real app, you'd use an actual image */}
        <div className="flex flex-col items-center justify-center text-muted-foreground/60">
          <ImageIcon className="h-10 w-10 mb-2" />
          <span className="text-xs">No image available</span>
        </div>

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
