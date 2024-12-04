"use client";

import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  useSidebar,
} from "~/components/ui/sidebar";
import { type NavItem } from "~/config/site";
import { useAuth } from "~/hooks/useAuth";

export function SidebarNav({ items }: { items: NavItem[] }) {
  const auth = useAuth();
  const { setOpenMobile } = useSidebar();
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
                      <Link
                        href={subItem.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        {subItem.icon}
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {subItem.action && (
                      <SidebarMenuSubButton asChild size="sm">
                        <Link
                          href={subItem.action.href}
                          onClick={() => setOpenMobile(false)}
                        >
                          {subItem.action.icon}
                        </Link>
                      </SidebarMenuSubButton>
                    )}
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href} onClick={() => setOpenMobile(false)}>
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
