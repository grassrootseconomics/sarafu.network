import Link from "next/link";

import { NavigationMenuLink, type Root } from "@radix-ui/react-navigation-menu";

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

export function MainNav({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Root>) {
  return (
    <div className="mr-4 hidden lg:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.logo prefix="main" className="h-8 w-8" />
        <span className="hidden font-bold lg:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <NavigationMenu
        className={cn(
          "hidden md:flex items-center space-x-4 lg:space-x-6",
          className
        )}
        {...props}
      >
        <NavigationMenuList>
          {siteConfig.mainNav.map((item) => {
            if ("items" in item) {
              return (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
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
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {item.title}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
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
