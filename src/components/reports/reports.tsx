"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Authorization } from "~/hooks/useAuth";
import { buttonVariants } from "../ui/button";
import { ReportFilters } from "./report-fIlters";
import { ReportList } from "./report-list";

export function Reports() {
  const [searchTags, setSearchTags] = useState<string[]>([]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-2">
        <ReportFilters searchTags={searchTags} setSearchTags={setSearchTags} />
        <Authorization resource="Reports" action="CREATE">
          <Link href="/reports/create" className={buttonVariants()}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Report
          </Link>
        </Authorization>
      </div>
      <ReportList
        query={{
          tags: searchTags,
          limit: 10,
        }}
      />
    </div>
  );
}
