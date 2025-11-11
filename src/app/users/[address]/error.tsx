"use client"; // Error components must be Client Components

import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useEffect } from "react";
import { ContentContainer } from "~/components/layout/content-container";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function UserProfileError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("User profile error:", error);
  }, [error]);

  return (
    <ContentContainer>
      <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] px-4 max-w-md mx-auto">
        <div className="rounded-full bg-destructive/10 p-6 mb-8">
          <ExclamationTriangleIcon className="h-12 w-12 text-destructive" />
        </div>

        <h2 className="text-3xl font-bold mb-4 text-foreground">
          Unable to Load Profile
        </h2>

        <p className="mb-6 text-muted-foreground">
          {error.message ||
            "An unexpected error occurred while loading this user profile."}
        </p>

        {error.digest && (
          <Alert variant="destructive" className="mb-8 text-left">
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="font-mono text-xs break-all">
              {error.digest}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            onClick={() => reset()}
            variant="default"
            className="w-full flex items-center justify-center gap-2"
          >
            <ReloadIcon className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </ContentContainer>
  );
}
