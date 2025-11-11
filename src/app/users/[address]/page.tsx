import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isAddress } from "viem";
import { ProfilePageClient } from "~/components/profile/profile-page-client";
import { caller } from "~/server/api/routers/_app";

type Props = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const address = params.address;

  // Validate address format
  if (!isAddress(address)) {
    return {
      title: "Invalid Address",
      description: "The provided address is not valid.",
    };
  }

  try {
    const profile = (await caller.profile.getPublicProfile({ address })) as {
      given_names: string | null;
      location_name: string | null;
      address: string;
      avatar: string | null;
    };

    const displayName = profile.given_names || address.slice(0, 10) + "...";
    const description = profile.location_name
      ? `${displayName} from ${profile.location_name}`
      : `User profile for ${displayName}`;

    return {
      title: `${displayName} - Sarafu Network`,
      description,
      openGraph: {
        title: displayName,
        description,
        url: `https://sarafu.network/users/${address}`,
        type: "profile",
      },
    };
  } catch {
    return {
      title: "User Not Found",
      description: "The requested user profile could not be found.",
    };
  }
}

export default async function UserProfilePage(props: {
  params: Promise<{ address: string }>;
}) {
  const params = await props.params;
  const address = params.address;

  // Validate address format
  if (!address || !isAddress(address)) {
    redirect("/");
  }

  try {
    // Fetch initial profile data server-side for SEO and initial render
    const profile = (await caller.profile.getPublicProfile({ address })) as {
      given_names: string | null;
      location_name: string | null;
      address: string;
      avatar: string | null;
    };

    return <ProfilePageClient address={address} initialProfile={profile} />;
  } catch {
    // User not found or other error
    notFound();
  }
}
