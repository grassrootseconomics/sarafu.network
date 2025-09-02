import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/utils";

const mediaPartners = [
  {
    name: "BBC News",
    logo: "/media/bbc.png",
    link: "https://www.bbc.co.uk/programmes/p05zw020",
  },
  {
    name: "Al Jazeera",
    logo: "/media/aljazeera.png",
    link: "https://www.youtube.com/watch?v=UpCr8-3K05E",
  },
  {
    name: "Bloomberg",
    logo: "/media/bloomberg.png",
    link: "https://www.bloomberg.com/news/features/2018-10-31/closing-the-cash-gap-with-cryptocurrency",
  },
];

const organizationalPartners = [
  {
    name: "Celo Foundation",
    link: "https://celo.org/",
    logo: "/partners/celo.png",
  },
  {
    name: "Mustard Seed Trust",
    link: "https://mustardseedtrust.org/",
    logo: "/partners/mustardseed.png",
  },
  {
    name: "Kenya Red Cross",
    link: "https://www.redcross.or.ke/",
    logo: "/partners/kenya-red-cross.png",
  },
  {
    name: "Schumacher Center for New Economics",
    link: "https://www.schumachercenter.org/",
    logo: "/partners/schumacher-center.png",
  },
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
                  <Link key={index} href={partner.link} target="_blank">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={128}
                      height={56}
                      className={cn(
                        `w-32 h-auto object-contain`,
                        partner.name === "BBC News" && "max-h-14"
                      )}
                    />
                  </Link>
                ))}
              </div>
              <p className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground mb-4">
                Our Partners
              </p>
              <div className="flex flex-wrap justify-center items-center gap-3">
                {organizationalPartners.map((partner, index) => (
                  <Link key={index} href={partner.link} target="_blank">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={128}
                      height={56}
                      className="w-32 h-auto object-contain"
                    />
                  </Link>
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
                  <Link key={index} href={partner.link} target="_blank">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={208}
                      height={80}
                      className={cn(
                        "w-52 h-auto object-contain",
                        partner.name === "BBC News" && "max-h-20"
                      )}
                    />
                  </Link>
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
                  <Link key={index} href={partner.link} target="_blank">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={128}
                      height={56}
                      className="w-32 h-auto object-contain"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
