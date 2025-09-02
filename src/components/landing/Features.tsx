import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const features = [
  {
    step: "01",
    title: "Community Driven",
    description:
      "Built by communities, for communities. Local governance and decision-making put power in the hands of users.",
  },
  {
    step: "02",
    title: "Open-Source & Non-Profit",
    description:
      "Built and stewarded by Grassroots Economics Foundation. Transparent, community-owned technology for economic agency.",
  },
  {
    step: "03",
    title: "Last-Mile",
    description: "Works with QR cards, NFC cards",
  },
  {
    step: "04",
    title: "Secure & Transparent",
    description:
      "Blockchain-based technology ensures transparency and security for all exchanges and community operations.",
  },
] as const;
export function Features() {
  return (
    <section id="features" className="py-16">
      <div className="mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Centered Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 font-[Taviraj]">
              Why Sarafu Network?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
              Sarafu Network empowers communities to build stronger, more
              resilient commons.
            </p>
          </div>

          <div className="flex flex-col-reverse  lg:flex-row gap-8 lg:gap-12">
            {/* Left Side - Features */}
            <div className="flex-1">
              {/* First Row - Features 1 and 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <Card className="h-full border-border/50">
                    <CardHeader className="pb-2">
                      <div className="text-3xl lg:text-4xl font-bold text-[#F79F46] font-heading">
                        {features[0].step}
                      </div>
                      <CardTitle className="text-lg lg:text-xl">
                        {features[0].title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm lg:text-base text-muted-foreground">
                        {features[0].description}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="h-full border-border/50">
                    <CardHeader className="pb-2">
                      <div className="text-3xl lg:text-4xl font-bold text-[#F79F46] font-heading">
                        {features[1].step}
                      </div>
                      <CardTitle className="text-lg lg:text-xl">
                        {features[1].title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm lg:text-base text-muted-foreground">
                        {features[1].description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Second Row - Features 3 and 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Card className="h-full border-border/50">
                    <CardHeader className="pb-2">
                      <div className="text-3xl lg:text-4xl font-bold text-[#F79F46] font-heading">
                        {features[2].step}
                      </div>
                      <CardTitle className="text-lg lg:text-xl">
                        {features[2].title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm lg:text-base text-muted-foreground">
                        {features[2].description}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="h-full border-border/50">
                    <CardHeader className="pb-2">
                      <div className="text-3xl lg:text-4xl font-bold text-[#F79F46] font-heading">
                        {features[3].step}
                      </div>
                      <CardTitle className="text-lg lg:text-xl">
                        {features[3].title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm lg:text-base text-muted-foreground">
                        {features[3].description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="flex-shrink-0 lg:w-64 flex items-center">
              <img
                src={"/home/features-image.png"}
                alt="Sarafu Network Features"
                className="w-full lg:w-64 mx-auto max-w-[300px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
