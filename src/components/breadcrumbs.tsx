"use client";

import Link from "next/link";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

const ITEMS_TO_DISPLAY = 3;

export function BreadcrumbResponsive({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.slice(-ITEMS_TO_DISPLAY + 1).map((item, index) =>
          item.href ? (
            <Fragment key={`bread-${index}`}>
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="max-w-20 truncate md:max-w-none"
                >
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />
            </Fragment>
          ) : (
            <BreadcrumbItem key={`bread-${index}`}>
              <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                {item.label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          )
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
