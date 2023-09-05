import {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentProps,
} from "next/document";
import { fontSans } from "~/lib/fonts";
import { cn } from "~/lib/utils";

export default function MyDocument(_props: DocumentProps) {
  return (
    <Html lang="en">
      <Head>
        {/* PWA primary color */}
        {/* <meta name="theme-color" content={theme.palette.primary.main} /> */}
        {(process.env.NODE_ENV === "development" ||
          process.env.VERCEL_ENV === "preview") && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            data-project-id="fgfmV6pTlYg189SHj046diDyJAEthqm2TrWQYJEG"
            src="https://snippet.meticulous.ai/v1/meticulous.js"
          />
        )}
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
