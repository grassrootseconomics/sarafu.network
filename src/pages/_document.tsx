import {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentProps,
} from "next/document";
import { cn } from "~/lib/utils";

export default function MyDocument(_props: DocumentProps) {
  return (
    <Html lang="en">
      <Head>
        {/* PWA primary color */}
        {/* <meta name="theme-color" content={theme.palette.primary.main} /> */}
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body className={cn("min-h-screen bg-background antialiased")}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
