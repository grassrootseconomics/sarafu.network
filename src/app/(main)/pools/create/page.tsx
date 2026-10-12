import { type Metadata } from "next";
import { CreationDisabledPage } from "~/components/migration/creation-disabled-page";

export const metadata: Metadata = {
  title: "Create Pool - Sarafu Network",
  description: "New pools have moved to Cosmo-Local Credit.",
};

export default function CreatePoolPage() {
  return <CreationDisabledPage resource="pool" fallbackHref="/pools" />;
}
