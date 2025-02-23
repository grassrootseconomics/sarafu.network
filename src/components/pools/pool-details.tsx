"use client";
import {
  CircleDollarSign,
  FileText,
  Lock,
  Settings,
  User,
  Wallet,
} from "lucide-react";
import { type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import Address from "../address";
import { useSwapPool } from "./hooks";

interface DetailItem {
  label: string;
  value: string | number | ReactNode;
  loading: boolean;
  icon?: ReactNode;
}

interface DetailSection {
  title: string;
  icon: ReactNode;
  items: DetailItem[];
}

export const PoolDetails = ({ address }: { address: `0x${string}` }) => {
  const { data: pool, isLoading } = useSwapPool(address);

  const sections: DetailSection[] = [
    {
      title: "Basic Information",
      icon: <FileText className="h-5 w-5" />,
      items: [
        { label: "Name", value: pool?.name ?? "", loading: isLoading },
        {
          label: "Vouchers",
          value: pool?.vouchers.length ?? "",
          loading: isLoading,
        },
        {
          label: "Fee",
          value: pool?.feePercentage.toString() + " %",
          loading: isLoading,
        },
      ],
    },
    {
      title: "Addresses",
      icon: <Wallet className="h-5 w-5" />,
      items: [
        {
          label: "Pool Address",
          value: address ? <Address address={address} /> : "",
          loading: isLoading,
        },
        {
          label: "Owner",
          value: pool?.owner ? <Address address={pool.owner} /> : "",
          loading: isLoading,
          icon: <User className="h-4 w-4" />,
        },
        {
          label: "Fee Address",
          value: pool?.feeAddress ? <Address address={pool.feeAddress} /> : "",
          loading: isLoading,
          icon: <CircleDollarSign className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Contract Configuration",
      icon: <Settings className="h-5 w-5" />,
      items: [
        {
          label: "Quoter",
          value: pool?.quoter ? <Address address={pool.quoter} /> : "",
          loading: isLoading,
        },
        {
          label: "Voucher Registry",
          value: pool?.tokenRegistry ? (
            <Address address={pool.tokenRegistry} />
          ) : (
            ""
          ),
          loading: isLoading,
          icon: <FileText className="h-4 w-4" />,
        },
        {
          label: "Limiter",
          value: pool?.tokenLimiter ? (
            <Address address={pool.tokenLimiter} />
          ) : (
            ""
          ),
          loading: isLoading,
          icon: <Lock className="h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sections.map((section) => (
        <Card key={section.title} className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              {section.icon}
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.items.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {item.icon}
                  {item.label}
                </div>
                {item.loading ? (
                  <Skeleton className="h-6 w-full" />
                ) : (
                  <div className="font-medium break-all">
                    {item.value || "—"}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
