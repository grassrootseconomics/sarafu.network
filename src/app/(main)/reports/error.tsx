"use client"; // Error components must be Client Components

import {
  ExclamationTriangleIcon,
  LockClosedIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { ConnectButton } from "~/components/buttons/connect-button";
import { ContentContainer } from "~/components/layout/content-container";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Detects if the error is an authorization/forbidden error
 * Checks error message, name, and digest for common patterns
 * Also checks for tRPC error codes
 */
function isAuthorizationError(error: Error & { digest?: string }): boolean {
  const message = error.message?.toLowerCase() ?? "";
  const digest = error.digest?.toLowerCase() ?? "";
  const name = error.name?.toLowerCase() ?? "";
  const errorString = error.toString().toLowerCase();

  const authPatterns = [
    "permission",
    "forbidden",
    "unauthorized",
    "not authorized",
    "access denied",
  ];

  return authPatterns.some(
    (pattern) =>
      message.includes(pattern) ||
      digest.includes(pattern) ||
      name.includes(pattern) ||
      errorString.includes(pattern)
  );
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const auth = useAuth();
  const isAuthenticated = auth !== null;

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Report error:", {
      message: error.message,
      digest: error.digest,
      name: error.name,
      stack: error.stack,
    });
  }, [error]);

  const isAuthError = useMemo(() => isAuthorizationError(error), [error]);

  // Authorization error - show appropriate UI based on auth state
  if (isAuthError) {
    if (!isAuthenticated) {
      // Not authenticated - show sign in prompt
      return (
        <ContentContainer>
          <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] px-4 max-w-md mx-auto">
            <div className="rounded-full bg-muted p-6 mb-8">
              <LockClosedIcon className="h-12 w-12 text-muted-foreground" />
            </div>

            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Sign In Required
            </h2>

            <p className="mb-8 text-muted-foreground">
              This report requires you to be signed in. Connect your wallet to
              continue.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <ConnectButton className="w-full sm:w-auto" />
              <Link href="/reports" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  Go to Reports
                </Button>
              </Link>
            </div>
          </div>
        </ContentContainer>
      );
    }

    // Authenticated but forbidden - show access denied
    return (
      <ContentContainer>
        <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] px-4 max-w-md mx-auto">
          <div className="rounded-full bg-muted p-6 mb-8">
            <LockClosedIcon className="h-12 w-12 text-muted-foreground" />
          </div>

          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Access Denied
          </h2>

          <p className="mb-8 text-muted-foreground">
            You don&apos;t have permission to view this report. It may be a
            draft or pending approval.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/reports" className="w-full sm:w-auto">
              <Button variant="default" className="w-full">
                Go to Reports
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </ContentContainer>
    );
  }

  // Generic error - show existing behavior
  return (
    <ContentContainer>
      <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] px-4 max-w-md mx-auto">
        <div className="rounded-full bg-destructive/10 p-6 mb-8">
          <ExclamationTriangleIcon className="h-12 w-12 text-destructive" />
        </div>

        <h2 className="text-3xl font-bold mb-4 text-foreground">
          Something Went Wrong
        </h2>

        <p className="mb-6 text-muted-foreground">
          {error.message ||
            "An unexpected error occurred while processing your request."}
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
          <Link href="/reports" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Go to Reports
            </Button>
          </Link>
        </div>
      </div>
    </ContentContainer>
  );
}
