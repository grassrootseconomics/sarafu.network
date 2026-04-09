import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = (
  ...args: Parameters<typeof Sentry.captureRequestError>
) => {
  const error = args[0];
  if (
    error instanceof Error &&
    "code" in error &&
    (error as Error & { code: string }).code === "FORBIDDEN"
  ) {
    return;
  }
  Sentry.captureRequestError(...args);
};
