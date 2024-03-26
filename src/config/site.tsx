import { DashboardIcon } from "@radix-ui/react-icons";
import { WalletIcon } from "lucide-react";
import { Icons } from "~/components/icons";

export type NavItem = MainNavItem | SubNavigationGroup;
export type MainNavItem = {
  icon?: React.ReactNode;
  title: string;
  href: string;
};

export type SubNavigationGroup = {
  icon?: React.ReactNode;
  title: string;
  items: SubNavItem[];
};
export type SubNavItem = {
  icon?: React.ReactNode;
  title: string;
  href: string;
  description?: string;
  rowSpan?: number;
};
export const siteConfig: {
  name: string;
  mainNav: NavItem[];
} = {
  name: "Sarafu Network",
  mainNav: [
    {
      icon: <WalletIcon size={"15px"} />,
      title: "Wallet",
      href: "/",
    },
    {
      icon: <DashboardIcon />,
      title: "Dashboard",
      href: "/dashboard",
      // description: "View Statistics and Analytics of the Sarafu Network",
    },
    {
      icon: null,
      title: "Blog",
      href: "https://grassecon.org/category/blog",
    },
    {
      title: "Vouchers",
      icon: <Icons.logo prefix="side" width={15} height={15} />,

      items: [
        {
          icon: <DashboardIcon />,
          rowSpan: 3,
          title: "Create",
          href: "/publish",
          description: "Create your own community vouchers",
        },
        {
          icon: null,
          title: "Vouchers",
          href: "/vouchers",
          description: "Explore community vouchers",
        },
        {
          icon: null,
          title: "Visualization",
          href: "https://viz.sarafu.network/",
          description: "View the Sarafu Network in 3D",
        },
      ],
    },
    // {
    //   title: "Pools",
    //   icon: <Icons.logo prefix="side" width={15} height={15} />,
    //   items: [
    //     {
    //       title: "Create",
    //       href: "/pool/create",
    //       description: "Create your own swap pool",
    //     },
    //     {
    //       icon: null,
    //       title: "Pools",
    //       href: "/pools",
    //       description: "Explore swap pools",
    //     },
    //   ],
    // },

    {
      icon: null,
      title: "Documentation",
      items: [
        {
          title: "Grassroots Economics",
          href: "https://docs.grassecon.org/",
          description: "Learn about Grassroots Economics",
        },
        {
          title: "Software",
          href: "https://cic-stack.grassecon.org/",
          description: "Learn about the software behind the Sarafu Network",
        },
      ],
    },
  ],
};
