import { Activity } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { type RouterOutput } from "~/server/api/root";

type VoucherItem = RouterOutput["voucher"]["list"][number];

interface VoucherListItemProps {
  voucher: VoucherItem;
  viewMode: "grid" | "list";
}

export function VoucherListItem({ voucher, viewMode }: VoucherListItemProps) {
  const location = voucher.location_name?.split(",");
  const shortLocation = location
    ? location.slice(location.length - 2, location.length).join(", ")
    : null;

  if (viewMode === "grid") {
    return (
      <Link href={`/vouchers/${voucher.voucher_address}`}>
        <Card className="overflow-hidden h-[420px] flex flex-col hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          {/* Banner/Icon Section */}
          <div className="relative h-48 w-full flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            {voucher.banner_url ? (
              <Image
                src={voucher.banner_url}
                alt={voucher.voucher_name || ""}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={voucher.icon_url || "/apple-touch-icon.png"}
                    alt={voucher.voucher_name || ""}
                  />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {voucher.voucher_name?.substring(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          <CardHeader className="flex-shrink-0 pb-2">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg leading-6 truncate">
                  {voucher.voucher_name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm">{voucher.symbol}</span>
                  {shortLocation && (
                    <Badge variant="secondary" className="text-xs">
                      {shortLocation}
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col justify-between pt-0">
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
              {voucher.voucher_description}
            </p>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>{voucher.transaction_count || 0} transactions</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // List view - simplified and cleaner
  return (
    <Link href={`/vouchers/${voucher.voucher_address}`}>
      <div className="flex items-center gap-4 py-3 px-4 hover:bg-muted/50 transition-colors rounded-lg">
        {/* Avatar */}
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage
            src={voucher.icon_url || "/apple-touch-icon.png"}
            alt={voucher.voucher_name || ""}
          />
          <AvatarFallback className="text-sm font-bold">
            {voucher.voucher_name?.substring(0, 2).toUpperCase() || "??"}
          </AvatarFallback>
        </Avatar>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">
              {voucher.voucher_name}
            </h3>
            <span className="font-mono text-sm text-muted-foreground flex-shrink-0">
              ({voucher.symbol})
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-1">
            {shortLocation && (
              <Badge variant="outline" className="text-xs">
                {shortLocation}
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>{voucher.transaction_count || 0}</span>
            </div>
          </div>

          {voucher.voucher_description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {voucher.voucher_description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}