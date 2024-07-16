import { SearchIcon } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import { env } from "~/env";
import { api } from "~/utils/api";
import { useContractIndex, useSwapPool } from "./pools/hooks";
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
  const vouchers = api.voucher.list.useQuery(undefined, {});
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
  const { data: pools } = useContractIndex(
    env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS
  );

  return (
    <>
      <div className="flex items-center">
        <Button onClick={() => setOpen(true)} variant={"ghost"}>
          <SearchIcon className="size-4" />
        </Button>
        <p className="text-sm text-muted-foreground">
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
            <CommandItem onSelect={() => router.push("/pools")}>
              Pools
            </CommandItem>
            <CommandItem onSelect={() => router.push("/pools/create")}>
              Create a Pool
            </CommandItem>
            <CommandItem onSelect={() => router.push("/wallet")}>
              Wallet
            </CommandItem>
            <CommandItem onSelect={() => router.push("/vouchers/create")}>
              Create a Voucher
            </CommandItem>
            <CommandItem onSelect={() => router.push("/paper/generate")}>
              Batch Create Accounts
            </CommandItem>
            <CommandItem onSelect={() => router.push("/vouchers")}>
              Vouchers
            </CommandItem>
            <CommandItem onSelect={() => router.push("/wallet/profile")}>
              Profile
            </CommandItem>
            <CommandItem onSelect={() => router.push("/dashboard")}>
              Dashboard
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Vouchers">
            {vouchers.data?.map((voucher, idx) => (
              <CommandItem
                key={idx}
                onSelect={() =>
                  router.push(`/vouchers/${voucher.voucher_address}`)
                }
              >
                {voucher.voucher_name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Pools">
            {pools?.contractAddresses?.map((pool, idx) => (
              <PoolCommandItem key={idx} address={pool} />
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function PoolCommandItem({ address }: { address: `0x${string}` }) {
  const router = useRouter();
  const { data: pool } = useSwapPool(address);
  return (
    <CommandItem onSelect={() => router.push(`/pools/${address}`)}>
      {pool?.name}
    </CommandItem>
  );
}
