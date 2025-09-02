import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function ServiceProviders() {
  const steps = [
    "Create vouchers for your services or products",
    "Set your own terms and redemption rules",
    "Build trust through community verification",
    "Access credit lines through pool participation",
    "Start accepting vouchers for services",
  ];

  // const featuredProviders = [
  //   {
  //     id: 1,
  //     name: "Maria's Kitchen",
  //     voucher: "Fresh Meals",
  //     logo: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=80&h=80&fit=crop&crop=face",
  //     activity: "120 vouchers redeemed this month",
  //     rating: 4.9,
  //     category: "Food",
  //   },
  //   {
  //     id: 2,
  //     name: "Tech Repair Hub",
  //     voucher: "Mobile Services",
  //     logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  //     activity: "85 devices repaired",
  //     rating: 4.8,
  //     category: "Technology",
  //   },
  //   {
  //     id: 3,
  //     name: "Green Learning",
  //     voucher: "Eco Education",
  //     logo: "https://images.unsplash.com/photo-1494790108755-2616b612b633?w=80&h=80&fit=crop&crop=face",
  //     activity: "200+ students taught",
  //     rating: 5.0,
  //     category: "Education",
  //   },
  // ];

  return (
    <section id="service-providers" className="py-6 md:py-12">
      <div className="mx-auto px-4">
        {/* Mobile: Image first */}
        <div className="lg:hidden flex items-center justify-center mb-6">
          <div className="w-full max-w-sm">
            <img
              src={"/home/service-providers-image.png"}
              alt="Community members raising hands to share services and offerings, representing collaborative service provision"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Mobile: Title and description second */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-[#6A642A] font-[Taviraj]">
            Service Providers
          </h2>
          <div className="text-muted-foreground max-w-4xl mx-auto space-y-4">
            <p className="text-base sm:text-lg lg:text-xl font-semibold">
              Turn your skills or services into value.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground">
              Whether you&apos;re offering food, education, or mobile repair—you
              can issue vouchers, get support, and build trust over time.
            </p>
          </div>
        </div>

        {/* Two-column layout - Desktop only */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left Column: Community Illustration Image - Desktop only */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-full max-w-md">
                <img
                  src={"/home/service-providers-image.png"}
                  alt="Community members raising hands to share services and offerings, representing collaborative service provision"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>

            {/* Right Column: Voucher Creation Process */}
            <div>
              <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                    <Plus className="w-5 h-5" />
                    Create a Voucher - Service Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-8">
                    {steps.map((stepText, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[rgba(181,175,52,1)] text-primary-foreground flex items-center justify-center text-sm font-medium">
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
                      className="flex-1 bg-[rgba(181,175,52,1)] hover:bg-[#6A642A] transition-colors"
                      asChild
                    >
                      <Link
                        href="/vouchers/create"
                        className="flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create a Voucher
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Featured Providers */}
          {/* <div className="max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-medium text-center mb-8">
              Trusted Providers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProviders.map((provider) => (
                <Card
                  key={provider.id}
                  className="border-border/50 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <ImageWithFallback
                          src={provider.logo}
                          alt={provider.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm lg:text-base font-semibold">
                          {provider.name}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-xs lg:text-sm">
                            {provider.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Voucher:
                        </span>
                        <Badge variant="secondary">{provider.voucher}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Category:
                        </span>
                        <Badge
                          variant="outline"
                          className="border-orange text-orange"
                        >
                          {provider.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span>{provider.activity}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
