"use client";
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
      variant="default"
      className="text-xs font-normal px-2 py-0.5 cursor-pointer hover:opacity-80 transition-opacity"
    >
      {tag}
    </Badge>
  );
}
