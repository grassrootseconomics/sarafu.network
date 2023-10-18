"use client";

import {
  GitHubLogoIcon,
  LinkedInLogoIcon,
  ViewVerticalIcon,
} from "@radix-ui/react-icons";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { siteConfig } from "~/config/site";
import { cn } from "~/lib/utils";

export function MobileDrawer() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <ViewVerticalIcon className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <MobileLink
          href="/"
          className="flex items-center flex-col mr-7"
          onOpenChange={setOpen}
        >
          <Icons.logo prefix="mobile" className="h-[60px] w-[60px] m-2" />

          <span className="text-2xl font-bold">{siteConfig.name}</span>
        </MobileLink>
        <ScrollArea className="mt-6 mb-4 h-[calc(100vh-14rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {siteConfig.mainNav?.map((item) => {
              if ("items" in item) {
                return (
                  <div className="flex flex-col space-y-3" key={item.title}>
                    <div className="text-base font-medium">{item.title}</div>
                    {item.items.map((subitem) => {
                      return (
                        <MobileLink
                          key={subitem.title}
                          href={subitem.href}
                          className="flex items-center space-x-2 ml-2 text-base font-light"
                          onOpenChange={setOpen}
                        >
                          {subitem.title}
                        </MobileLink>
                      );
                    })}
                  </div>
                );
              }
              return (
                <div className="flex space-x-2 items-center" key={item.href}>
                  <div className="min-w-[15px]">{item?.icon}</div>
                  <MobileLink
                    key={item.href}
                    href={item.href}
                    className="text-base font-medium"
                    onOpenChange={setOpen}
                  >
                    {item.title}
                  </MobileLink>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="flex mt-4 relative left-[-24px] justify-evenly items-center">
          <a
            href="https://x.com/grassEcon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icons.x className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/grassrootseconomics"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubLogoIcon className="h-6 w-6" />
          </a>
          <a
            href="https://www.linkedin.com/company/grassecon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInLogoIcon className="h-6 w-6" />
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  href: string;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
}
