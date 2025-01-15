import { ChevronDown } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { trpc } from "~/lib/trpc";

interface ReportFiltersProps {
  searchTags: string[];
  setSearchTags: Dispatch<SetStateAction<string[]>>;
}

export function ReportFilters({
  searchTags,
  setSearchTags,
}: ReportFiltersProps) {
  const { data: tags } = trpc.tags.list.useQuery();

  function toggleTag(tag: string) {
    setSearchTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  }

  return (
    <div className="flex justify-end w-full py-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto mt-2">
            Filter
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Tags</h4>
              <p className="text-sm text-muted-foreground">
                Select tags to filter Reports
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag) => (
                <Badge
                  key={tag.id}
                  onClick={() => toggleTag(tag.tag)}
                  variant={searchTags.includes(tag.tag) ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {tag.tag}
                </Badge>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
