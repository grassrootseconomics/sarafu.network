"use client";

import { PlusIcon, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/hooks/useAuth";
import { VoucherList } from "./voucher-list-new";

export function VoucherListContainer() {
  const [searchTerm, setSearchTerm] = useState("");
  const auth = useAuth();

  return (
    <>
      <div className="flex flex-col mt-4 space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4">
        <div className="flex-grow max-w-md">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search vouchers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>

        <div className="flex space-x-2">
          {auth?.user && (
            <Button
              asChild
              size="default"
              className="bg-primary hover:bg-primary-dark text-white font-semibold w-full sm:w-auto"
            >
              <Link
                href="/vouchers/create"
                className="flex items-center justify-center"
              >
                <PlusIcon className="mr-2" size={16} />
                Create Voucher
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <VoucherList searchTerm={searchTerm} />
      </div>
    </>
  );
}
