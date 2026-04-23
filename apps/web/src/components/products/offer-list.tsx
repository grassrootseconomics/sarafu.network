"use client";
import {
  FilterIcon,
  ImageIcon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ResponsiveModal } from "~/components/responsive-modal";
import { type RouterOutputs, trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { truncateByDecimalPlace } from "@sarafu/core/units/number";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { VoucherSymbol } from "../voucher/voucher-name";
import { OfferGridCardSkeleton } from "./offer-grid-card";
import { ProductManager } from "./product-manager";
import { OfferListItem } from "./offer-list-item";
import { type ProductFormInput } from "@sarafu/schemas/product";

type Product = RouterOutputs["products"]["list"][number];

function OfferDetailContent({ product }: { product: Product }) {
  return (
    <div className="space-y-4">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full bg-muted/30 rounded-md overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.commodity_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
        )}
      </div>

      {/* Product name + price */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-tight">
            {product.commodity_name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {product.commodity_type}
            </Badge>
          </div>
        </div>
        {product.price !== null &&
          product.price !== undefined &&
          product.price > 0 && (
            <p className="text-lg font-bold tabular-nums whitespace-nowrap">
              {truncateByDecimalPlace(product.price, 2)}{" "}
              <span className="text-base font-normal text-muted-foreground">
                <VoucherSymbol address={product.voucher_address} />
              </span>
              {product.unit && (
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / {product.unit}
                </span>
              )}
            </p>
          )}
      </div>

      {/* Description */}
      {product.commodity_description && (
        <p className="text-sm text-muted-foreground">
          {product.commodity_description}
        </p>
      )}

      {/* Metadata */}
      {(product.quantity || product.frequency) && (
        <div className="flex gap-4 text-xs text-muted-foreground">
          {product.quantity !== null &&
            product.quantity !== undefined &&
            product.quantity > 0 && <span>Quantity: {product.quantity}</span>}
          {product.frequency && <span>Frequency: {product.frequency}</span>}
        </div>
      )}
    </div>
  );
}

export const OfferList = ({
  voucher_address,
  className,
  isOwner,
}: {
  voucher_address: `0x${string}`;
  className?: string;
  isOwner: boolean | undefined;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [editingProduct, setEditingProduct] = useState<ProductFormInput | null>(
    null,
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    data: products,
    isLoading,
    refetch,
  } = trpc.products.list.useQuery(
    {
      voucher_addresses: [voucher_address],
    },
    {
      enabled: !!voucher_address,
    },
  );

  const handleComplete = async () => {
    setEditingProduct(null);
    await refetch();
  };

  const utils = trpc.useUtils();

  const handleEditProduct = async (product: Product) => {
    const enriched = await utils.products.byId.fetch({ id: product.id });
    setEditingProduct({
      ...product,
      unit: enriched?.unit ?? null,
      categories: enriched?.categories ?? [],
    });
  };

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      searchTerm === "" ||
      product.commodity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.commodity_description &&
        product.commodity_description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesType =
      typeFilter === "ALL" || product.commodity_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const isFiltering = searchTerm !== "" || typeFilter !== "ALL";
  const isEmpty =
    !isLoading && (!filteredProducts || filteredProducts.length === 0);
  const isEmptyAfterFiltering = isEmpty && isFiltering;
  const isEmptyWithoutFiltering = isEmpty && !isFiltering;

  const newProduct: ProductFormInput = {
    voucher_address: voucher_address,
    commodity_name: "",
    commodity_description: "",
    commodity_type: "GOOD",
    price: null,
    quantity: null,
    image_url: null,
    frequency: null,
    unit: null,
    categories: [],
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ProductManager
        isOwner={isOwner}
        onComplete={handleComplete}
        product={editingProduct}
      />
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Offers</h2>
          <Button onClick={() => setEditingProduct(newProduct)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Offer
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex items-center gap-2 min-w-[180px]">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="GOOD">Goods</SelectItem>
                <SelectItem value="SERVICE">Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <OfferGridCardSkeleton key={index} />
          ))}
        </div>
      ) : isEmptyWithoutFiltering ? (
        <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground h-60 bg-muted/20 rounded-lg border border-dashed">
          <PackageIcon className="w-12 h-12 text-muted-foreground/60" />
          <div className="text-center">
            <p className="text-lg font-medium mb-1">No Offers Listed</p>
            <p className="text-sm max-w-md">
              {isOwner
                ? "Add your first offer by clicking the 'Add Offer' button above."
                : "There are no offers available at the moment."}
            </p>
          </div>
          {isOwner && (
            <Button onClick={() => setEditingProduct(newProduct)}>
              Add Your First Offer
            </Button>
          )}
        </div>
      ) : isEmptyAfterFiltering ? (
        <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground h-60 bg-muted/20 rounded-lg border border-dashed">
          <SearchIcon className="w-10 h-10 text-muted-foreground/60" />
          <div className="text-center">
            <p className="text-lg font-medium mb-1">No Matching Offers</p>
            <p className="text-sm max-w-md">
              No offers match your current search and filter criteria. Try
              adjusting your filters.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setTypeFilter("ALL");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts?.map((product) => (
            <OfferListItem
              key={product.id}
              product={product}
              isOwner={isOwner}
              onClick={() => setSelectedProduct(product)}
              onEditClick={() => handleEditProduct(product)}
            />
          ))}
        </div>
      )}

      {/* Offer detail modal */}
      <ResponsiveModal
        open={selectedProduct !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
        title=""
      >
        {selectedProduct && <OfferDetailContent product={selectedProduct} />}
      </ResponsiveModal>
    </div>
  );
};
