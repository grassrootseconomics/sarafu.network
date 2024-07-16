import React from "react";
import { SheetMenu } from "~/components/layout/sheet-menu";
import { UserNav } from "~/components/layout/user-nav";
import { SearchInput } from "../search-input";

interface NavbarProps {
  title: string;
  Icon?: React.ElementType;
}

export function Navbar({ title, Icon }: NavbarProps) {
  return (
    <header className="z-10 supports-backdrop-blur:bg-background/60 sticky top-0 w-full bg-background/95 backdrop-blur max-w-[100vw]">
      <div className="mx-4 sm:mx-8 flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4 lg:space-x-0 ">
          <SheetMenu />
          {Icon && <Icon className="h-8 w-8" />}
          <h1 className="font-bold">{title}</h1>
        </div>
        <div className="flex items-center space-x-2 justify-end">
          <SearchInput />
          <div className="flex flex-1 items-center space-x-2 justify-end">
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}
