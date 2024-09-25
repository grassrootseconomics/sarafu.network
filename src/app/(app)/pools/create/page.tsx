import { type Metadata } from "next";
import Image from "next/image";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { ContentContainer } from "~/components/layout/content-container";
import { CreatePoolForm } from "~/components/pools/forms/create-pool-form";
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
    <ContentContainer title="Create Pool">
      <BreadcrumbResponsive
        items={[
          { label: "Home", href: "/" },
          { label: "Pools", href: "/pools" },
          { label: "Create Pool" },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 py-12 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <Image
              className="mx-auto mb-8"
              src="/pools/create-pool.png"
              alt="Create Pool"
              width={400}
              height={400}
            />
            <h1 className="mb-6 text-3xl font-semibold text-primary">
              Create Your Own Pool
            </h1>
            <div className="space-y-4 text-gray-600">
              <p>
                Empower your community by curating your own commitment pool.
                With our intuitive tools, you can easily set up and manage a
                pool tailored to your community&apos;s needs.
              </p>
              <p>
                Create opportunities for access to credit, trade, and
                collaboration among local businesses.
              </p>
              <p>
                Join us in fostering economic empowerment and growth in your
                community. Start creating your pool today!
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <CreatePoolForm />
          </div>
        </div>
      </div>
    </ContentContainer>
  );
}
