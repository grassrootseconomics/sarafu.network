import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ContentContainer } from "~/components/layout/content-container";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  const t = useTranslations("reports.notFound");
  const tNav = useTranslations("navigation");
  const tButtons = useTranslations("buttons");
  
  return (
    <ContentContainer>
      <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] px-4 max-w-md mx-auto">
        <div className="rounded-full bg-muted p-6 mb-8">
          <ExclamationTriangleIcon className="h-12 w-12 text-muted-foreground" />
        </div>

        <h2 className="text-3xl font-bold mb-4 text-foreground">
          {t("title")}
        </h2>

        <p className="mb-8 text-muted-foreground">
          {t("description")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/reports" className="w-full sm:w-auto">
            <Button variant="default" className="w-full">
              {t("returnTo")} {tNav("reports")}
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              {t("goTo")} {tNav("dashboard")}
            </Button>
          </Link>
        </div>
      </div>
    </ContentContainer>
  );
}
