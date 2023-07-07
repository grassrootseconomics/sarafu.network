import {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentProps,
} from "next/document";
import { fontSans } from "~/lib/fonts";
import { cn } from "~/lib/utils";

export default function MyDocument(props: DocumentProps) {
  return (
    <Html lang="en">
      <Head>
        {/* PWA primary color */}
        {/* <meta name="theme-color" content={theme.palette.primary.main} /> */}
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
