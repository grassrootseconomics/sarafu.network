import { type ReactNode } from "react";

// Root layout that will be handled by the middleware
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
