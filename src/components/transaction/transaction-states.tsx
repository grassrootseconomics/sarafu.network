import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useTransactionReceipt } from "wagmi";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { celoscanUrl } from "~/utils/celo";

export type TransactionState = "idle" | "pending" | "success" | "error";

interface PendingStateProps {
  title?: string;
  description?: string;
}

export function PendingState({
  title = "Transaction Pending",
  description = "Please wait while your transaction is being processed...",
}: PendingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

interface SuccessStateProps {
  title?: string;
  description?: string;
  txHash?: string | null;
  onClose?: () => void;
  viewTxLabel?: string;
  closeLabel?: string;
}

export function SuccessState({
  title = "Transaction Successful",
  description = "Your transaction has been successfully processed.",
  txHash = null,
  onClose,
  viewTxLabel = "View Transaction",
  closeLabel = "Close",
}: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <CheckCircle className="h-16 w-16 text-green-500" />
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {description}
      </p>
      {txHash && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.open(celoscanUrl.tx(txHash), "_blank")}
        >
          {viewTxLabel}
        </Button>
      )}
      {onClose && (
        <Button className="mt-2" onClick={onClose}>
          {closeLabel}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  errorMessage?: string | null;
  onRetry?: () => void;
  onClose?: () => void;
  retryLabel?: string;
  closeLabel?: string;
}

export function ErrorState({
  errorMessage = "An error occurred while processing your transaction.",
  onRetry,
  onClose,
  retryLabel = "Try Again",
  closeLabel = "Close",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
      <div className="flex gap-2">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        {onClose && (
          <Button variant="destructive" onClick={onClose}>
            {closeLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

interface TransactionStateManagerProps {
  txHash?: string | null;
  pendingProps?: Omit<PendingStateProps, "state">;
  successProps?: Omit<SuccessStateProps, "state" | "txHash">;
  errorProps?: Omit<ErrorStateProps, "state">;
  onClose?: () => void;
  onRetry?: () => void;
  fallback?: React.ReactNode;
}

/**
 * A component that automatically manages transaction state display based on transaction receipt
 */
export function TransactionStateManager({
  txHash,
  pendingProps,
  successProps,
  errorProps,
  onClose,
  onRetry,
  fallback = null,
}: TransactionStateManagerProps) {
  const {
    data: receipt,
    isLoading,
    isError,
    error,
  } = useTransactionReceipt({
    hash: txHash ? (txHash as `0x${string}`) : undefined,
  });

  // If no transaction hash is provided, show fallback
  if (!txHash) return <>{fallback}</>;

  // Show pending state while loading
  if (isLoading) {
    return <PendingState {...pendingProps} />;
  }

  // Show error state if there's an error
  if (isError) {
    return (
      <ErrorState
        errorMessage={error?.message || "Failed to fetch transaction receipt"}
        onRetry={onRetry}
        onClose={onClose}
        {...errorProps}
      />
    );
  }

  // Show success state if we have a receipt
  if (receipt) {
    // Check if transaction was successful
    if (receipt.status === "success") {
      return (
        <SuccessState txHash={txHash} onClose={onClose} {...successProps} />
      );
    } else {
      // Transaction failed on-chain
      return (
        <ErrorState
          errorMessage="Transaction failed on-chain"
          onRetry={onRetry}
          onClose={onClose}
          {...errorProps}
        />
      );
    }
  }

  // Fallback to pending state if we don't have a receipt yet
  return <PendingState {...pendingProps} />;
}
