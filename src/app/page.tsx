import { CallToAction } from "../components/landing/CallToAction";
import { CommunityImpact } from "../components/landing/CommunityImpact";
import { Features } from "../components/landing/Features";
import { Footer } from "../components/landing/Footer";
import { Hero } from "../components/landing/Hero";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Partners } from "../components/landing/Partners";
import { RoleSeparator } from "../components/landing/RoleSeparator";
import { Seeders } from "../components/landing/Seeders";
import { ServiceProviders } from "../components/landing/ServiceProviders";
import { Stewards } from "../components/landing/Stewards";
import { VoucherUsers } from "../components/landing/VoucherUsers";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero
        poolCount={30}
        memberCount={3500}
        transactionCount={1200000}
        valueCount={1000000}
      />
      <HowItWorks />
      {/* <MobileAccessibility /> - Hidden for now but kept for potential future use */}
      {/* User Group Sections */}
      <div>
        <Stewards />
        <RoleSeparator />
        <ServiceProviders />
        <RoleSeparator />
        <VoucherUsers />
        <RoleSeparator />
        <Seeders />
      </div>
      <CommunityImpact />
      <Features />
      <Partners />
      <CallToAction />
      <Footer />
    </div>
  );
}
