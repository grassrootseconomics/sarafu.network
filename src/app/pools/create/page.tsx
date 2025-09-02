import { Play, Shield, TrendingUp, Users } from "lucide-react";
import { type Metadata } from "next";
import Image from "next/image";
import { ContentContainer } from "~/components/layout/content-container";
import { CreatePoolForm } from "~/components/pools/forms/create-pool-form";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
export const metadata: Metadata = {
  title: "Create Your Own Pool",
  description: "Create your own pool on the network.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
export default function CreatePoolPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/5">
      <ContentContainer title="Create Pool">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Main Content */}
          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left Side - Features and Benefits */}
            <div className="space-y-8">
              <div>
                <Image
                  src="/home/stewards-icon.png"
                  alt="Stewards icon"
                  width={200}
                  height={200}
                  className="w-[100px] h-[100px] max-w-xs mx-auto rounded-lg"
                />
                <h2 className="my-6 text-3xl font-bold text-gray-900 text-center">
                  Why Create a Pool?
                </h2>
                <div className="space-y-6">
                  <FeatureCard
                    icon={<Users className="h-8 w-8 text-primary/80" />}
                    title="Community Empowerment"
                    description="Enable your community to collaborate, trade, and support each other through a curated commitment pool tailored to local needs."
                  />
                  <FeatureCard
                    icon={<TrendingUp className="h-8 w-8 text-secondary/80" />}
                    title="Economic Growth"
                    description="Create opportunities for access to credit, trade, and business collaboration among neighbors and service providers."
                  />
                  <FeatureCard
                    icon={<Shield className="h-8 w-8 text-accent/80" />}
                    title="Secure & Transparent"
                    description="Built on blockchain technology with full transparency and security for all community transactions."
                  />
                </div>
              </div>

              {/* How it Works */}
              <Card className="border-2 border-secondary/20 bg-secondary/5 p-6">
                <h3 className="mb-4 text-xl font-semibold text-secondary">
                  How It Works
                </h3>
                <div className="space-y-3 text-sm text-secondary">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-secondary/80" />
                    <p>
                      Fill out the form with your pool details and community
                      focus
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-secondary/80" />
                    <p>
                      Smart contracts are deployed automatically on the
                      blockchain
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-secondary/80" />
                    <p>
                      Choose which vouchers and assets can be traded in your
                      pool
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-secondary/80" />
                    <p>
                      Community members can start collaborating and trading
                      immediately
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-start justify-center">
              <div className="w-full max-w-3xl">
                <CreatePoolForm />
              </div>
            </div>
          </div>

          {/* Bottom CTA Section */}
          <div className="mt-16 rounded-2xl bg-gray-50 p-8 text-center">
            <h3 className="mb-4 text-2xl font-bold text-gray-900">
              Need Help Getting Started?
            </h3>
            <p className="mb-6 text-gray-600">
              Check out our comprehensive guide and tutorial videos to learn how
              to create and manage your pool effectively.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button variant="outline" size="lg" asChild>
                <a
                  href="https://docs.grassecon.org/commons/sprout/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read Documentation
                </a>
              </Button>
              <Button size="lg" asChild>
                <a
                  href="https://youtu.be/F4hB4ikPQMQ"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Tutorial
                </a>
              </Button>
            </div>
          </div>
        </div>
      </ContentContainer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-l-4 border-l-primary/20 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  );
}
