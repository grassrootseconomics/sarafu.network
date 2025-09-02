import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function Stewards() {
  const steps = [
    "Publish a pool (name, description, etc)",
    "Curate/approve vouchers",
    "Set values, limits and fees",
    "Launch, share, invite seeders",
    "Start swapping",
  ];

  return (
    <section id="stewards" className="py-6 md:py-12">
      <div className="mx-auto px-4">
        {/* Mobile: Image first */}
        <div className="lg:hidden flex items-center justify-center mb-6">
          <div className="w-full max-w-sm">
            <Image
              src={"/home/community-collab-image.png"}
              alt="Community collaboration - hands contributing to a shared bowl representing collective resource pooling"
              width={400}
              height={300}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Mobile: Title and description second */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-[#004844] font-[Taviraj]">
            Stewards
          </h2>
          <div className="text-muted-foreground max-w-4xl mx-auto space-y-4">
            <p className="text-base sm:text-lg lg:text-xl font-semibold">
              A pool steward is a trusted coordinator who manages and maintains
              a pool.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground">
              Stewards curate which vouchers and issuers are allowed into the
              pool, set reasonable credit limits, help members onboard and
              redeem vouchers, reward supporters, and connect to other pools in
              the network sharing common vouchers. In return for their services,
              stewards may set and collect small membership or transaction fees.
            </p>
          </div>
        </div>

        {/* Two-column layout - Desktop only */}
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left Column: Pool Creation Process */}
            <div>
              <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                    <Plus className="w-5 h-5" />
                    Start a Pool - Creation Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-8">
                    {steps.map((stepText, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="size-6 rounded-full bg-[rgba(181,175,52,1)] text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm lg:text-base text-foreground">
                          {stepText}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      asChild
                      className="flex-1 bg-[rgba(181,175,52,1)] hover:bg-[#6A642A] transition-colors"
                    >
                      <Link href="/pools/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create a Pool
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Community Collaboration Image - Desktop only */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-full max-w-md">
                <Image
                  src={"/home/community-collab-image.png"}
                  alt="Community collaboration - hands contributing to a shared bowl representing collective resource pooling"
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
