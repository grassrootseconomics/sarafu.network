import {
  BarChart3,
  Code,
  Eye,
  FileText,
  Home,
  Info,
  Map,
  Rss,
  ToolCase,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { SocialLinks } from "~/config/site";
import { Icons } from "../icons";
import { SearchInput } from "../search-input";
import UserGasStatus from "../users/user-gas-status";
import { SidebarMenuButton } from "./sidebar-menu-button";
import { UserNav } from "./user-nav";
// Navigation data
const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Map",
      url: "/map",
      icon: Map,
    },
    {
      title: "Visualizations",
      url: "https://viz.sarafu.network",
      icon: Eye,
    },
    {
      title: "Vouchers",
      url: "/vouchers",
      icon: Icons.vouchers,
    },
    // {
    //   title: "Marketplace",
    //   url: "/marketplace",
    //   icon: ShoppingCart,
    // },
    {
      title: "Pools",
      url: "/pools",
      icon: Icons.pools,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileText,
    },
  ],
  navAccount: [
    {
      title: "Wallet",
      url: "/wallet",
      icon: Wallet,
    },
  ],
  navDocumentation: [
    {
      title: "About",
      url: "https://docs.grassecon.org/",
      icon: Info,
    },
    {
      title: "Software",
      url: "https://cic-stack.grassecon.org/",
      icon: Code,
    },
    {
      title: "Blog",
      url: "https://grassecon.substack.com",
      icon: Rss,
    },
  ],
  navTools: [
    {
      icon: ToolCase,
      title: "Paper Wallet",
      url: "/paper/create",
    },
  ],
};

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg overflow-hidden bg-[#9CA332]">
            <Image
              src="/home/sarafu-logo.png"
              alt="Sarafu Network Logo"
              width={30}
              height={30}
              className="w-3/4 h-3/4 object-contain transform rotate-45 filter brightness-0 invert"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold font-[Taviraj]">
              Sarafu Network
            </span>
            <span className="truncate text-xs text-muted-foreground"></span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={false}
                      className="font-normal hover:font-medium data-[active=true]:font-medium text-[#69631F] hover:text-[#69631F] data-[active=true]:text-[#69631F]"
                    >
                      <item.icon className="size-4 text-[#69631F]" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-[#9CA332]" />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navAccount.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="font-normal hover:font-medium text-[#69631F] hover:text-[#69631F]"
                    >
                      <item.icon className="size-4 text-[#69631F]" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-[#9CA332]" />

        <SidebarGroup>
          <SidebarGroupLabel>Documentation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navDocumentation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="font-normal hover:font-medium text-[#69631F] hover:text-[#69631F]"
                    >
                      <item.icon className="size-4 text-[#69631F]" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="bg-[#9CA332]" />
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="font-normal hover:font-medium text-[#69631F] hover:text-[#69631F]"
                    >
                      <item.icon className="size-4 text-[#69631F]" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <div className="flex items-center justify-center gap-2 px-2 py-1">
            {SocialLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 rounded-md hover:bg-[#9CA332]/10 transition-colors"
                title={item.name}
              >
                <div className="text-[#69631F] size-4">
                  <Image src={item.iconHref} alt={item.name} width={16} height={16} className="size-4" />
                </div>
              </Link>
            ))}
          </div>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-border mx-2" />

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <SearchInput />
        </div>
      </div>

      {/* Header Actions */}
      <div className="ml-auto flex items-center gap-2 px-4">
        {/* Notifications */}
        {/* <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs"
          >
            3
          </Badge>
        </Button> */}

        {/* Profile Dropdown */}
        <UserNav />
      </div>
    </header>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gradient-to-br from-background to-[#FBDB99]/20">
        <AppHeader />
        <UserGasStatus />
        <div className="flex flex-1 flex-col gap-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
