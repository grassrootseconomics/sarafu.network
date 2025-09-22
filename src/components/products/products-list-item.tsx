import { EditIcon, ImageIcon } from "lucide-react";
import { Authorization } from "~/hooks/useAuth";
import { type RouterOutput } from "~/server/api/root";
import { truncateByDecimalPlace } from "~/utils/units/number";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { VoucherSymbol } from "../voucher/voucher-name";

export const ProductListItem = ({
  product,
  onEditClick,
  onClick,
  isOwner,
}: {
  onClick?: (product: RouterOutput["products"]["list"][number]) => void;
  product: RouterOutput["products"]["list"][number];
  onEditClick?: (product: RouterOutput["products"]["list"][number]) => void;
  isOwner: boolean;
}) => {
  const getPriceDisplay = () => {
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-green-600">
          {product.price ? truncateByDecimalPlace(product.price, 2) : ""}
        </span>
        <span className="text-sm text-green-500 font-medium">
          <VoucherSymbol address={product.voucher_address} />
        </span>
      </div>
    );
  };
  return (
    <Card
      className="group hover:shadow-md transition-all duration-200 border-muted hover:border-muted-foreground/20"
      onClick={() => onClick?.(product)}
    >
      <CardContent className="p-0 flex items-center gap-4">
        {/* Product Image */}
        <div className="relative bg-muted/30 h-24 w-24 flex items-center justify-center rounded-lg flex-shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.commodity_name}
              className="w-full h-full object-cover rounded-l-lg"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 p-2">
          <div className="flex items-center justify-start gap-2 mb-1">
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
              {product.commodity_name}
            </h3>
          </div>

          <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
            {product.commodity_description || "No description available"}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <span>
                Qty:{" "}
                <span className="font-medium text-foreground">
                  {product.quantity || "N/A"}
                </span>
              </span>
            </div>
            <div className="flex items-center">
              <span>
                Freq:{" "}
                <span className="font-medium text-foreground">
                  {product.frequency || "N/A"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center align-middle gap-2 flex-shrink-0 p-2">
          {/* Price */}
          {getPriceDisplay()}

          {onEditClick && (
            <Authorization
              resource={"Products"}
              action="UPDATE"
              isOwner={isOwner}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditClick?.(product)}
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};
