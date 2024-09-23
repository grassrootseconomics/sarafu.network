import { type IconProps } from "@radix-ui/react-icons/dist/types";
import { LayoutGrid, Settings, Wallet, type LucideIcon } from "lucide-react";
import { type AuthContextType } from "~/hooks/useAuth";
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

export function getMenuList(
  pathname: string | null,
  auth: AuthContextType | null
): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname?.includes("/dashboard") ?? false,
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
          active: pathname?.includes("/vouchers") ?? false,
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
          active: pathname?.includes("/pools") ?? false,
          icon: Icons.pools,
          submenus: [
            {
              href: "/pools",
              label: "All Pools",
              active: pathname === "/pools",
            },
            {
              href: "/pools/create",
              label: "Create your Own",
              active: pathname === "/pools/create",
            },
          ],
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
    auth?.user
      ? {
          groupLabel: "Settings",
          menus: [
            {
              href: "/wallet/profile",
              label: "Profile",
              active: pathname?.includes("/wallet/profile") ?? false,
              icon: Settings,
              submenus: [],
            },
          ],
        }
      : {
          groupLabel: "",
          menus: [],
        },
  ];
}
