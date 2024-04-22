import { MainNav } from "~/components/layout/main-nav";
import { MobileDrawer } from "~/components/layout/mobile-drawer";
import { UserNav } from "./user-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="flex h-14 items-center px-2">
        <MainNav />
        <MobileDrawer />

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center justify-end grow">
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}
