import { PersonIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { ContentContainer } from "~/components/layout/content-container";
import { Button } from "~/components/ui/button";

export default function UserNotFound() {
  return (
    <ContentContainer>
      <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] px-4 max-w-md mx-auto">
        <div className="rounded-full bg-muted p-6 mb-8">
          <PersonIcon className="h-12 w-12 text-muted-foreground" />
        </div>

        <h2 className="text-3xl font-bold mb-4 text-foreground">
          User Not Found
        </h2>

        <p className="mb-8 text-muted-foreground">
          The user profile you are looking for does not exist or has not been
          registered on the Sarafu Network.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="default" className="w-full">
              Go Home
            </Button>
          </Link>
          <Link href="/vouchers" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Browse Vouchers
            </Button>
          </Link>
        </div>
      </div>
    </ContentContainer>
  );
}
