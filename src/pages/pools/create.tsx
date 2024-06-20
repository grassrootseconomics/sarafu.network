import Head from "next/head";
import Image from "next/image";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { Icons } from "~/components/icons";
import { ContentContainer } from "~/components/layout/content-container";
import { CreatePoolForm } from "~/components/pools/forms/create-pool-form";

export default function CreatePoolPage() {
  
  return (
    <ContentContainer title={"Create Pool"} Icon={Icons.pools}>
      <BreadcrumbResponsive
        items={[
          {
            label: "Home",
            href: "/",
          },
          { label: "Pools", href: "/pools" },
          { label: "Create Pool" },
        ]}
      />
      <div className="mx-1 sm:mx-2">
        <Head>
          <title>Create Your Own Pool</title>
          <meta
            name="description"
            content="Create your own pool on the network."
            key="desc"
          />
          <meta property="og:title" content="Create Your Own Pool" />
          <meta
            property="og:description"
            content="Create your own pool on the network."
          />
        </Head>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-auto mx-auto">
          <h1 className="text-3xl md:col-span-2 text-primary font-poppins my-4 text-center font-semibold">
            Create Your Own Pool
          </h1>
          <div>
            <p className="text-normal text-gray-500 py-4">
              Empower your community by curating your own commitment pool. With
              our intuitive tools, you can easily set up and manage a pool
              tailored to your community's needs. Create opportunities for
              access to credit, trade, and collaboration among local businesses.
              Join us in fostering economic empowerment and growth in your
              community. Start creating your pool today
            </p>
            <Image
              className="py-8"
              src="/pools/create-pool.png"
              alt="Create Pool"
              width={400}
              height={400}
            />
          </div>
          <CreatePoolForm />
        </div>
      </div>
    </ContentContainer>
  );
}
