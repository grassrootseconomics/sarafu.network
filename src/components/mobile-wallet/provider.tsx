import React, { createContext, useContext } from "react";
type MobileWalletContextType = {
  screen: "wallet" | "explore" | "profile";
  setScreen: (screen: MobileWalletContextType["screen"]) => void;
};

const MobileNav = createContext<MobileWalletContextType>({
  screen: "wallet",
  setScreen: () => {},
});

export const MobileNavProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [screen, setScreen] =
    React.useState<MobileWalletContextType["screen"]>("wallet");

  return (
    <MobileNav.Provider value={{ screen, setScreen }}>
      {children}
    </MobileNav.Provider>
  );
};
export const useMobileNav = () => {
  const context = useContext(MobileNav);
  return context;
};  
