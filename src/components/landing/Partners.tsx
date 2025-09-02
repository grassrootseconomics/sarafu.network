import { cn } from "~/lib/utils";

const mediaPartners = [
  { name: "BBC News", logo: "/media/bbc.png" },
  { name: "Al Jazeera", logo: "/media/aljazeera.png" },
  { name: "Bloomberg", logo: "/media/bloomberg.png" },
];

const organizationalPartners = [
  "Celo",
  "TechSeed Trust",
  "Kenya Community Development Foundation",
  "Schumacher Center for New Economics",
];

export function Partners() {
  return (
    <section className="py-12">
      <div className="mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Combined Media and Organizational Partners for Mobile */}
          <div className="block md:hidden">
            <div className="text-center">
              <p className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground mb-4">
                As Seen In
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 mb-6">
                {mediaPartners.map((partner, index) => (
                  <div key={index}>
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className={cn(
                        `w-32 h-auto object-contain`,
                        partner.name === "BBC News" && "max-h-14"
                      )}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground mb-4">
                Our Partners
              </p>
              <div className="flex flex-wrap justify-center items-center gap-3">
                {organizationalPartners.map((partner, index) => (
                  <div
                    key={index}
                    className="text-xs sm:text-sm font-medium text-[#004844] opacity-60 hover:opacity-100 transition-opacity px-2 py-1 border border-border/30 rounded-full bg-[#B5AF34]/5 hover:bg-[#B5AF34]/10"
                  >
                    {partner}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Layout - Separate Sections */}
          <div className="hidden md:block">
            {/* As Seen In - Media Partners */}
            <div className="text-center mb-8">
              <p className="text-sm uppercase tracking-wider text-muted-foreground mb-6">
                As Seen In
              </p>
              <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-16">
                {mediaPartners.map((partner, index) => (
                  <div key={index}>
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className={cn(
                        "w-52 h-auto object-contain",
                        partner.name === "BBC News" && "max-h-20"
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-border"></div>
              <div className="px-4">
                <div className="w-2 h-2 bg-[#E86A2C] rounded-full"></div>
              </div>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* Organizational Partners */}
            <div className="text-center">
              <p className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                Our Partners
              </p>
              <div className="flex flex-wrap justify-center items-center gap-6">
                {organizationalPartners.map((partner, index) => (
                  <div
                    key={index}
                    className="text-sm lg:text-base font-medium text-[#004844] opacity-60 hover:opacity-100 transition-opacity px-3 py-1 border border-border/30 rounded-full bg-[#B5AF34]/5 hover:bg-[#B5AF34]/10"
                  >
                    {partner}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
