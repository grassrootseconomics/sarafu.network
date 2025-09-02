"use client";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";

function AnimatedNetworkGraphic() {
  const networkImages = [
    "/home/network-graphic-1.png",
    "/home/network-graphic-2.png",
    "/home/network-graphic-3.png",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % networkImages.length
      );
    }, 1800); // Change image every 1.8 seconds

    return () => clearInterval(interval);
  }, [networkImages.length]);

  return (
    <div className="relative w-full h-auto mx-auto mt-2 sm:mt-8">
      {networkImages.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Sarafu Network - Stage ${
            index + 1
          } of community interconnection`}
          className={`w-full h-auto mx-auto transition-opacity duration-1000 ${
            index === currentImageIndex
              ? "opacity-100"
              : "opacity-0 absolute top-0 left-1/2 -translate-x-1/2"
          }`}
        />
      ))}
    </div>
  );
}

export function Hero({
  poolCount = 30,
  memberCount = 3500,
  transactionCount = 1200000,
  valueCount = 1000000,
}: {
  poolCount: number;
  memberCount: number;
  transactionCount: number;
  valueCount: number;
}) {
  const roles = [
    {
      id: "stewards",
      icon: "/home/stewards-icon.png",
      title: "Stewards",
      description: "I want to create a commitment pool",
      href: "#stewards",
      titleColor: "text-[#004844]",
      iconBg: "bg-[#004844]",
    },
    {
      id: "service-providers",
      icon: "/home/service-providers-icon.png",
      title: "Service Providers",
      description: "I want to create vouchers to offer my goods or services",
      href: "#service-providers",
      titleColor: "text-[#6A642A]",
      iconBg: "bg-[#603511]",
    },
    {
      id: "voucher-users",
      icon: "/home/voucher-users-icon.png",
      title: "Voucher Users",
      description: "I want to send, swap or redeem my vouchers",
      href: "#voucher-users",
      titleColor: "text-[#B5AF34]",
      iconBg: "bg-[#6A642A]",
    },
    {
      id: "supporters",
      icon: "/home/supporters-icon.png",
      title: "Supporters",
      description: "I want to support a commitment pool",
      href: "#seeders",
      titleColor: "text-[#E86A2C]",
      iconBg: "bg-[#E86A2C]",
    },
  ];

  return (
    <section className="relative">
      {/* Hero Content */}
      <div className="px-2 sm:px-4 py-2 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col-reverse lg:flex-row gap-0 md:gap-6 lg:gap-12 items-center">
            <div className="text-center lg:text-left px-2 sm:px-0">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 font-[Taviraj] text-center lg:text-left">
                <span className="block sm:inline">Empowering communities</span>{" "}
                <span className="block sm:inline">
                  through{" "}
                  <span className="text-[#B5AF34]">commitment pooling</span>
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto lg:mx-0 lg:max-w-none text-center lg:text-left">
                Commitment pooling enables communities to create, manage and
                connect their own economic systems, fostering local trade and
                resilience.
              </p>

              <div className="mb-8 text-center lg:text-left">
                <button className="flex items-center gap-2 text-sm sm:text-base text-[#B5AF34] hover:text-[#6A642A] transition-colors group mx-auto lg:mx-0">
                  Learn more about commitment pooling
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#004844] mb-1">
                    {poolCount}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Pools
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#B5AF34] mb-1">
                    {memberCount.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Active Members
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#6A642A] mb-1">
                    {transactionCount.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    P2P Transactions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#E86A2C] mb-1">
                    {valueCount.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Value exchanged in USD
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Network Graphic */}
            <div className="flex justify-center lg:justify-center items-center max-w-2xl w-full max-h-[400px]">
              <AnimatedNetworkGraphic />
            </div>
          </div>

          {/* Role Selector */}
          <div className="mt-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 text-center font-[Taviraj] px-4">
              What brings you to Sarafu Network?
            </h2>

            <div className="max-w-4xl mx-auto mb-8 px-4">
              <p className="text-base sm:text-lg text-muted-foreground text-center">
                Offerings, registered as Community Asset vouchers by members,
                come together in shared commitment pools that work like virtual
                marketplaces and are managed by trusted stewards, allowing
                communities to seamlessly swap valuable goods and services.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:gap-4 md:grid md:grid-cols-4 ">
              {roles.map((role) => (
                <a key={role.id} href={role.href} className="block">
                  <Card className="h-full border-border/50 hover:shadow-lg hover:border-[#004844]/20 transition-all duration-200 cursor-pointer group">
                    <CardContent className="p-4 text-center pt-[14px] pr-[14px] pb-[5px] pl-[14px]">
                      <div
                        className={`w-20 h-20 ${role.iconBg} rounded-xl flex items-center justify-center mb-4 mx-auto`}
                      >
                        <img
                          src={role.icon}
                          alt={`${role.title} icon`}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      <h3 className="font-semibold text-base lg:text-lg mb-2 text-[#6A642A] transition-colors">
                        {role.title}
                      </h3>
                      <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                        {role.description}
                      </p>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
