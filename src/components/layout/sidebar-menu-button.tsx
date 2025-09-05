"use client";
import { type ComponentProps } from "react";
import {
  SidebarMenuButton as SidebarMenuButtonComponent,
  useSidebar,
} from "~/components/ui/sidebar";

type Props = ComponentProps<typeof SidebarMenuButtonComponent>;

export const SidebarMenuButton = (props: Props) => {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuButtonComponent
      onClick={() => setOpenMobile(false)}
      className="font-normal hover:font-medium data-[active=true]:font-medium text-[#6A642A] hover:text-[#6A642A] data-[active=true]:text-[#6A642A]"
      {...props}
    >
      {props.children}
    </SidebarMenuButtonComponent>
  );
};
