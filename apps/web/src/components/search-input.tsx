"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { trpc } from "~/lib/trpc";
import { Button } from "./ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

export function SearchInput() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const vouchers = trpc.voucher.list.useQuery({}, {});
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  const { data: pools } = trpc.pool.list.useQuery({});

  function handleSelect(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <div className="flex items-center">
        <Button onClick={() => setOpen(true)} variant={"ghost"}>
          <SearchIcon className="size-4" />
        </Button>
        <p className="text-sm text-muted-foreground hidden md:block">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </p>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => handleSelect("/pools")}>
              Pools
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/pools/create")}>
              Create a Pool
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/wallet")}>
              Wallet
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/vouchers/create")}>
              Create a Voucher
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/paper/create")}>
              Create Paper Wallet
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/vouchers")}>
              Vouchers
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/wallet/profile")}>
              Profile
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/dashboard")}>
              Dashboard
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Vouchers">
            {vouchers.data?.map((voucher, idx) => (
              <CommandItem
                key={idx}
                onSelect={() =>
                  handleSelect(`/vouchers/${voucher.voucher_address}`)
                }
                className="flex justify-between w-full flex-wrap items-center "
              >
                <span>
                  {voucher.voucher_name}&nbsp;
                  <strong>({voucher.symbol})</strong>
                </span>
                <div className="ml-2 bg-green-300 rounded-md px-2 py-1 text-xs text-black">
                  Voucher
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Pools">
            {pools?.map((pool, idx) => (
              <CommandItem
                key={idx}
                onSelect={() => handleSelect(`/pools/${pool.contract_address}`)}
                className="flex justify-between w-full flex-wrap items-center "
              >
                <span>
                  {pool.pool_name}&nbsp;
                  <strong>({pool.pool_symbol})</strong>
                </span>
                <div className="ml-2 bg-orange-300 rounded-md px-2 py-1 text-xs text-black">
                  Pool
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
