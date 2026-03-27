import { EditIcon } from "lucide-react";
import { Authorization } from "~/hooks/use-auth";
import { type RouterOutput } from "~/server/api/root";
import { truncateByDecimalPlace } from "~/utils/units/number";
import { Button } from "../ui/button";
import { VoucherSymbol } from "../voucher/voucher-name";
import { OfferGridCard } from "./offer-grid-card";

export const OfferListItem = ({
  product,
  onEditClick,
  onClick,
  isOwner,
}: {
  onClick?: (product: RouterOutput["products"]["list"][number]) => void;
  product: RouterOutput["products"]["list"][number];
  onEditClick?: (product: RouterOutput["products"]["list"][number]) => void;
  isOwner: boolean | undefined;
}) => {
  return (
    <OfferGridCard
      name={product.commodity_name}
      imageUrl={product.image_url}
      locationLabel={product.location_name || null}
      onClick={() => onClick?.(product)}
      priceDisplay={
        product.price ? (
          <p className="text-xs font-bold tabular-nums whitespace-nowrap mt-0.5">
            {truncateByDecimalPlace(product.price, 2)}{" "}
            <span className="text-xs font-medium text-muted-foreground">
              <VoucherSymbol address={product.voucher_address} />
            </span>
            {product.unit && (
              <span className="text-xs text-muted-foreground">
                {" "}
                / {product.unit}
              </span>
            )}
          </p>
        ) : undefined
      }
      actions={
        onEditClick ? (
          <Authorization
            resource="Products"
            action="UPDATE"
            isOwner={isOwner}
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEditClick(product)}
              className="h-7 w-7 p-0 shadow-sm"
            >
              <EditIcon className="h-3.5 w-3.5" />
            </Button>
          </Authorization>
        ) : undefined
      }
    />
  );
};
