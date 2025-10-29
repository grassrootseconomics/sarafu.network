"use client";
import {
  CircleDollarSign,
  FileCode,
  Lock,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import Address from "../address";
import { TransferPoolOwnershipDialog } from "../dialogs/transfer-pool-ownership-dialog";
import { useSwapPool } from "./hooks";

interface DetailItem {
  label: string;
  value: string | ReactNode;
  loading: boolean;
  icon?: ReactNode;
  description?: string;
}

interface DetailSection {
  title: string;
  icon: ReactNode;
  items: DetailItem[];
  action?: ReactNode;
}

export function PoolContractsView({
  address,
  isOwner
}: {
  address: `0x${string}`;
  isOwner?: boolean;
}) {
  const { data: pool, isLoading } = useSwapPool(address);

  const sections: DetailSection[] = [
    {
      title: "Main Pool Contract",
      icon: <FileCode className="h-5 w-5" />,
      items: [
        {
          label: "Pool Address",
          value: address ? <Address address={address} /> : "",
          loading: isLoading,
          description: "The main swap pool contract address",
        },
        {
          label: "Owner",
          value: pool?.owner ? <Address address={pool.owner} /> : "",
          loading: isLoading,
          icon: <User className="h-4 w-4" />,
          description: "Current owner of the pool contract",
        },
      ],
      action: isOwner && pool?.owner ? (
        <TransferPoolOwnershipDialog
          pool_address={address}
          button={
            <Button variant="outline" size="sm" className="w-full mt-4">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Transfer Ownership
            </Button>
          }
        />
      ) : undefined,
    },
    {
      title: "Fee Configuration",
      icon: <CircleDollarSign className="h-5 w-5" />,
      items: [
        {
          label: "Fee Address",
          value: pool?.feeAddress ? <Address address={pool.feeAddress} /> : "",
          loading: isLoading,
          icon: <CircleDollarSign className="h-4 w-4" />,
          description: "Address that receives collected fees",
        },
        {
          label: "Fee Percentage",
          value: pool?.feePercentage ? `${pool.feePercentage}%` : "",
          loading: isLoading,
          description: "Current fee percentage for swaps",
        },
      ],
    },
    {
      title: "Core Contracts",
      icon: <Settings className="h-5 w-5" />,
      items: [
        {
          label: "Quoter",
          value: pool?.quoter ? <Address address={pool.quoter} /> : "",
          loading: isLoading,
          icon: <Settings className="h-4 w-4" />,
          description: "Price quotation contract for swap calculations",
        },
        {
          label: "Token Registry",
          value: pool?.tokenRegistry ? (
            <Address address={pool.tokenRegistry} />
          ) : (
            ""
          ),
          loading: isLoading,
          icon: <FileCode className="h-4 w-4" />,
          description: "Registry contract managing pool vouchers",
        },
        {
          label: "Token Limiter",
          value: pool?.tokenLimiter ? (
            <Address address={pool.tokenLimiter} />
          ) : (
            ""
          ),
          loading: isLoading,
          icon: <Lock className="h-4 w-4" />,
          description: "Contract enforcing swap limits and restrictions",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Pool Contracts</h2>
        <p className="text-sm text-muted-foreground mt-2">
          View and manage the contracts that make up this swap pool. When transferring pool ownership, all contract ownerships will be transferred together.
        </p>
      </div>

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
                    <div className="break-all text-sm">{item.value || "—"}</div>
                  )}
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
              {section.action && <div className="pt-2">{section.action}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
