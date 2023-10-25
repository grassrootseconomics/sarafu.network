import { SearchIcon, UserIcon, WalletIcon } from "lucide-react";
import { useMobileNav } from "./provider";

const NavButton = ({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`${
        active ? "bg-slate-200" : "bg-slate-100"
      } rounded-sm w-[33%] py-2 pt-4  flex flex-col text-primary underline-offset-4 hover:bg-slate-200 justify-center items-center disabled:pointer-events-none disabled:opacity-50`}
    >
      {children}
    </button>
  );
};
export const NavBar = () => {
  const { screen, setScreen } = useMobileNav();
  return (
    <div className="bg-slate-100 fixed bottom-0 left-0 w-screen flex justify-evenly align-middle items-center">
      <NavButton
        onClick={() => setScreen("wallet")}
        active={screen === "wallet"}
      >
        <WalletIcon className="mb-2" size={20} />
        Wallet
      </NavButton>
      <NavButton
        onClick={() => setScreen("explore")}
        active={screen === "explore"}
      >
        <SearchIcon className="mb-2" size={20} />
        Explore
      </NavButton>
      <NavButton
        onClick={() => setScreen("profile")}
        active={screen === "profile"}
      >
        <UserIcon className="mb-2" size={20} />
        Profile
      </NavButton>
    </div>
  );
};
