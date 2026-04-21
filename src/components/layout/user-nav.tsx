"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useQueryClient } from "@tanstack/react-query";
import { connect, disconnect, getAccount, signMessage } from "@wagmi/core";
import { useState } from "react";
import { useBalance, useConnectors, useDisconnect } from "wagmi";
import { createSiweAdapter } from "~/config/siwe";
import { config } from "~/config/wagmi.config.client";
import { useAuth } from "~/hooks/use-auth";
import { truncateEthAddress } from "~/utils/dmr-helpers";
import { Button } from "../ui/button";

import clsx from "clsx";
import { Copy, Fuel, LogOut, Shield, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBreakpoint } from "~/hooks/use-media-query";
import { GasGiftStatus } from "~/server/enums";
import { toUserUnitsString } from "~/utils/units/token";
import Address from "../address";
import Identicon from "../identicon";
import { Loading } from "../loading";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { gasBadgeVariant } from "../users/staff-gas-status";
export function UserNav() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const isMd = useBreakpoint("md");
  const [isPaperLoginPending, setIsPaperLoginPending] = useState(false);
  const connectors = useConnectors();
  const { disconnectAsync } = useDisconnect();
  const router = useRouter();
  const user_address = auth?.session?.address;
  const balance = useBalance({
    address: user_address,
  });
  const handleDisconnect = () => {
    disconnectAsync()
      .then(() => {
        console.log("Disconnected");
      })
      .catch((err: Error) => {
        console.error("Something went wrong", err);
        toast.error(err.message);
      });
  };
  const handleCopyAddress = () => {
    if (!user_address) return;
    navigator.clipboard
      .writeText(user_address)
      .then(() => {
        toast.success("Copied!");
      })
      .catch((err: Error) => {
        console.error("Something went wrong", err);
        toast.error(err.message);
      });
  };
  const handlePaperLogin = async (openConnectModal?: () => void) => {
    const paperConnector = connectors.find(
      (connector) => connector.id === "paperConnector"
    );
    setIsPaperLoginPending(true);
    try {
      if (paperConnector) {
        let accountAddress: `0x${string}` | undefined;
        let chainId: number | undefined;
        const activeAccount = getAccount(config);

        if (activeAccount.status === "connected") {
          if (activeAccount.connector?.id !== paperConnector.id) {
            await disconnect(config);
            const connection = await connect(config, {
              connector: paperConnector,
            });
            const firstAccount = connection.accounts[0] as
              | `0x${string}`
              | { address: `0x${string}` }
              | undefined;
            accountAddress =
              typeof firstAccount === "string"
                ? firstAccount
                : firstAccount?.address;
            chainId = connection.chainId;
          } else {
            accountAddress = activeAccount.address;
            chainId = activeAccount.chainId;
          }
        } else {
          const connection = await connect(config, { connector: paperConnector });
          const firstAccount = connection.accounts[0] as
            | `0x${string}`
            | { address: `0x${string}` }
            | undefined;
          accountAddress =
            typeof firstAccount === "string"
              ? firstAccount
              : firstAccount?.address;
          chainId = connection.chainId;
        }

        if (!accountAddress || !chainId) {
          throw new Error("Paper Wallet connected but no account was found");
        }

        const siweAdapter = createSiweAdapter(queryClient);
        const nonce = await siweAdapter.getNonce();
        const message = siweAdapter.createMessage({
          address: accountAddress,
          chainId,
          nonce,
        });

        const signature = await signMessage(config, { message });

        const isVerified = await siweAdapter.verify({ message, signature });
        if (!isVerified) {
          throw new Error("Authentication failed");
        }
        return;
      }
      openConnectModal?.();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to connect with Paper Wallet";
      if (!message.toLowerCase().includes("cancel")) {
        console.error("Failed to connect with Paper Wallet", err);
        toast.error(message);
      }
    } finally {
      setIsPaperLoginPending(false);
    }
  };
  return (
    <div className="flex items-center justify-end space-x-2 font-family-poppins">
      <ConnectButton.Custom>
        {({
          chain,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          connectModalOpen,
          mounted,
        }) => {
          return (
            <div
              {...(!mounted && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
              className="w-full"
            >
              {(() => {
                if (!mounted || !auth?.account || !chain) {
                  return (
                    <div className="flex w-full items-center justify-end gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full whitespace-nowrap"
                        disabled={
                          connectModalOpen ||
                          authenticationStatus === "loading" ||
                          isPaperLoginPending
                        }
                        onClick={() => void handlePaperLogin(openConnectModal)}
                      >
                        {isPaperLoginPending ? <Loading /> : "Login"}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="rounded-full whitespace-nowrap border border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                        asChild
                      >
                        <Link href="/paper/create">Sign-up</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={
                          connectModalOpen ||
                          authenticationStatus === "loading" ||
                          isPaperLoginPending
                        }
                        onClick={() => openConnectModal && openConnectModal()}
                        className="rounded-full whitespace-nowrap"
                      >
                        {authenticationStatus === "loading" ? (
                          <Loading />
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    </div>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <Button
                      variant="destructive"
                      onClick={openChainModal}
                      type="button"
                      className="rounded-full w-full"
                    >
                      Wrong network
                    </Button>
                  );
                }

                return (
                  <div className="flex space-x-2 w-full">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="group relative flex items-center space-x-2 rounded-full bg-white px-0 pl-2 text-sm font-medium text-slate-700 "
                        >
                          {isMd.isAboveMd && (
                            <div className="flex items-center space-x-2 pl-2">
                              <span className={clsx("truncate")}>
                                {auth?.session?.user?.given_names}
                              </span>
                              {balance.data && (
                                <span
                                  className={clsx(
                                    "truncate pr-2 text-muted-foreground/80"
                                  )}
                                >
                                  {toUserUnitsString(
                                    balance.data.value,
                                    balance.data.decimals
                                  )}{" "}
                                  {balance.data.symbol}
                                </span>
                              )}
                            </div>
                          )}
                          <Identicon address={user_address} size={28} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56"
                        align="center"
                        forceMount
                      >
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {auth?.session?.user?.given_names}
                            </p>
                            <p className="text-xs leading-none text-slate-600">
                              <Address address={user_address} forceTruncate />
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex cursor-pointer items-center"
                          onClick={() => {
                            if (auth?.gasStatus === GasGiftStatus.NONE) {
                              void router.push("/wallet");
                            }
                          }}
                        >
                          <Fuel className="mr-2 h-4 w-4" />
                          <span>Gas</span>
                          {auth?.gasStatus && (
                            <Badge
                              variant={gasBadgeVariant[auth.gasStatus]}
                              className="ml-auto"
                            >
                              {auth?.gasStatus}
                            </Badge>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex cursor-pointer items-center"
                          onClick={handleCopyAddress}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          <span>
                            {user_address
                              ? truncateEthAddress(user_address)
                              : "Connect wallet"}
                          </span>
                        </DropdownMenuItem>
                        {auth?.isStaff && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="flex cursor-pointer items-center"
                              onClick={() => router.push("/staff")}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Staff Portal</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex cursor-pointer items-center"
                          onClick={() => router.push("/wallet/profile")}
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex cursor-pointer items-center"
                          onClick={() => handleDisconnect()}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}
