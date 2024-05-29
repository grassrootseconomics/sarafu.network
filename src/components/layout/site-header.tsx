import { MainNav } from "~/components/layout/new-main-nav";
import { MobileDrawer } from "~/components/layout/mobile-drawer";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full ">
      <div className="flex items-center px-2">
        <MainNav />
        <MobileDrawer />
      </div>
    </header>
  );
}
