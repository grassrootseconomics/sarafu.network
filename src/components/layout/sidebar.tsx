"use client";

import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { siteConfig } from "~/config/site";
import { Name } from "~/contracts/react";
import { cn } from "~/lib/utils";
import { Icons } from "../icons";
import { SearchInput } from "../search-input";
import UserGasStatus from "../users/user-gas-status";
import { SidebarNav } from "./sidebar-nav";
import { UserNav } from "./user-nav";

export default function SideBar({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-sidebar-primary-foreground">
                  <Icons.logo prefix="side" className="size-6" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {siteConfig.name}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav items={siteConfig.mainNav} />
        </SidebarContent>
        <SidebarFooter></SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <main
        className={cn(
          "relative flex w-full flex-1 flex-col",
          "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0"
        )}
      >
        <div className="relative shrink flex w-full flex-col p-0 bg-background rounded-xl md:peer-data-[variant=inset]:shadow ">
          <NavHeader />
        </div>
        <UserGasStatus />
        <div className="relative flex w-full flex-1 mt-2 flex-col rounded-xl md:peer-data-[variant=inset]:shadow overflow-clip">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

function generateBreadcrumbs(pathname: string) {
  // Remove trailing slash and split path into segments
  const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);

  return segments.map((segment, index) => {
    // Build the href for this segment
    const href = `/${segments.slice(0, index + 1).join("/")}`;

    // Transform segment into readable label (e.g., "my-page" -> "My Page")
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return { label, href };
  });
}

function NavHeader() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className="flex h-12 w-full shrink-0 items-center px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>
        <div className="flex items-center gap-4">
          <SearchInput />
          <UserNav />
        </div>
      </div>
    </header>
  );
}

const Breadcrumbs = ({
  crumbs,
}: {
  crumbs: { label: string; href?: string }[];
}) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map(({ label, href }, i) => {
          let labelElement: React.ReactNode = label;
          if (label.startsWith("0x")) {
            labelElement = <Name key={i} address={label as `0x${string}`} />;
          }
          return i === crumbs.length - 1 ? (
            <BreadcrumbItem key={i}>
              <BreadcrumbPage>{labelElement}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <Fragment key={i}>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={href}>{labelElement}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
