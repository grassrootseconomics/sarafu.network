import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import Script from "next/script";
import { notFound } from "next/navigation";
import { type Metadata } from "next/types";
import Sidebar from "~/components/layout/sidebar";
import { Toaster as Sonner } from "~/components/ui/sonner";
import ContextProvider from "~/context";
import { type Locale, locales } from "~/i18n/config";
import { fontPoppins, fontSans } from "~/lib/fonts";
import "../../../styles/global.css";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });

  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const cookies = (await headers()).get("cookie");
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${fontPoppins.variable} ${fontSans.variable} font-sans `}
      >
        <Script
          data-website-id="530e771e-3248-42fa-b8b8-e14433a28ede"
          src="https://analytics.grassecon.net/kilifi"
        />
        <Sonner />
        <NextIntlClientProvider messages={messages}>
          <ContextProvider cookies={cookies}>
            <Sidebar>{children}</Sidebar>
          </ContextProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}