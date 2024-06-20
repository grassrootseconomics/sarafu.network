import { type RouterOutput } from "~/server/api/root";

export const ProductListItem = ({
  product,
  onClick,
}: {
  product: RouterOutput["voucher"]["commodities"][number];
  onClick?: (product: RouterOutput["voucher"]["commodities"][number]) => void;
}) => {
  return (
    <div
      onClick={() => onClick?.(product)}
      className="grid grid-cols-4 gap-2 items-center p-2 rounded-sm"
    >
      <div className="flex flex-col col-span-2">
        <div className="font-semibold">{product.commodity_name}</div>
        <div>{product.commodity_description}</div>
      </div>
      <div>{product.quantity}</div>
      <div>
        <span className="font-light">every&nbsp;</span>
        {product.frequency}
      </div>
    </div>
  );
};
