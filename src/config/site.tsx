import {
  BookOpen,
  ChartNetwork,
  FolderCode,
  Home,
  LayoutDashboard,
  MapIcon,
  Newspaper,
  Plus,
  User,
  Wallet2,
} from "lucide-react";
import { Icons } from "~/components/icons";

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
  action?: NavAction;
};

type NavAction = {
  icon: React.ReactNode;
  href: string;
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
          icon: <MapIcon size={18} />,
          title: "Map",
          href: "/map",
        },
        {
          icon: <ChartNetwork size={16} />,
          title: "Visualization",
          href: "https://viz.sarafu.network/",
        },
        {
          icon: <Icons.vouchers size={24} />,
          title: "Vouchers",
          href: "/vouchers",
          action: {
            href: "/vouchers/create",
            icon: <Plus size={14} />,
          },
        },
        {
          icon: <Icons.pools size={16} />,
          title: "Pools",
          href: "/pools",
          action: {
            icon: <Plus size={14} />,
            href: "/pools/create",
          },
        },
        {
          icon: <Icons.reports size={16} />,
          title: "Reports",
          href: "/reports",
          action: {
            icon: <Plus size={14} />,
            href: "/reports/create",
          },
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
