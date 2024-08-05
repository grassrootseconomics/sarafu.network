import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useBalance, useDisconnect } from "wagmi";
import { useAuth } from "~/hooks/useAuth";
import { truncateEthAddress } from "~/utils/dmr-helpers";
import { Button } from "../ui/button";

import { Copy, Fuel, LogOut, Shield, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useScreenType } from "~/hooks/useMediaQuery";
import { GasGiftStatus } from "@grassroots/db/enums";
import { toUserUnitsString } from "~/utils/units";
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
  const { isTablet, isMobile } = useScreenType();
  const { disconnectAsync } = useDisconnect();
  const router = useRouter();
  const balance = useBalance({
    address: auth?.user?.account.blockchain_address,
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
    if (!auth?.user?.account.blockchain_address) return;
    navigator.clipboard
      .writeText(auth?.user?.account.blockchain_address)
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
          account,
          chain,
          openAccountModal,
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
                      className=" rounded-full"
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
                          {(!isMobile && auth?.user?.name) ??
                            account?.displayName}
                          {balance.data ? (
                            <span className="ml-2 font-bold">
                              {toUserUnitsString(
                                balance.data.value,
                                balance.data.decimals
                              )}{" "}
                              {balance.data.symbol}
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
                            {auth?.user?.name ?? "Unknown"}
                          </p>
                          {auth?.isStaff && (
                            <p className="text-xs py-1 px-2 rounded-sm bg-zinc-950 text-white">
                              {auth?.user?.role}
                            </p>
                          )}
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center"
                          onClick={() => {
                            if (auth?.gasStatus === GasGiftStatus.NONE) {
                              void router.push("/wallet");
                            }
                          }}
                        >
                          <Fuel className="mr-2 h-4 w-4" />
                          <p className="flex-grow">Gas Status</p>
                          {auth?.gasStatus && (
                            <Badge variant={gasBadgeVariant[auth.gasStatus]}>
                              {auth?.gasStatus}
                            </Badge>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleCopyAddress}>
                          <Copy className="mr-2 h-4 w-4" />
                          <p className="cursor-pointer">
                            {auth?.user?.account.blockchain_address
                              ? truncateEthAddress(
                                  auth?.user.account.blockchain_address
                                )
                              : "Connect wallet"}
                          </p>
                        </DropdownMenuItem>
                        {auth?.isStaff && (
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
                        <DropdownMenuItem onClick={() => handleDisconnect()}>
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
