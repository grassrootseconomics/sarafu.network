"use client";

interface ErrorDisplayProps {
  errors: (string | undefined)[];
}

export function ErrorDisplay({ errors }: ErrorDisplayProps) {
  const error = errors.find(Boolean);
  
  if (!error) return null;

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-800 text-sm">{error}</p>
    </div>
  );
}