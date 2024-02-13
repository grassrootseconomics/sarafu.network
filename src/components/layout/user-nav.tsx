import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useBalance, useDisconnect } from "wagmi";
import { useUser } from "~/hooks/useAuth";
import { truncateEthAddress } from "~/utils/dmr-helpers";
import { Button } from "../ui/button";

import { Copy, Fuel, LogOut, Shield, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useScreenType } from "~/hooks/useMediaQuery";
import { GasGiftStatus } from "~/server/enums";
import { toUserUnitsString } from "~/utils/units";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useToast } from "../ui/use-toast";
import { gasBadgeVariant } from "../users/staff-gas-status";
import GasRequestDialog from "../users/dialogs/gas-request-dialog";

export function UserNav() {
  const user = useUser();
  const { isTablet } = useScreenType();
  const toast = useToast();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const balance = useBalance({
    address: user?.account.blockchain_address,
  });
  const handleCopyAddress = () => {
    if (!user?.account.blockchain_address) return;
    navigator.clipboard
      .writeText(user?.account.blockchain_address)
      .then(() => {
        toast.toast({
          title: `Copied!`,
          variant: "default",
        });
      })
      .catch((err: Error) => {
        console.error("Something went wrong", err);
        toast.toast({
          title: `Something went wrong`,
          description: err.message,
          variant: "destructive",
        });
      });
  };
  return (
    <div className="flex items-center justify-end space-x-2">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
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
            >
              {(() => {
                if (!mounted || !account || !chain) {
                  return (
                    <Button
                      variant="ghost"
                      disabled={connectModalOpen}
                      onClick={() => openConnectModal && openConnectModal()}
                      className=" rounded-full"
                    >
                      Connect
                    </Button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <Button
                      variant="destructive"
                      onClick={openChainModal}
                      type="button"
                    >
                      Wrong network
                    </Button>
                  );
                }

                return (
                  <div className="flex space-x-2">
                    {!isTablet && (
                      <Button
                        variant="ghost"
                        onClick={openChainModal}
                        disabled={true}
                        className="flex items-center rounded-full"
                      >
                        {chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 12,
                              height: 12,
                              borderRadius: 999,
                              overflow: "hidden",
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <Image
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl}
                                width={12}
                                height={12}
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="relative rounded-full bg-slate-50"
                        >
                          {account.displayName}
                          {balance.data ? (
                            <span className="ml-2 font-bold">
                              {toUserUnitsString(
                                balance.data.value,
                                balance.data.decimals,
                              )}{" "}
                              CELO
                            </span>
                          ) : (
                            ""
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56"
                        align="end"
                        forceMount
                      >
                        <DropdownMenuLabel className="font-normal flex justify-between items-center">
                          <p className="text-sm font-medium leading-none">
                            {user?.name ?? "Unknown"}
                          </p>
                          {user?.isStaff && (
                            <p className="text-xs py-1 px-2 rounded-sm bg-zinc-950 text-white">
                              {user?.role}
                            </p>
                          )}
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center"
                          onClick={() => {
                            if (user?.gasStatus === GasGiftStatus.NONE) {
                              router.push("/wallet");
                            }
                          }}
                        >
                          <Fuel className="mr-2 h-4 w-4" />
                          <p className="flex-grow">Gas Status</p>
                          {user?.gasStatus && (
                            <Badge
                              variant={
                                gasBadgeVariant[
                                  user.gasStatus as keyof typeof GasGiftStatus
                                ]
                              }
                            >
                              {user.gasStatus}
                            </Badge>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleCopyAddress}>
                          <Copy className="mr-2 h-4 w-4" />
                          <p className="cursor-pointer">
                            {user?.account.blockchain_address
                              ? truncateEthAddress(
                                  user.account.blockchain_address,
                                )
                              : "Connect wallet"}
                          </p>
                        </DropdownMenuItem>
                        {user?.isStaff && (
                          <>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => router.push("/staff")}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Staff Portal
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push("/wallet/profile")}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => disconnect()}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <button onClick={openAccountModal} type="button"></button>
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
