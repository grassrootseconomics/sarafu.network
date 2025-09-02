"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ContentContainer } from "~/components/layout/content-container";
import { Loading } from "~/components/loading";
import { PoolListContainer } from "~/components/pools/pools-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { VoucherListContainer } from "~/components/voucher/voucher-list-container";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";

export const ExplorePage = () => {
  const auth = useAuth();
  const { data: vouchers } = trpc.voucher.list.useQuery({});
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle search input with debounce using refs and timeouts
  const handleSearchInput = useCallback(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (searchInputRef.current) {
        setSearchQuery(searchInputRef.current.value);
      }
    }, 300);
  }, []);

  // Memoize filtered vouchers
  const filteredVouchers = useMemo(() => {
    if (!vouchers || vouchers.length === 0) return [];
    if (!searchQuery) return vouchers;

    const searchLower = searchQuery.toLowerCase();

    return vouchers.filter((voucher) => {
      // Pre-check for empty fields
      if (!voucher.voucher_name && !voucher.location_name && !voucher.symbol) {
        return false;
      }

      // Check each field individually to avoid unnecessary string operations
      return (
        (voucher.voucher_name &&
          voucher.voucher_name.toLowerCase().includes(searchLower)) ||
        (voucher.location_name &&
          voucher.location_name.toLowerCase().includes(searchLower)) ||
        (voucher.symbol && voucher.symbol.toLowerCase().includes(searchLower))
      );
    });
  }, [vouchers, searchQuery]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  if (!auth?.user) {
    return <Loading />;
  }

  return (
    <ContentContainer title="Explore">
      <div className="w-full flex flex-col flex-grow mx-auto px-1 sm:px-2">
        <div className="text-3xl font-semibold pt-4 pb-2 text-center">
          Explore
        </div>
        <div>
          <Tabs defaultValue="vouchers" className="max-h-full ">
            <TabsList className="grid w-fit mx-auto my-2 mb-4 grid-cols-2">
              <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
              <TabsTrigger value="pools">Pools</TabsTrigger>
            </TabsList>
            <TabsContent className="relative" value="vouchers">
              <VoucherListContainer />
            </TabsContent>
            <TabsContent className="" value="pools">
              <PoolListContainer />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ContentContainer>
  );
};
