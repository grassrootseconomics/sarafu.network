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
      className="grid grid-cols-6 gap-2 items-center p-2 rounded-sm"
    >
      <div className="flex flex-col col-span-3 pr-2">
        <div className="font-semibold">{product.commodity_name}</div>
        <div className="font-light">{product.commodity_description}</div>
      </div>
      <div className="col-span-1">{product.quantity}</div>
      <div className="col-span-2">
        <span className="font-light">every&nbsp;</span>
        {product.frequency}
      </div>
    </div>
  );
};
