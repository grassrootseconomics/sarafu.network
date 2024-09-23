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
          active ? "bg-primary text-white" : "bg-white text-primary"
        } py-3 w-full flex flex-col items-center justify-center transition-colors duration-200 ease-in-out hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {children}
      </button>
    </Link>
  );
};

export const WalletNavBar = () => {
  const router = useRouter();

  return (
    <nav className="bg-background fixed bottom-0 left-0 w-full grid grid-cols-3 shadow-lg border-t border-gray-200 z-[40]">
      <NavButton href="/wallet" active={router.pathname === "/wallet"}>
        <WalletIcon className="mb-1" size={24} />
        <span className="text-xs font-medium">Wallet</span>
      </NavButton>
      <NavButton
        href="/wallet/explore"
        active={router.pathname === "/wallet/explore"}
      >
        <SearchIcon className="mb-1" size={24} />
        <span className="text-xs font-medium">Explore</span>
      </NavButton>
      <NavButton
        href="/wallet/profile"
        active={router.pathname === "/wallet/profile"}
      >
        <UserIcon className="mb-1" size={24} />
        <span className="text-xs font-medium">Profile</span>
      </NavButton>
    </nav>
  );
};
