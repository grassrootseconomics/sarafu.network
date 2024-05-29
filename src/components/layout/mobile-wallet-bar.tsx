import { SearchIcon, UserIcon, WalletIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const NavButton = ({
  children,
  active,
  disabled,
  href,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  href: string;
}) => {
  return (
    <Link className="w-full" href={disabled ? "#" : href}>
      <button
        disabled={disabled}
        className={`${
          active ? "bg-primary/50" : "bg-primary"
        } py-2 w-full pt-4  flex flex-col underline-offset-4 hover:bg-primary/50 text-secondary-foreground  justify-center items-center disabled:pointer-events-none disabled:opacity-50`}
      >
        {children}
      </button>
    </Link>
  );
};
export const NavBar = () => {
  const router = useRouter();

  return (
    <div className="bg-background fixed bottom-0 left-0 w-screen grid grid-cols-3 justify-evenly align-middle items-center z-[40]">
      <NavButton href={"/wallet"} active={router.pathname === "/wallet"}>
        <WalletIcon className="mb-2" size={20} />
        Wallet
      </NavButton>
      <NavButton
        href={"/wallet/explore"}
        active={router.pathname === "/wallet/explore"}
      >
        <SearchIcon className="mb-2" size={20} />
        Explore
      </NavButton>
      <NavButton
        href={"/wallet/profile"}
        active={router.pathname === "/wallet/profile"}
      >
        <UserIcon className="mb-2" size={20} />
        Profile
      </NavButton>
    </div>
  );
};
