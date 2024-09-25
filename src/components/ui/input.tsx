"use client"

import * as React from "react";
import { cn } from "~/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      type,
      startAdornment,
      endAdornment,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("relative", containerClassName)}>
        {startAdornment && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            {startAdornment}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            startAdornment && "pl-10", // Add padding-left if startAdornment exists
            endAdornment && "pr-10", // Add padding-right if endAdornment exists
            className
          )}
          ref={ref}
          {...props}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
