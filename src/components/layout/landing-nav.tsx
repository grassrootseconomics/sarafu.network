"use client";
import Link from "next/link";

import { NavigationMenuLink, type Root } from "@radix-ui/react-navigation-menu";
import { UserNav } from "./user-nav";

import React from "react";
import { siteConfig } from "~/config/site";
import { cn } from "~/lib/utils";
import { Icons } from "../icons";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";

export function LandingPageNav({
  ...props
}: React.ComponentPropsWithoutRef<typeof Root>) {
  return (
    <div className="mr-4 flex justify-between w-full pt-1/in">
      <Link href="/" className="mr-6 flex items-center lg:space-x-2">
        <Icons.logo
          prefix="main"
          className="size-14 p-2 lg:size-28 mx-4 lg:mx-8 "
        />
        <span className="hidden font-poppins md:inline-block w-28 text-lg lg:text-2xl font-bold tracking-wide	">
          {siteConfig.name}
        </span>
      </Link>
      <NavigationMenu
        className="hidden lg:flex items-center w-full flex-grow my-auto p-1 rounded-lg"
        {...props}
      >
        <NavigationMenuList className="flex flex-grow font-poppins justify-evenly gap-6 lg:gap-12 w-full">
          {siteConfig.mainNav.map((item) => {
            if ("items" in item) {
              return (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuTrigger className="font-normal">
                    {item.title.toUpperCase()}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[1fr_1fr]">
                      {item.items.map((subitem, idx) => {
                        if (typeof subitem.rowSpan === "number") {
                          return (
                            <li
                              key={`${item.title}-${idx}`}
                              style={{
                                gridRow: `span ${subitem.rowSpan}`,
                              }}
                            >
                              <NavigationMenuLink asChild>
                                <a
                                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                  href={subitem.href}
                                >
                                  {subitem.icon}
                                  <div className="mb-2 mt-4 text-lg font-medium">
                                    {subitem.title}
                                  </div>
                                  <p className="text-sm leading-tight text-muted-foreground">
                                    {subitem?.description}
                                  </p>
                                </a>
                              </NavigationMenuLink>
                            </li>
                          );
                        }
                        return (
                          <ListItem
                            key={subitem.title}
                            title={subitem.title}
                            href={subitem.href}
                          >
                            {subitem?.description}
                          </ListItem>
                        );
                      })}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            }
            return (
              <NavigationMenuItem key={item.title}>
                <Link href={item.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(navigationMenuTriggerStyle(), "font-normal")}
                  >
                    {item.title.toUpperCase()}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
      <UserNav />
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
