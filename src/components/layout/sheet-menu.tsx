import { MenuIcon } from "lucide-react";
import Link from "next/link";

import { Menu } from "~/components/layout/menu";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "~/components/ui/sheet";
import { siteConfig } from "~/config/site";
import { Icons } from "../icons";

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button
            className="flex justify-center items-center pb-2 pt-1 h-[unset]"
            variant="link"
            asChild
          >
            <Link href="/" className="flex flex-col items-center gap-2">
              <Icons.logo prefix="sheet" className="size-16" />
              <h1 className="font-bold text-lg text-wrap">{siteConfig.name}</h1>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
