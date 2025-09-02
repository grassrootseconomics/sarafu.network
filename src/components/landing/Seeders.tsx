"use client";

import { Eye, Loader2, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { trpc } from "~/lib/trpc";
import { ImageWithFallback } from "./ImageWithFallback";

interface FeaturedPool {
  address: string;
  title: string;
  location: string;
  cause: string;
  image: string | null;
  tags: string[];
  swap_count: number;
}

export function Seeders() {
  const {
    data: featuredPools,
    isLoading,
    error,
  } = trpc.pool.featuredPools.useQuery({ limit: 3 });

  const filterTags = ["Urgent", "Eco", "Women-led", "Education", "Agriculture"];

  return (
    <section id="seeders" className="py-6 md:py-12">
      <div className="mx-auto px-4">
        {/* Mobile: Image first */}
        <div className="lg:hidden flex items-center justify-center mb-6">
          <div className="w-full max-w-sm">
            <Image
              src={"/home/supporters-image.png"}
              alt="Community supporters and stakeholders planning and strategizing - representing collaborative impact and support"
              width={400}
              height={300}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Mobile: Title and description second */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-[#E86A2C] font-[Taviraj]">
            Supporters
          </h2>
          <div className="text-muted-foreground max-w-4xl mx-auto space-y-4">
            <p className="text-base sm:text-lg lg:text-xl font-semibold">
              Your support fuels local change.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground">
              Browse impact-driven pools and choose how you&apos;d like to
              support. Some pools offer rewards, others focus on pure impact.
              Either way, you&apos;ll get updates and insights along the way.
            </p>
          </div>
        </div>

        {/* Two-column layout - Desktop only */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left Column: Supporters Community Image - Desktop only */}
            <div className="hidden lg:flex items-center justify-center min-h-full">
              <div className="w-full max-w-md">
                <Image
                  src={"/home/supporters-image.png"}
                  alt="Community supporters and stakeholders planning and strategizing - representing collaborative impact and support"
                  width={400}
                  height={300}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>

            {/* Right Column: Explore Local Projects */}
            <div>
              <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                    <Eye className="w-5 h-5" />
                    Real communities, real impact
                  </CardTitle>
                  <p className="text-base lg:text-lg text-muted-foreground">
                    Explore Local Projects
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Quick Filters */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {filterTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors border-orange text-orange"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Featured Pools */}
                  <div className="space-y-4 mb-8">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading featured pools...
                        </span>
                      </div>
                    ) : error ? (
                      <div className="text-center p-8">
                        <p className="text-sm text-muted-foreground">
                          Unable to load pools. Please try again later.
                        </p>
                      </div>
                    ) : featuredPools && featuredPools.length > 0 ? (
                      featuredPools.map((pool: FeaturedPool) => (
                        <Link
                          key={pool.address}
                          href={`/pools/${pool.address}`}
                        >
                          <div className="flex gap-4 p-3 rounded-lg hover:bg-background/50 transition-colors cursor-pointer">
                            <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={pool.image || "/placeholder-pool.jpg"}
                                alt={pool.title}
                                width={64}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {pool.location}
                                </Badge>

                                {pool.tags.map((tag: string, index: number) => (
                                  <Badge
                                    key={`${pool.address}-tag-${index}`}
                                    variant="outline"
                                    className="text-xs border-orange text-orange"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <h4 className="font-semibold text-xs sm:text-sm mb-1">
                                {pool.title}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {pool.cause}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center p-8">
                        <p className="text-sm text-muted-foreground">
                          No featured pools with images available right now.
                          Check back later!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <p className="text-muted-foreground text-sm text-center">
                      Use card or crypto, with or without rewards.
                    </p>

                    <Button
                      size="lg"
                      asChild
                      className="bg-[rgba(181,175,52,1)] hover:bg-[#6A642A] transition-colors"
                    >
                      <Link href="/pools">
                        <Search className="w-4 h-4 mr-2" />
                        Explore
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
