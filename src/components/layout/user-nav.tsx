"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useBalance, useDisconnect } from "wagmi";
import { useAuth } from "~/hooks/useAuth";
import { truncateEthAddress } from "~/utils/dmr-helpers";
import { Button } from "../ui/button";

import clsx from "clsx";
import { Copy, Fuel, LogOut, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBreakpoint } from "~/hooks/useMediaQuery";
import { GasGiftStatus } from "~/server/enums";
import { toUserUnitsString } from "~/utils/units/token";
import Address from "../address";
import Identicon from "../identicon";
import { Loading } from "../loading";
import { Avatar } from "../ui/avatar";
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
  const isMd = useBreakpoint("md");
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
                    <Button
                      variant="ghost"
                      disabled={
                        connectModalOpen || authenticationStatus === "loading"
                      }
                      onClick={() => openConnectModal && openConnectModal()}
                      className="rounded-full w-full"
                    >
                      {authenticationStatus === "loading" ? (
                        <Loading />
                      ) : (
                        "Connect"
                      )}
                    </Button>
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
                          className="group relative flex items-center space-x-2 rounded-full bg-white px-0 text-sm font-medium text-slate-700 "
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
                          <Avatar className="h-8 w-8 ">
                            <Identicon address={user_address} size={32} />
                          </Avatar>
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
