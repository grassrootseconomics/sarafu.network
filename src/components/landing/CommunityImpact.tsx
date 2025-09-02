import { Badge } from "~/components/ui/badge";

export function CommunityImpact() {
  return (
    <section id="impact" className="py-16">
      <div className="mx-auto px-4">
        {/* Enhanced Testimonial with Real Image */}
        <div className="bg-accent/50 rounded-2xl overflow-hidden max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Column */}
            <div className="aspect-square lg:aspect-auto relative">
              <img
                src={"/home/testimonial-image.png"}
                alt="Community member standing in front of Sarafu Network informational posters"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Column */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <blockquote className="text-lg sm:text-xl lg:text-2xl mb-8 italic leading-relaxed">
                &quot;Sarafu has transformed how our community trades and
                supports each other. Even during tough times, we can continue
                commerce and help our neighbors. The vouchers keep value
                circulating within our community.&quot;
              </blockquote>
              <div>
                <div className="font-semibold text-base lg:text-lg">
                  Joseph Kimani
                </div>
                <div className="text-sm lg:text-base text-muted-foreground">
                  Community Leader & Local Business Owner
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground mt-1">
                  Using Sarafu Network since 2019
                </div>
              </div>

              {/* Additional context */}
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="outline">Community Markets</Badge>
                <Badge variant="outline">Vulnerable Projects</Badge>
                <Badge variant="outline">Local Trade</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
