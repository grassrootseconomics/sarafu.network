import { type IconProps } from "@radix-ui/react-icons/dist/types";
import { LayoutGrid, Settings, Wallet, type LucideIcon } from "lucide-react";
import { Icons } from "../icons";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: React.FC<IconProps> | LucideIcon;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname?.includes("/dashboard"),
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "",
          label: "Vouchers",
          active: pathname?.includes("/vouchers"),
          icon: Icons.vouchers,
          submenus: [
            {
              href: "/vouchers",
              label: "All Vouchers",
              active: pathname === "/vouchers",
            },
            {
              href: "/vouchers/create",
              label: "Create your Own",
              active: pathname === "/vouchers/create",
            },
          ],
        },
        {
          href: "/pools",
          label: "Pools",
          active: pathname?.includes("/pools"),
          icon: Icons.pools,
          submenus: [],
        },
        {
          href: "/wallet",
          label: "Wallet",
          active: pathname === "/wallet",
          icon: Wallet,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/wallet/profile",
          label: "Profile",
          active: pathname?.includes("//wallet/profile"),
          icon: Settings,
          submenus: [],
        },
      ],
    },
  ];
}
