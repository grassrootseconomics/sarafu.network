import { DashboardIcon } from "@radix-ui/react-icons";
import { WalletIcon } from "lucide-react";

type MainNavItem =
  | {
      icon?: React.ReactNode;
      title: string;
      href: string;
    }
  | {
      icon?: React.ReactNode;
      title: string;
      items: SubNavItem[];
    };
type SubNavItem = {
  icon?: React.ReactNode;
  title: string;
  href: string;
  description?: string;
  rowSpan?: number;
};
export const siteConfig: {
  name: string;
  mainNav: MainNavItem[];
} = {
  name: "Sarafu Network",
  mainNav: [
    {
      icon: <WalletIcon size={"15px"} />,
      title: "Wallet",
      href: "/",
    },
    {
      title: "Create",
      href: "/publish",
    },

    {
      title: "Explore",
      items: [
        {
          icon: <DashboardIcon />,
          rowSpan: 3,
          title: "Dashboard",
          href: "/dashboard",
          description: "View Statistics and Analytics of the Sarafu Network",
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
        {
          icon: null,
          title: "Blog",
          href: "https://grassecon.org/category/blog",
          description: "Read about the Sarafu Network",
        },
      ],
    },
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
