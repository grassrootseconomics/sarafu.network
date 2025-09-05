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
  User,
  Wallet,
} from "lucide-react";
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
    {
      title: "Profile",
      url: "/wallet/profile",
      icon: User,
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
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg overflow-hidden bg-[#B5AF34]">
            <img
              src={"/home/sarafu-logo.png"}
              alt="Sarafu Network Logo"
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
                      className="font-normal hover:font-medium data-[active=true]:font-medium text-[#6A642A] hover:text-[#6A642A] data-[active=true]:text-[#6A642A]"
                    >
                      <item.icon className="size-4 text-[#B5AF34]" />
                      <span className="font-[Lato]">{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-[#B5AF34]" />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navAccount.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="font-normal hover:font-medium text-[#6A642A] hover:text-[#6A642A]"
                    >
                      <item.icon className="size-4 text-[#B5AF34]" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-[#B5AF34]" />

        <SidebarGroup>
          <SidebarGroupLabel>Documentation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navDocumentation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="font-normal hover:font-medium text-[#6A642A] hover:text-[#6A642A]"
                    >
                      <item.icon className="size-4 text-[#B5AF34]" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="bg-[#B5AF34]" />
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="font-normal hover:font-medium text-[#6A642A] hover:text-[#6A642A]"
                    >
                      <item.icon className="size-4 text-[#B5AF34]" />
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
                className="flex items-center justify-center p-2 rounded-md hover:bg-[#B5AF34]/10 transition-colors"
                title={item.name}
              >
                <div className="text-[#B5AF34] size-4">
                  <img src={item.iconHref} alt={item.name} className="size-4" />
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
