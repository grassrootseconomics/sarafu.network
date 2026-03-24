"use client";

import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  Share2,
  Store,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { type DeployResult } from "./provider";

interface SuccessScreenProps {
  result: DeployResult;
  onClearDraft?: () => void;
}

const checklist = [
  "Offer listed on marketplace",
  "Voucher published on network",
  "Pool/account ready to accept payments",
];

const nextActions = [
  {
    icon: Share2,
    title: "Share Your Shop",
    description:
      "Get the word out! Share a link to your voucher so people can buy and redeem your offers.",
    getHref: (address: string) => `/vouchers/${address}`,
  },
  {
    icon: ArrowLeftRight,
    title: "Accept other shops' credits",
    description:
      "See what other shops are offering and start trading vouchers.",
    getHref: () => "/dashboard",
  },
  {
    icon: Store,
    title: "Go to your shop",
    description: "Customize your setup and manage your voucher.",
    getHref: (address: string) => `/vouchers/${address}`,
  },
];

export function SuccessScreen({ result, onClearDraft }: SuccessScreenProps) {
  useEffect(() => {
    onClearDraft?.();
  }, [onClearDraft]);

  return (
    <div className="w-full max-w-lg mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <Trophy className="size-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Your voucher is live!
        </h1>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Voucher</span>
            <span className="font-medium">{result.voucherName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Currency</span>
            <span className="font-medium">{result.currency}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">First offer</span>
            <span className="font-medium">{result.offerName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <div className="space-y-3">
        {checklist.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-green-600 shrink-0" />
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        People can now buy your voucher and redeem it for your offers.
      </p>

      {/* Next Actions */}
      <div className="space-y-3">
        {nextActions.map((action) => (
          <Link key={action.title} href={action.getHref(result.address)}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <action.icon className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
