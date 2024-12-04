import {
  BookOpen,
  ChartNetwork,
  FolderCode,
  Home,
  LayoutDashboard,
  Newspaper,
  Plus,
  User,
  Wallet2,
} from "lucide-react";
import Link from "next/link";
import { Icons } from "~/components/icons";
import { SidebarMenuSubButton } from "~/components/ui/sidebar";

export type NavItem = MainNavItem | SubNavigationGroup;

export type MainNavItem = {
  icon?: React.ReactNode;
  title?: string;
  href: string;
  authOnly?: boolean;
};

export type SubNavigationGroup = {
  icon?: React.ReactNode;
  title?: string;
  items: SubNavItem[];
  authOnly?: boolean;
};

export type SubNavItem = {
  icon?: React.ReactNode;
  title: string;
  href: string;
  description?: string;
  action?: React.ReactNode;
};

const siteConfig: {
  name: string;
  mainNav: NavItem[];
} = {
  name: "Sarafu Network",
  mainNav: [
    {
      items: [
        {
          icon: <Home size={18} />,
          title: "Home",
          href: "/",
        },
        {
          icon: <LayoutDashboard size={18} />,
          title: "Dashboard",
          href: "/dashboard",
        },
        {
          icon: <ChartNetwork size={16} />,
          title: "Visualization",
          href: "https://viz.sarafu.network/",
        },
        {
          icon: <Icons.vouchers size={18} />,
          title: "Vouchers",
          href: "/vouchers",
          action: (
            <SidebarMenuSubButton asChild size="sm">
              <Link href="/vouchers/create">
                <Plus size={14} />
              </Link>
            </SidebarMenuSubButton>
          ),
        },
        {
          icon: <Icons.pools size={16} />,
          title: "Pools",
          href: "/pools",
          action: (
            <SidebarMenuSubButton asChild size="sm">
              <Link href="/pools/create">
                <Plus size={14} />
              </Link>
            </SidebarMenuSubButton>
          ),
        },
      ],
    },
    {
      authOnly: true,
      title: "Account",
      items: [
        {
          icon: <Wallet2 size={16} />,
          title: "Wallet",
          href: "/wallet",
        },
        {
          icon: <User size={16} />,
          title: "Profile",
          href: "/wallet/profile",
        },
      ],
    },

    {
      icon: <BookOpen size={18} />,
      title: "Documentation",
      items: [
        {
          icon: <BookOpen size={18} />,
          title: "About",
          href: "https://docs.grassecon.org/",
          description: "Learn about Grassroots Economics",
        },
        {
          icon: <FolderCode size={16} />,
          title: "Software",
          href: "https://cic-stack.grassecon.org/",
          description: "Explore the Sarafu Network software",
        },
        {
          icon: <Newspaper size={18} />,
          title: "Blog",
          href: "https://grassecon.org/category/blog",
        },
      ],
    },
  ],
};

export { siteConfig };
