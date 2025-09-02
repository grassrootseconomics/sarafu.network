"use client";

import { Loader2, MapPin, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { trpc } from "~/lib/trpc";
import { ImageWithFallback } from "./ImageWithFallback";

interface NearbyOffer {
  id: number;
  title: string;
  description: string;
  provider: string;
  distance: string;
  vouchers: (string | null)[];
  image: string;
  trending: boolean;
  price: number | null;
  voucher_address: string | null;
  voucher_icon: string | null;
}

export function VoucherUsers() {
  const {
    data: nearbyOffers,
    isLoading,
    error,
  } = trpc.products.nearbyOffers.useQuery({ limit: 3 });

  return (
    <section id="voucher-users" className="py-6 md:py-12">
      <div className="mx-auto px-4">
        {/* Mobile: Image first */}
        <div className="lg:hidden flex items-center justify-center mb-6">
          <div className="w-full max-w-sm">
            <Image
              src={"/home/community-vouchers-image.png"}
              alt="Community members exchanging vouchers - representing local commerce and value exchange"
              width={400}
              height={300}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Mobile: Title and description second */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-[#B5AF34] font-[Taviraj]">
            Voucher Users
          </h2>
          <div className="text-muted-foreground max-w-4xl mx-auto space-y-4">
            <p className="text-base sm:text-lg lg:text-xl font-semibold">
              Swap your vouchers in pools, redeem them for local products, or
              gift them forward.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground">
              You can think of a voucher as a gift card or digital credit that
              represents value within a community. Members earn vouchers by
              contributing goods or services to a pool, and spend them to access
              other members&apos; offerings. Vouchers keep value circulating
              locally, strengthen community trade. See what&apos;s new in your
              network.
            </p>
          </div>
        </div>

        {/* Two-column layout - Desktop only */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left Column: What's Available Near You */}
            <div>
              <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                    <MapPin className="w-5 h-5" />
                    What&apos;s Available Near You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-8">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading nearby offers...
                        </span>
                      </div>
                    ) : error ? (
                      <div className="text-center p-8">
                        <p className="text-sm text-muted-foreground">
                          Unable to load offers. Please try again later.
                        </p>
                      </div>
                    ) : nearbyOffers && nearbyOffers.length > 0 ? (
                      nearbyOffers.map((offer: NearbyOffer) => (
                        <div
                          key={offer.id}
                          className="flex gap-4 p-3 rounded-lg hover:bg-background/50 transition-colors cursor-pointer"
                        >
                          <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={offer.image || "/placeholder-product.jpg"}
                              alt={offer.title}
                              width={64}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 flex w-full justify-between">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <h4 className="font-semibold text-xs sm:text-sm">
                                  {offer.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {offer.description}
                                </p>
                                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3 text-muted-foreground" />

                                  {offer.provider}
                                </p>
                              </div>
                              {offer.trending && (
                                <Badge className="text-xs">Trending</Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-base text-muted-foreground">
                                {offer.distance}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-8">
                        <p className="text-sm text-muted-foreground">
                          No offers with images available right now. Check back
                          later!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      disabled
                      asChild
                      className="flex-1 bg-[rgba(181,175,52,1)] hover:bg-[#6A642A] transition-colors"
                    >
                      <Link href="/marketplace">
                        <Wallet className="w-4 h-4 mr-2" />
                        Explore
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Community Vouchers Image - Desktop only */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-full max-w-md">
                <Image
                  src={"/home/community-vouchers-image.png"}
                  alt="Community members exchanging vouchers - representing local commerce and value exchange"
                  width={400}
                  height={300}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
