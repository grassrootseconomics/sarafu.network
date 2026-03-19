import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAddress, isAddress } from "viem";
import { ProfilePageClient } from "~/components/profile/profile-page-client";
import { getAddressFromENS, getENSFromAddress } from "~/lib/sarafu/resolver";

type Props = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
async function loadAddress(data: string) {
  if (isAddress(data)) {
    return getAddress(data);
  } else {
    const resolved = await getAddressFromENS({ ensName: data });
    if (resolved) {
      return getAddress(resolved.address);
    } else {
      throw new Error("Invalid address or ENS name");
    }
  }
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  try {
    const address = await loadAddress(params.address);
    const ens = await getENSFromAddress({ address });
    const displayName = ens?.name || address.slice(0, 10) + "...";
    const description = `User profile for ${displayName} on the Sarafu Network. View their transaction history, vouchers, pools, and more.`;

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
  const address = await loadAddress(params.address);

  // Validate address format
  if (!address || !isAddress(address)) {
    redirect("/");
  }

  try {
    return <ProfilePageClient address={address} />;
  } catch {
    // User not found or other error
    notFound();
  }
}
