"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface NFCErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

interface NFCErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: string) => void;
}

export class NFCErrorBoundary extends Component<NFCErrorBoundaryProps, NFCErrorBoundaryState> {
  constructor(props: NFCErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<NFCErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorMessage = `NFC Error: ${error.message}\n${errorInfo.componentStack}`;
    
    // Log error for debugging
    console.error("NFC Error Boundary caught an error:", error, errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorMessage);
    
    this.setState({
      errorInfo: errorMessage,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              NFC Operation Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              An error occurred while using NFC functionality. This could be due to:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Browser compatibility issues</li>
              <li>NFC permissions not granted</li>
              <li>Hardware not supported</li>
              <li>Network connectivity problems</li>
            </ul>
            
            {this.state.error && (
              <details className="text-sm">
                <summary className="cursor-pointer font-medium">Error Details</summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
                size="sm"
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default NFCErrorBoundary;