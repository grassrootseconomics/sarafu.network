import {
  GitHubLogoIcon,
  LinkedInLogoIcon,
  ViewVerticalIcon,
} from "@radix-ui/react-icons";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Button } from "~/components/ui/button"; // Ensure this component is TailwindCSS compatible
import { type SubNavigationGroup, siteConfig } from "~/config/site";
import { Icons } from "../icons";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

export function MobileDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <ViewVerticalIcon className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className="bg-white shadow-xl w-80 h-svh flex-col flex"
        side="left"
      >
        <Link
          href={"/"}
          onClick={() => setOpen(false)}
          className={`flex flex-col items-center p-2 justify-center hover:bg-gray-100 transition-colors duration-150 ease-in-out`}
        >
          <Icons.logo prefix="mobile" className="w-16 h-16" />
          <span className={"mt-2 text-2xl font-bold"}>{siteConfig.name}</span>
        </Link>
        <ScrollArea className="overflow-y-auto py-4">
          {siteConfig.mainNav?.map((item) =>
            "items" in item ? (
              <SubNavigationGroup
                item={item}
                key={item.title}
                onClose={() => setOpen(false)}
              />
            ) : (
              <NavigationLink
                key={item.href}
                href={item.href}
                label={item.title}
                onClick={() => setOpen(false)}
              />
            )
          )}
        </ScrollArea>
        <SocialLinks />
      </SheetContent>
    </Sheet>
  );
}

function NavigationLink({
  href,
  label,
  logo,
  onClick,
}: {
  href: string;
  label: string;
  logo?: React.ReactNode;
  onClick?: () => void;
}) {
  const router = useRouter();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    void router.push(href);
    onClick?.();
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`flex items-center p-2 ${
        logo ? "justify-center" : ""
      } hover:bg-gray-100 transition-colors duration-150 ease-in-out`}
    >
      {logo ? logo : null}
      <span className={`${logo ? "mt-2 text-xl font-bold" : "ml-4 text-base"}`}>
        {label}
      </span>
    </Link>
  );
}

function SubNavigationGroup({
  item,
  onClose,
}: {
  item: SubNavigationGroup;
  onClose: () => void;
}) {
  return (
    <div className="p-2">
      <span className="text-lg font-semibold">{item.title}</span>
      <div className="mt-2 space-y-2">
        {item.items.map((subitem) => (
          <NavigationLink
            key={subitem.title}
            href={subitem.href}
            label={subitem.title}
            onClick={onClose}
          />
        ))}
      </div>
    </div>
  );
}

function SocialLinks() {
  return (
    <div className="pt-4 mx-4 flex justify-between items-center flex-grow mt-auto">
      <a
        href="https://x.com/grassEcon"
        className="text-gray-500 hover:text-gray-700"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icons.x className="w-3 h-3" />
      </a>
      <a
        href="https://github.com/grassrootseconomics"
        className="text-gray-500 hover:text-gray-700"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GitHubLogoIcon className="w-4 h-4" />
      </a>
      <a
        href="https://www.linkedin.com/company/grassecon"
        className="text-gray-500 hover:text-gray-700"
        target="_blank"
        rel="noopener noreferrer"
      >
        <LinkedInLogoIcon className="w-4 h-4" />
      </a>
    </div>
  );
}
