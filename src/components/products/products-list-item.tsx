import { ClockIcon, EditIcon, PackageIcon } from "lucide-react";
import { Authorization } from "~/hooks/useAuth";
import { type RouterOutput } from "~/server/api/root";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
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
      return <Badge variant="outline">Price on request</Badge>;
    }
    return (
      <span className="text-lg font-bold text-green-600">
        {product.price} {voucherSymbol}
      </span>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col rounded-lg overflow-hidden">
      <div className="relative">
        <div className="absolute top-2 right-2">
          <Badge
            variant={
              product.commodity_type === "GOOD" ? "default" : "secondary"
            }
          >
            {product.commodity_type}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{product.commodity_name}</h3>
          <Authorization
            resource={"Products"}
            action="UPDATE"
            isOwner={isOwner}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => onClick?.(product)}
                    className="p-1"
                  >
                    <EditIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit this product</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Authorization>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {product.commodity_description}
        </p>
        <div className="mt-auto space-y-2">
          <div>{getPriceDisplay()}</div>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center">
              <PackageIcon className="h-4 w-4 mr-1 text-gray-500" />
              <span>
                Qty: <span className="font-medium">{product.quantity}</span>
              </span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
              <span>
                Freq: <span className="font-medium">{product.frequency}</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
