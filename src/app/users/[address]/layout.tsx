import type { ReactNode } from "react";

interface UserProfileLayoutProps {
  children: ReactNode;
}

export default function UserProfileLayout({
  children,
}: UserProfileLayoutProps) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
