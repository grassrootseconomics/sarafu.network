import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { useUser } from "~/hooks/useAuth";
import { truncateEthAddress } from "~/utils/dmr-helpers";
import { Button } from "../ui/button";

import { LogOut, Shield, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useScreenType } from "~/hooks/useMediaQuery";
import { GasGiftStatus } from "~/server/enums";
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

export function UserNav() {
  const user = useUser();
  const { isTablet } = useScreenType();
  const toast = useToast();
  const { disconnect } = useDisconnect();
  const router = useRouter();
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
                          {account.displayBalance ? (
                            <span className="ml-2 font-bold">
                              {account.displayBalance}
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
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user?.name ?? "Unknown"}
                            </p>
                            <div className="flex items-center justify-between">
                              <p
                                className="text-xs leading-none 
                                cursor-pointer
                                text-muted-foreground"
                                onClick={handleCopyAddress}
                              >
                                {truncateEthAddress(
                                  user?.account.blockchain_address
                                )}
                              </p>
                              {user?.isStaff && (
                                <p className="text-xs py-1 px-2 rounded-sm bg-slate-50">
                                  {user?.role}
                                </p>
                              )}
                              {user?.gasStatus &&
                                user.gasStatus !== GasGiftStatus.NONE && (
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
                            </div>
                          </div>
                        </DropdownMenuLabel>
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
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => router.push("/wallet/profile")}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
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
