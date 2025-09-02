import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const steps = [
  {
    step: "01",
    title: "Join or Create",
    description:
      "Join an existing commitment pool or create your own with customizable rules and governance.",
  },
  {
    step: "02",
    title: "Earn & Trade",
    description:
      "Earn credit by providing goods and services, then spend them with other community members.",
  },
  {
    step: "03",
    title: "Build Networks",
    description:
      "Connect with other communities to expand exchange opportunities and strengthen bioregional economies.",
  },
  {
    step: "04",
    title: "Measure Impact",
    description:
      "Account for community health, transaction volume, and social impact through comprehensive analytics.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Side - Header Image */}
            <div className="flex-shrink-0 lg:w-64 flex items-center">
              <Image
                src={"/home/how-it-works.png"}
                alt="How it works"
                width={256}
                height={256}
                className="w-1/2 max-w-xs mx-auto lg:max-w-none lg:w-64"
              />
            </div>

            {/* Right Side - Steps */}
            <div className="flex-1">
              {/* First Row - Steps 1 and 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="relative">
                  <Card className="h-full border-border/50">
                    <CardHeader className="pb-2">
                      <div className="text-3xl lg:text-4xl font-bold text-[#E86A2C] font-heading">
                        {steps[0].step}
                      </div>
                      <CardTitle className="text-lg lg:text-xl">
                        {steps[0].title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm lg:text-base text-muted-foreground">
                        {steps[0].description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Arrow from Step 1 to Step 2 */}
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 translate-x-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-[#B5AF34] opacity-80" />
                  </div>
                </div>

                <div className="relative">
                  <Card className="h-full border-border/50">
                    <CardHeader className="pb-2">
                      <div className="text-3xl lg:text-4xl font-bold text-[#E86A2C] font-heading">
                        {steps[1].step}
                      </div>
                      <CardTitle className="text-lg lg:text-xl">
                        {steps[1].title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm lg:text-base text-muted-foreground">
                        {steps[1].description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Arrow from Step 2 to Step 3 */}
                  <div className="hidden md:block absolute -bottom-4 -left-6 transform translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-[#B5AF34] opacity-80 rotate-[135deg]" />
                  </div>
                </div>
              </div>

              {/* Second Row - Steps 3 and 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative">
                  <Card className="h-full border-border/50">
                    <CardHeader className="pb-2">
                      <div className="text-3xl lg:text-4xl font-bold text-[#E86A2C] font-heading">
                        {steps[2].step}
                      </div>
                      <CardTitle className="text-lg lg:text-xl">
                        {steps[2].title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm lg:text-base text-muted-foreground">
                        {steps[2].description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Arrow from Step 3 to Step 4 */}
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 translate-x-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-[#B5AF34] opacity-80" />
                  </div>
                </div>

                <div>
                  <Card className="h-full border-border/50">
                    <CardHeader className="pb-2">
                      <div className="text-3xl lg:text-4xl font-bold text-[#E86A2C] font-heading">
                        {steps[3].step}
                      </div>
                      <CardTitle className="text-lg lg:text-xl">
                        {steps[3].title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm lg:text-base text-muted-foreground">
                        {steps[3].description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
