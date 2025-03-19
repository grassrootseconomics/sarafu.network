"use client";
import { TagIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "~/components/ui/badge";

export function ReportTag({ tag }: { tag: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function addTagToFilters(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const params = new URLSearchParams(searchParams.toString());
    const existingTags = params.get("tags")?.split(",").filter(Boolean) || [];

    // Add the new tag if it doesn't already exist
    if (!existingTags.includes(tag)) {
      const newTags = [...existingTags, tag];
      params.set("tags", newTags.join(","));
      router.push(`/reports?${params.toString()}`);
    }
  }

  return (
    <Badge
      onClick={addTagToFilters}
      variant="secondary"
      className="text-xs font-normal px-2 py-0.5 cursor-pointer hover:opacity-80 transition-opacity"
    >
      <TagIcon className="w-3 h-3 mr-1" />
      {tag}
    </Badge>
  );
}
