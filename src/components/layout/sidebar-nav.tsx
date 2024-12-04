"use client";

import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { type NavItem } from "~/config/site";
import { useAuth } from "~/hooks/useAuth";

export function SidebarNav({ items }: { items: NavItem[] }) {
  const auth = useAuth();

  return (
    <>
      {items.map((item, index) => {
        if (item.authOnly && !auth?.user) return null;
        return (
          <SidebarGroup key={index}>
            {item.title && <SidebarGroupLabel>{item.title}</SidebarGroupLabel>}
            <SidebarMenu>
              {"items" in item ? (
                item.items.map((subItem, subIndex) => (
                  <SidebarMenuItem
                    key={subIndex}
                    className="flex justify-between items-center"
                  >
                    <SidebarMenuButton asChild>
                      <Link href={subItem.href}>
                        {subItem.icon}
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {subItem.action}
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
}
