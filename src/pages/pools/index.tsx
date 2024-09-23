import { ChevronDown, PlusIcon, Search, X } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { Icons } from "~/components/icons";
import { ContentContainer } from "~/components/layout/content-container";
import { PoolList } from "~/components/pools/pool-list";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { api } from "~/utils/api";

export default function PoolsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const { data: tags } = api.tags.list.useQuery();

  const toggleTag = (tag: string) => {
    setSearchTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  return (
    <ContentContainer title="Swap Pools" Icon={Icons.pools}>
      <Head>
        <title>Swap Pools</title>
        <meta
          name="description"
          content="Explore and join swap pools available on the network."
          key="desc"
        />
        <meta property="og:title" content="Swap Pools" />
        <meta
          property="og:description"
          content="Explore and join swap pools available on the network."
        />
      </Head>

      <BreadcrumbResponsive
        items={[{ label: "Home", href: "/" }, { label: "Pools" }]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4">
          <div className="flex-grow max-w-md">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search pools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Tags</h4>
                    <p className="text-sm text-muted-foreground">
                      Select tags to filter pools
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

            <Button
              asChild
              size="default"
              className="bg-primary hover:bg-primary-dark text-white font-semibold w-full sm:w-auto"
            >
              <Link href="/pools/create" className="flex items-center justify-center">
                <PlusIcon className="mr-2" size={16} />
                Create Pool
              </Link>
            </Button>
          </div>
        </div>

        {searchTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center">
                {tag}
                <X
                  size={14}
                  className="ml-1 cursor-pointer"
                  onClick={() => toggleTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-8">
          <PoolList searchTerm={searchTerm} searchTags={searchTags} />
        </div>
      </div>
    </ContentContainer>
  );
}
