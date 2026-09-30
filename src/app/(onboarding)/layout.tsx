export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-[calc(100svh_-_var(--migration-banner-height))] bg-gradient-to-br from-background to-[#FBDB99]/20">
      {children}
    </div>
  );
}
