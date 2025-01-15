"use client";

import { useState } from "react";
import { ReportFilters } from "./report-fIlters";
import { ReportList } from "./report-list";

export function Reports() {
  const [searchTags, setSearchTags] = useState<string[]>([]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <ReportFilters searchTags={searchTags} setSearchTags={setSearchTags} />
      </div>
      <ReportList
        query={{
          tags: searchTags,
        }}
      />
    </div>
  );
}
